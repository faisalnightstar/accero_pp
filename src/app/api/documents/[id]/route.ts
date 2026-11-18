import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import DocumentRecord from '@/models/DocumentRecord';
import { getSession } from '@/lib/auth';
import { executeSafeAssetCleanup } from '@/lib/cloudinary/assetReplacement';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid document ID.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const doc = await DocumentRecord.findOne({
      _id: id,
      userId: session.userId,
    }).lean();

    if (!doc) {
      return NextResponse.json(
        { error: 'Document not found or unauthorized.' },
        { status: 404 }
      );
    }

    const isCacheValid = Boolean(
      (doc as any).expiresAt && new Date((doc as any).expiresAt).getTime() > Date.now()
    );

    const isPaid = (doc as any).isPaid === true;
    const isIdentityLocked = Boolean((doc as any).identityLock || isPaid || (doc as any).inputMode === 'API');

    const identityLock = (doc as any).identityLock || {
      documentType: (doc as any).docType,
      documentIdentifier: (doc as any).cardIdentifier,
      lookupStatus: 'SUCCESS',
      verificationStatus: (doc as any).inputMode === 'API' ? 'VERIFIED' : 'MANUAL',
      paymentStatus: isPaid ? 'PAID' : 'UNPAID',
      reprintEligible: isPaid,
      originalLookupTransactionId: (doc as any).paymentReferenceId,
      ownerId: (doc as any).userId?.toString(),
      lockedAt: (doc as any).createdAt,
    };

    const docPayload = {
      id: (doc as any)._id.toString(),
      docType: (doc as any).docType.toLowerCase(),
      cardIdentifier: (doc as any).cardIdentifier,
      inputMode: (doc as any).inputMode,
      data: (doc as any).data,
      missingFields: (doc as any).missingFields,
      isComplete: (doc as any).isComplete,
      printCount: (doc as any).printCount || 0,
      lastPrintedAt: (doc as any).lastPrintedAt,
      fetchedAt: (doc as any).fetchedAt,
      expiresAt: (doc as any).expiresAt,
      isCacheValid,
      isPaid,
      isIdentityLocked,
      identityLock,
      createdAt: (doc as any).createdAt,
      updatedAt: (doc as any).updatedAt,
    };

    return NextResponse.json({
      success: true,
      document: docPayload,
      data: {
        document: docPayload,
        cache: {
          hit: true,
          expiresAt: (doc as any).expiresAt,
          fetchedAt: (doc as any).fetchedAt,
          isValid: isCacheValid,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve document' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid document ID.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const deleted = await DocumentRecord.findOneAndDelete({
      _id: id,
      userId: session.userId,
    });

    if (!deleted) {
      return NextResponse.json(
        { error: 'Document not found or unauthorized.' },
        { status: 404 }
      );
    }

    // Clean up associated Cloudinary assets safely (checks references & queues retry on failure)
    if (deleted.photoMetadata?.publicId) {
      executeSafeAssetCleanup({
        publicId: deleted.photoMetadata.publicId,
        deliveryType: 'authenticated',
        docType: deleted.docType,
        userId: session.userId,
        documentId: deleted._id,
      }).catch(() => {});
    }
    if (deleted.signatureMetadata?.publicId) {
      executeSafeAssetCleanup({
        publicId: deleted.signatureMetadata.publicId,
        deliveryType: 'authenticated',
        docType: deleted.docType,
        userId: session.userId,
        documentId: deleted._id,
      }).catch(() => {});
    }
    if (deleted.frontImageMetadata?.publicId) {
      executeSafeAssetCleanup({
        publicId: deleted.frontImageMetadata.publicId,
        deliveryType: 'authenticated',
        docType: deleted.docType,
        userId: session.userId,
        documentId: deleted._id,
      }).catch(() => {});
    }
    if (deleted.backImageMetadata?.publicId) {
      executeSafeAssetCleanup({
        publicId: deleted.backImageMetadata.publicId,
        deliveryType: 'authenticated',
        docType: deleted.docType,
        userId: session.userId,
        documentId: deleted._id,
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
      id,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete document' },
      { status: 500 }
    );
  }
}
