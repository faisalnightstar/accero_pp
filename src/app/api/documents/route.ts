import { NextResponse } from 'next/server';
import { z } from 'zod';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import DocumentRecord from '@/models/DocumentRecord';
import { getSession } from '@/lib/auth';
import { deductWalletFee } from '@/actions/wallet';
import { isDocumentAlreadyPaid } from '@/lib/wallet/pricing';
import {
  generateDocumentCacheKey,
  isDocumentCacheValid,
  normalizeDocumentIdentifier,
  CACHE_TTL_MS,
} from '@/lib/documents/documentCache';
import { processDocumentIncomingImages } from '@/lib/cloudinary/documentImageHandler';
import { executeSafeAssetCleanup } from '@/lib/cloudinary/assetReplacement';

const saveDocumentSchema = z.object({
  id: z.string().optional(),
  docType: z.enum([
    'pan',
    'aadhaar',
    'voter',
    'dl',
    'rc',
    'ration',
    'farmer',
    'PAN',
    'AADHAAR',
    'VOTER',
    'DL',
    'RC',
    'RATION',
    'FARMER',
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
  if (dt === 'farmer') return data.farmerId || data.aadhaarNumber || 'UNKNOWN-FARMER';
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
      | 'RATION'
      | 'FARMER';

    const rawIdentifier =
      validated.cardIdentifier?.trim() ||
      resolveCardIdentifier(validated.docType, validated.data);
    const cardIdentifier = normalizeDocumentIdentifier(normalizedDocType, rawIdentifier);

    const { hash } = generateDocumentCacheKey(normalizedDocType, cardIdentifier);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + CACHE_TTL_MS);

    let record;
    let isIdentityLocked = false;

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

      if (!record) {
        return NextResponse.json(
          { error: 'Document not found or unauthorized.' },
          { status: 404 }
        );
      }

      // Check Identity Lock: Once a document is verified, paid, or API-fetched, identity is immutable
      isIdentityLocked = Boolean(record.identityLock || record.isPaid || record.inputMode === 'API');
      if (isIdentityLocked) {
        // 1. Prevent document type switching
        if (record.docType.toUpperCase() !== normalizedDocType) {
          return NextResponse.json(
            {
              error: 'IDENTITY_LOCKED',
              message: 'Document identity has changed. Document type is locked for this verified document. Please perform a new authorized lookup.',
            },
            { status: 403 }
          );
        }

        // 2. Prevent cardIdentifier mutation
        const expectedIdentifier = normalizeDocumentIdentifier(record.docType, record.cardIdentifier);
        if (cardIdentifier !== expectedIdentifier) {
          return NextResponse.json(
            {
              error: 'IDENTITY_LOCKED',
              message: 'Document identity has changed. Document number/EPIC is locked for this verified record. Please perform a new authorized lookup.',
            },
            { status: 403 }
          );
        }

        // 3. Ensure the underlying identity field in data was not modified
        const rawDataId = resolveCardIdentifier(record.docType, validated.data);
        const normalizedDataId = normalizeDocumentIdentifier(record.docType, rawDataId);
        if (normalizedDataId && !normalizedDataId.startsWith('UNKNOWN-') && normalizedDataId !== expectedIdentifier) {
          return NextResponse.json(
            {
              error: 'IDENTITY_LOCKED',
              message: 'Document identity has changed. Identifier inside document data does not match verified record. Please perform a new authorized lookup.',
            },
            { status: 403 }
          );
        }
      }
    }

    // Reuse existing record by tenant + docType + identifier/hash to prevent duplicate records
    if (!record && cardIdentifier && !cardIdentifier.startsWith('UNKNOWN-')) {
      const existingByIdentity = await DocumentRecord.findOne({
        userId: session.userId,
        docType: normalizedDocType,
        $or: [{ documentNumberHash: hash }, { cardIdentifier }],
      });
      if (existingByIdentity) {
        record = existingByIdentity;
        isIdentityLocked = Boolean(record.identityLock || record.isPaid || record.inputMode === 'API');
      }
    }

    // Offload any incoming Base64 image payloads (photos, signatures, canvas previews) to Cloudinary
    const imgProcessed = await processDocumentIncomingImages({
      userId: session.userId,
      docType: normalizedDocType,
      data: validated.data,
      frontImage: validated.frontImage,
      backImage: validated.backImage,
      existingPhotoMetadata: record?.photoMetadata,
      existingSignatureMetadata: record?.signatureMetadata,
      existingFrontMetadata: record?.frontImageMetadata,
    });

    if (record) {
      if (!isIdentityLocked) {
        record.docType = normalizedDocType;
        record.cardIdentifier = cardIdentifier;
        record.documentNumberHash = hash;
      }
      record.inputMode = validated.inputMode;
      record.data = imgProcessed.data;
      record.missingFields = validated.missingFields;
      record.isComplete = validated.isComplete;
      if (imgProcessed.frontImage) record.frontImage = imgProcessed.frontImage;
      if (imgProcessed.backImage) record.backImage = imgProcessed.backImage;
      if (imgProcessed.photoMetadata) record.photoMetadata = imgProcessed.photoMetadata;
      if (imgProcessed.signatureMetadata) record.signatureMetadata = imgProcessed.signatureMetadata;
      if (imgProcessed.frontImageMetadata) record.frontImageMetadata = imgProcessed.frontImageMetadata;
      if (imgProcessed.backImageMetadata) record.backImageMetadata = imgProcessed.backImageMetadata;
      if (imgProcessed.hasUploadedToCloudinary) {
        record.imageMigrationStatus = 'MIGRATED';
        record.imageMigratedAt = now;
      }
      if (!record.identityLock && record.isPaid) {
        record.identityLock = {
          documentType: record.docType,
          documentIdentifier: record.cardIdentifier,
          lookupStatus: 'SUCCESS',
          verificationStatus: record.inputMode === 'API' ? 'VERIFIED' : 'MANUAL',
          paymentStatus: 'PAID',
          reprintEligible: true,
          originalLookupTransactionId: record.paymentReferenceId,
          provider: record.provider || 'API',
          verifiedAt: record.paidAt || record.createdAt,
          ownerId: session.userId,
          lockedAt: now,
        };
      }
      record.updatedAt = now;
      await record.save();

      // Execute safe cleanup of prior Cloudinary assets ONLY after successful MongoDB persistence
      if (imgProcessed.stagedDeletions && imgProcessed.stagedDeletions.length > 0) {
        for (const staged of imgProcessed.stagedDeletions) {
          executeSafeAssetCleanup({
            publicId: staged.publicId,
            deliveryType: staged.type,
            resourceType: staged.resourceType,
            docType: staged.docType,
            userId: session.userId,
            documentId: record._id,
            replacementPublicId: staged.replacementPublicId,
          }).catch((err) => {
            console.warn('[API/Documents] Background asset cleanup warning:', err);
          });
        }
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
            const reqFee = (deduction as any).requiredFee ?? 5;
            return NextResponse.json(
              {
                error: 'INSUFFICIENT_BALANCE',
                message: `Insufficient wallet balance. Creating a manual document requires ₹${reqFee}.`,
                requiredFee: reqFee,
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
        data: imgProcessed.data,
        missingFields: validated.missingFields,
        isComplete: validated.isComplete,
        frontImage: imgProcessed.frontImage,
        backImage: imgProcessed.backImage,
        photoMetadata: imgProcessed.photoMetadata,
        signatureMetadata: imgProcessed.signatureMetadata,
        frontImageMetadata: imgProcessed.frontImageMetadata,
        backImageMetadata: imgProcessed.backImageMetadata,
        imageMigrationStatus: imgProcessed.hasUploadedToCloudinary ? 'MIGRATED' : 'UNMIGRATED',
        imageMigratedAt: imgProcessed.hasUploadedToCloudinary ? now : undefined,
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

    // Concurrently execute count and projection-optimized find query
    const [totalCount, documents] = await Promise.all([
      DocumentRecord.countDocuments(filter),
      DocumentRecord.find(filter)
        .select({
          frontImage: 0,
          backImage: 0,
        })
        .sort({ updatedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

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
