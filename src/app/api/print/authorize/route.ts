import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { authorizePrint } from '@/lib/print/printAuthorization';

const authorizePrintSchema = z.object({
  printJobId: z.string().min(1, 'printJobId is required'),
  documentType: z.string().min(1, 'documentType is required'),
  cardIdentifier: z.string().optional(),
  documentId: z.string().optional(),
  printFormat: z.enum(['CR80', 'SHEET', 'PDF']).default('CR80'),
  metadata: z.record(z.any()).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Please sign in to authorize print jobs.',
          },
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = authorizePrintSchema.parse(body);

    const result = await authorizePrint({
      userId: session.userId,
      documentId: validated.documentId,
      documentType: validated.documentType,
      cardIdentifier: validated.cardIdentifier,
      printJobId: validated.printJobId,
      printFormat: validated.printFormat,
      metadata: validated.metadata,
    });

    if (!result.success) {
      const statusCode = result.error?.code === 'INSUFFICIENT_BALANCE' ? 402 : 400;
      return NextResponse.json(result, { status: statusCode });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: err.errors[0].message,
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PRINT_ERROR',
          message: err.message || 'Failed to authorize print operation.',
        },
      },
      { status: 500 }
    );
  }
}

