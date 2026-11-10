import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  let dbStatus = 'disconnected';
  let isHealthy = false;

  try {
    if (process.env.MONGODB_URI) {
      await connectToDatabase();
      const readyState = mongoose.connection.readyState;
      // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
      if (readyState === 1) {
        dbStatus = 'connected';
        isHealthy = true;
      } else {
        dbStatus = `transitioning_${readyState}`;
      }
    } else {
      dbStatus = 'not_configured';
    }

    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'degraded',
      service: 'Accero PrintPortal API',
      timestamp: new Date().toISOString(),
      latencyMs: Date.now() - startTime,
      database: {
        status: dbStatus,
        configured: Boolean(process.env.MONGODB_URI),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message || 'Database connection failure',
        timestamp: new Date().toISOString(),
        latencyMs: Date.now() - startTime,
        database: {
          status: 'error',
        },
      },
      { status: 503 }
    );
  }
}
