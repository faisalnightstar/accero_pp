import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Wallet from '@/models/Wallet';
import PrintJob, { PrintFormat } from '@/models/PrintJob';
import DocumentRecord from '@/models/DocumentRecord';
import User from '@/models/User';
import { SERVICE_FEES, normalizeDocType } from '@/lib/wallet/constants';
import { isDocumentAlreadyPaid } from '@/lib/wallet/pricing';
import { logAuditEvent } from '@/lib/logger/audit';

export interface AuthorizePrintParams {
  userId: string;
  documentId?: string;
  documentType: string;
  cardIdentifier?: string;
  printJobId: string;
  printFormat?: PrintFormat;
  metadata?: Record<string, any>;
}

export interface AuthorizePrintResult {
  success: boolean;
  printJobId: string;
  transactionId?: string;
  fee: number;
  remainingBalance?: number;
  requiredFee?: number;
  currentBalance?: number;
  error?: {
    code: 'INSUFFICIENT_BALANCE' | 'UNAUTHORIZED' | 'INVALID_INPUT' | 'PRINT_ERROR';
    message: string;
  };
}

/**
 * Centralized Print Authorization & Billing Engine.
 * 
 * Rules:
 * 1. Validates user session and account status.
 * 2. Retrieves the fee strictly from server-side pricing configuration (never trusts client fee).
 * 3. Enforces idempotency: retries with identical printJobId return existing authorization without re-charging.
 * 4. Atomically validates wallet balance and deducts the fee with balance >= fee invariant.
 * 5. Appends immutable financial ledger transaction to the user's wallet.
 * 6. Creates a durable PrintJob record.
 * 7. Updates DocumentRecord printCount and lastPrintedAt timestamps.
 * 8. Returns authorization only after the financial transaction successfully commits.
 */
export async function authorizePrint({
  userId,
  documentId,
  documentType,
  cardIdentifier = '',
  printJobId,
  printFormat = 'CR80',
  metadata = {},
}: AuthorizePrintParams): Promise<AuthorizePrintResult> {
  if (!userId) {
    return {
      success: false,
      printJobId,
      fee: 0,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Please log in to print documents.',
      },
    };
  }

  const cleanPrintJobId = (printJobId || '').trim();
  if (!cleanPrintJobId) {
    return {
      success: false,
      printJobId: '',
      fee: 0,
      error: {
        code: 'INVALID_INPUT',
        message: 'Missing or invalid printJobId.',
      },
    };
  }

  const cleanDocType = normalizeDocType(documentType);
  const cleanCardId = (cardIdentifier || '').trim().toUpperCase();

  await connectToDatabase();

  const userObjectId = new mongoose.Types.ObjectId(userId);

  // 1. Verify user account status
  const user = await User.findById(userObjectId).lean();
  if (!user || (user as any).status === 'suspended') {
    return {
      success: false,
      printJobId: cleanPrintJobId,
      fee: 0,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Your account is suspended or invalid. Please contact support.',
      },
    };
  }

  // 2. IDEMPOTENCY CHECK: Check if printJobId was already authorized
  const existingJob = await PrintJob.findOne({ printJobId: cleanPrintJobId }).lean();
  if (existingJob) {
    if (existingJob.status === 'AUTHORIZED' || existingJob.status === 'COMPLETED') {
      const userWallet = await Wallet.findOne({ userId: userObjectId }).lean();
      return {
        success: true,
        printJobId: cleanPrintJobId,
        transactionId: existingJob.transactionId || cleanPrintJobId,
        fee: existingJob.fee,
        remainingBalance: userWallet ? userWallet.balance : 0,
      };
    }
  }

  // 3. SERVER-SIDE PRICING ENFORCEMENT & FREE REPRINT CHECK
  // Never accept fee supplied by the browser
  let fee = SERVICE_FEES[cleanDocType] ?? 20;

  // Check if document was already paid & saved for this user (Free Lifetime Reprints)
  if (cleanCardId) {
    const isPaid = await isDocumentAlreadyPaid(userId, cleanDocType, cleanCardId);
    if (isPaid) {
      fee = 0;
    }
  }

  // 4. ATOMIC BALANCE DEDUCTION & LEDGER CREATION (Only if fee > 0)
  let updatedWallet: any = null;

  if (fee > 0) {
    updatedWallet = await Wallet.findOneAndUpdate(
      {
        userId: userObjectId,
        balance: { $gte: fee }, // Invariant: balance cannot drop below 0
      },
      {
        $inc: {
          balance: -fee,
          totalDebited: fee,
        },
        $push: {
          transactions: {
            amount: fee,
            type: 'debit',
            category: 'DOCUMENT_PRINT',
            docType: cleanDocType as any,
            documentType: cleanDocType,
            documentId:
              documentId && mongoose.Types.ObjectId.isValid(documentId)
                ? new mongoose.Types.ObjectId(documentId)
                : undefined,
            referenceId: cleanPrintJobId,
            description: `${cleanDocType} Document Printing (${cleanCardId || 'Card Tray'})`,
            balanceBefore: 0, // updated below
            balanceAfter: 0,  // updated below
            status: 'COMPLETED',
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    // If deduction failed due to insufficient funds
    if (!updatedWallet) {
      const currentWallet = await Wallet.findOne({ userId: userObjectId }).lean();
      const currentBal = currentWallet ? currentWallet.balance : 0;

      return {
        success: false,
        printJobId: cleanPrintJobId,
        fee,
        requiredFee: fee,
        currentBalance: currentBal,
        error: {
          code: 'INSUFFICIENT_BALANCE',
          message: `Insufficient wallet balance. Printing a ${cleanDocType} card requires ₹${fee}. Your balance is ₹${currentBal}.`,
        },
      };
    }

    // Patch balanceBefore and balanceAfter on the newly pushed transaction
    if (updatedWallet.transactions && updatedWallet.transactions.length > 0) {
      const lastTx = updatedWallet.transactions[updatedWallet.transactions.length - 1];
      lastTx.balanceBefore = updatedWallet.balance + fee;
      lastTx.balanceAfter = updatedWallet.balance;
      await updatedWallet.save();
    }
  } else {
    // ₹0 Free Lifetime Reprint: retrieve current wallet without debit
    const walletQuery = Wallet.findOne({ userId: userObjectId });
    updatedWallet =
      typeof (walletQuery as any)?.lean === 'function'
        ? await walletQuery.lean()
        : await walletQuery;
  }

  // 5. CREATE DURABLE PRINT JOB RECORD
  const docObjectId =
    documentId && mongoose.Types.ObjectId.isValid(documentId)
      ? new mongoose.Types.ObjectId(documentId)
      : undefined;

  await PrintJob.create({
    printJobId: cleanPrintJobId,
    userId: userObjectId,
    documentId: docObjectId,
    documentType: cleanDocType,
    cardIdentifier: cleanCardId || 'DOCUMENT',
    fee,
    status: 'AUTHORIZED',
    printFormat,
    transactionId: cleanPrintJobId,
    metadata,
    authorizedAt: new Date(),
  });

  // 6. UPDATE DOCUMENT RECORD STATS
  if (docObjectId || cleanCardId) {
    const query: Record<string, any> = { userId: userObjectId, docType: cleanDocType };
    if (docObjectId) {
      query._id = docObjectId;
    } else if (cleanCardId) {
      query.cardIdentifier = cleanCardId;
    }

    await DocumentRecord.updateOne(query, {
      $inc: { printCount: 1 },
      $set: { lastPrintedAt: new Date() },
    });
  }

  // 7. SECURITY AUDIT LOGGING
  await logAuditEvent({
    actorId: userId,
    action: 'DOCUMENT_PRINT_AUTHORIZED',
    resourceType: 'PRINT_JOB',
    resourceId: cleanPrintJobId,
    details: {
      printJobId: cleanPrintJobId,
      docType: cleanDocType,
      fee,
      balanceAfter: updatedWallet.balance,
      cardIdentifier: cleanCardId,
      format: printFormat,
    },
    status: 'SUCCESS',
  });

  return {
    success: true,
    printJobId: cleanPrintJobId,
    transactionId: cleanPrintJobId,
    fee,
    remainingBalance: updatedWallet.balance,
  };
}

