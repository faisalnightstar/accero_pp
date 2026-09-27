import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import DocumentRecord from '@/models/DocumentRecord';
import { getSession } from '@/lib/auth';

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

    return NextResponse.json({
      success: true,
      document: {
        id: (doc as any)._id.toString(),
        docType: (doc as any).docType.toLowerCase(),
        cardIdentifier: (doc as any).cardIdentifier,
        inputMode: (doc as any).inputMode,
        data: (doc as any).data,
        missingFields: (doc as any).missingFields,
        isComplete: (doc as any).isComplete,
        printCount: (doc as any).printCount || 0,
        lastPrintedAt: (doc as any).lastPrintedAt,
        createdAt: (doc as any).createdAt,
        updatedAt: (doc as any).updatedAt,
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
