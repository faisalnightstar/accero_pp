import { NextResponse } from 'next/server';
import { z } from 'zod';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import DocumentRecord from '@/models/DocumentRecord';
import { getSession } from '@/lib/auth';
import { deductWalletFee } from '@/actions/wallet';
import { isDocumentAlreadyPaid } from '@/lib/wallet/pricing';
import { generateDocumentCacheKey, isDocumentCacheValid, CACHE_TTL_MS } from '@/lib/documents/documentCache';

const saveDocumentSchema = z.object({
  id: z.string().optional(),
  docType: z.enum([
    'pan',
    'aadhaar',
    'voter',
    'dl',
    'rc',
    'ration',
    'PAN',
    'AADHAAR',
    'VOTER',
    'DL',
    'RC',
    'RATION',
  ]),
  cardIdentifier: z.string().optional(),
  inputMode: z.enum(['API', 'MANUAL']).default('MANUAL'),
  data: z.record(z.any()),
  missingFields: z.array(z.string()).default([]),
  isComplete: z.boolean().default(false),
  frontImage: z.string().optional(),
  backImage: z.string().optional(),
});

function resolveCardIdentifier(docType: string, data: Record<string, any>): string {
  const dt = docType.toLowerCase();
  if (dt === 'pan') return data.panNumber || 'UNKNOWN-PAN';
  if (dt === 'aadhaar') return data.aadhaarNumber || 'UNKNOWN-AADHAAR';
  if (dt === 'voter') return data.epicNumber || 'UNKNOWN-VOTER';
  if (dt === 'dl') return data.dlNumber || 'UNKNOWN-DL';
  if (dt === 'rc') return data.registrationNumber || 'UNKNOWN-RC';
  if (dt === 'ration') return data.rationCardNumber || 'UNKNOWN-RATION';
  return 'UNKNOWN-DOC';
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to save documents.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = saveDocumentSchema.parse(body);

    await connectToDatabase();

    const normalizedDocType = validated.docType.toUpperCase() as
      | 'PAN'
      | 'AADHAAR'
      | 'VOTER'
      | 'DL'
      | 'RC'
      | 'RATION';

    const cardIdentifier =
      validated.cardIdentifier?.trim() ||
      resolveCardIdentifier(validated.docType, validated.data);

    const { hash } = generateDocumentCacheKey(normalizedDocType, cardIdentifier);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + CACHE_TTL_MS);

    let record;

    if (validated.id) {
      if (!mongoose.Types.ObjectId.isValid(validated.id)) {
        return NextResponse.json(
          { error: 'Invalid document ID format.' },
          { status: 400 }
        );
      }

      record = await DocumentRecord.findOne({
        _id: validated.id,
        userId: session.userId,
      });

      if (record) {
        record.docType = normalizedDocType;
        record.cardIdentifier = cardIdentifier;
        record.documentNumberHash = hash;
        record.inputMode = validated.inputMode;
        record.data = validated.data;
        record.missingFields = validated.missingFields;
        record.isComplete = validated.isComplete;
        if (validated.frontImage) record.frontImage = validated.frontImage;
        if (validated.backImage) record.backImage = validated.backImage;
        record.updatedAt = now;
        await record.save();
      }
    }

    if (!record) {
      // If creating a brand-new manual document, deduct the ₹5 manual entry fee
      if (validated.inputMode === 'MANUAL') {
        const isPaid = await isDocumentAlreadyPaid(session.userId, normalizedDocType, cardIdentifier);
        if (!isPaid) {
          const deduction = await deductWalletFee(
            normalizedDocType,
            cardIdentifier,
            `Manual ${normalizedDocType} Card Creation Fee (${cardIdentifier})`,
            true
          );

          if (!deduction.success && deduction.error === 'INSUFFICIENT_BALANCE') {
            return NextResponse.json(
              {
                error: 'INSUFFICIENT_BALANCE',
                message: 'Insufficient wallet balance. Creating a manual document requires ₹5.',
                requiredFee: 5,
                currentBalance: deduction.currentBalance || 0,
              },
              { status: 402 }
            );
          }
        }
      }

      record = await DocumentRecord.create({
        userId: session.userId,
        docType: normalizedDocType,
        cardIdentifier,
        documentNumberHash: hash,
        inputMode: validated.inputMode,
        data: validated.data,
        missingFields: validated.missingFields,
        isComplete: validated.isComplete,
        frontImage: validated.frontImage,
        backImage: validated.backImage,
        source: validated.inputMode,
        status: 'ACTIVE',
        fetchedAt: now,
        expiresAt,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Document saved successfully to MongoDB',
      docId: record._id.toString(),
      data: {
        document: {
          id: record._id.toString(),
          docType: record.docType,
          cardIdentifier: record.cardIdentifier,
          inputMode: record.inputMode,
          isComplete: record.isComplete,
          missingFields: record.missingFields,
          updatedAt: record.updatedAt,
        },
        cache: {
          hit: true,
          expiresAt: record.expiresAt,
          fetchedAt: record.fetchedAt,
        },
      },
      record: {
        id: record._id.toString(),
        docType: record.docType,
        cardIdentifier: record.cardIdentifier,
        inputMode: record.inputMode,
        isComplete: record.isComplete,
        missingFields: record.missingFields,
        updatedAt: record.updatedAt,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to save document record' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const docTypeParam = searchParams.get('docType');
    const isCompleteParam = searchParams.get('isComplete');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '50', 10)), 100);
    const skip = (page - 1) * limit;

    await connectToDatabase();

    const filter: Record<string, any> = { userId: session.userId };
    if (docTypeParam) {
      filter.docType = docTypeParam.toUpperCase();
    }
    if (isCompleteParam !== null && isCompleteParam !== undefined && isCompleteParam !== '') {
      filter.isComplete = isCompleteParam === 'true';
    }

    // Total count for pagination
    const totalCount = await DocumentRecord.countDocuments(filter);

    // Optimized projection excluding heavy image fields from list view
    const documents = await DocumentRecord.find(filter)
      .select({
        frontImage: 0,
        backImage: 0,
      })
      .sort({ updatedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      count: documents.length,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      documents: documents.map((doc: any) => ({
        id: doc._id.toString(),
        docType: doc.docType,
        cardIdentifier: doc.cardIdentifier,
        inputMode: doc.inputMode,
        data: doc.data,
        missingFields: doc.missingFields,
        isComplete: doc.isComplete,
        printCount: doc.printCount || 0,
        lastPrintedAt: doc.lastPrintedAt,
        fetchedAt: doc.fetchedAt,
        expiresAt: doc.expiresAt,
        isCacheValid: isDocumentCacheValid(doc),
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch document records' },
      { status: 500 }
    );
  }
}
