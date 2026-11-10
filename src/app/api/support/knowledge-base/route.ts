import { NextResponse } from 'next/server';
import { SUPPORT_KNOWLEDGE_BASE } from '@/lib/support/knowledgeBase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.toLowerCase().trim();

  let results = SUPPORT_KNOWLEDGE_BASE;
  if (q) {
    results = results.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.keywords.some((k) => k.includes(q))
    );
  }

  return NextResponse.json({ success: true, articles: results });
}
