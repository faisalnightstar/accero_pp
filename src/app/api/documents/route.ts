import { NextResponse } from 'next/server';
import { z } from 'zod';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import DocumentRecord from '@/models/DocumentRecord';
import { getSession } from '@/lib/auth';

const saveDocumentSchema = z.object({
  id: z.string().optional(),
  docType: z.enum(['pan', 'aadhaar', 'voter', 'dl', 'rc', 'PAN', 'AADHAAR', 'VOTER', 'DL', 'RC']),
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
      | 'RC';

    const cardIdentifier =
      validated.cardIdentifier?.trim() ||
      resolveCardIdentifier(validated.docType, validated.data);

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
        record.inputMode = validated.inputMode;
        record.data = validated.data;
        record.missingFields = validated.missingFields;
        record.isComplete = validated.isComplete;
        if (validated.frontImage) record.frontImage = validated.frontImage;
        if (validated.backImage) record.backImage = validated.backImage;
        await record.save();
      }
    }

    if (!record) {
      record = await DocumentRecord.create({
        userId: session.userId,
        docType: normalizedDocType,
        cardIdentifier,
        inputMode: validated.inputMode,
        data: validated.data,
        missingFields: validated.missingFields,
        isComplete: validated.isComplete,
        frontImage: validated.frontImage,
        backImage: validated.backImage,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Document saved successfully to MongoDB',
      docId: record._id.toString(),
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
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

    await connectToDatabase();

    const filter: Record<string, any> = { userId: session.userId };
    if (docTypeParam) {
      filter.docType = docTypeParam.toUpperCase();
    }

    const documents = await DocumentRecord.find(filter)
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      count: documents.length,
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
