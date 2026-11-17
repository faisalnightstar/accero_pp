import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import {
  lookupAndBillPan,
  getPanLookupHistory,
  validatePanNumber,
  PAN_ERROR_MESSAGES,
} from '@/lib/pan';

const panLookupRequestSchema = z.object({
  pan: z.string().min(1, 'PAN number is required'),
  strategy: z.enum(['v1', 'v2', 'fallback']).optional().default('fallback'),
  requestId: z.string().optional(),
  bypassCache: z.boolean().optional().default(false),
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
            message: PAN_ERROR_MESSAGES.UNAUTHORIZED,
          },
        },
        { status: 401 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_JSON',
            message: 'Invalid JSON request body.',
          },
        },
        { status: 400 }
      );
    }

    const parseResult = panLookupRequestSchema.safeParse(body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PAN',
            message: issue?.message || 'Invalid PAN lookup request parameters.',
          },
        },
        { status: 400 }
      );
    }

    const { pan, strategy, requestId, bypassCache } = parseResult.data;

    // Validate PAN format before calling service
    const panCheck = validatePanNumber(pan);
    if (!panCheck.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: panCheck.errorCode || 'INVALID_PAN',
            message: panCheck.errorMessage || PAN_ERROR_MESSAGES.INVALID_PAN,
          },
        },
        { status: 400 }
      );
    }

    const result = await lookupAndBillPan({
      userId: session.userId,
      panNumber: panCheck.normalized,
      strategy,
      requestId,
      bypassCache,
    });

    if (result.status === 'FAILED') {
      let httpStatus = 400;
      if (result.errorCode === 'INSUFFICIENT_BALANCE') httpStatus = 402;
      else if (result.errorCode === 'NOT_FOUND') httpStatus = 404;
      else if (result.errorCode === 'TIMEOUT') httpStatus = 504;
      else if (result.errorCode === 'PROVIDER_UNAVAILABLE') httpStatus = 503;
      else if (result.errorCode === 'AUTH_ERROR' || result.errorCode === 'INVALID_TOKEN') httpStatus = 502;

      return NextResponse.json(
        {
          success: false,
          error: {
            code: result.errorCode || 'LOOKUP_FAILED',
            message: result.errorMessage || result.message,
          },
          data: result,
        },
        { status: httpStatus }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error('[Api:PanLookup] Unexpected error:', err);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: PAN_ERROR_MESSAGES.INTERNAL_ERROR,
        },
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: PAN_ERROR_MESSAGES.UNAUTHORIZED,
          },
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limitParam = parseInt(searchParams.get('limit') || '20', 10);
    const limit = Math.min(Math.max(1, isNaN(limitParam) ? 20 : limitParam), 100);

    const history = await getPanLookupHistory(session.userId, limit);

    return NextResponse.json({
      success: true,
      history,
    });
  } catch (err: any) {
    console.error('[Api:PanLookupHistory] Error:', err);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve PAN lookup history.',
        },
      },
      { status: 500 }
    );
  }
}
