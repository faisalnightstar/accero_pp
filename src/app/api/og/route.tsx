import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'Accero PrintPortal';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            backgroundColor: '#0f172a',
            padding: '60px 80px',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Header Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #8B1E2D, #E63946)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '26px',
                fontWeight: 'bold',
              }}
            >
              P
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', fontSize: '30px', fontWeight: 'bold', color: '#ffffff' }}>
                Accero
                <span style={{ color: '#E63946', marginLeft: '6px' }}>PrintPortal</span>
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  fontWeight: 600,
                }}
              >
                Document Processing & Printing SaaS
              </div>
            </div>
          </div>

          {/* Main Title Callout */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1040px' }}>
            <div
              style={{
                fontSize: '48px',
                fontWeight: 900,
                color: '#ffffff',
                lineHeight: 1.2,
                display: 'flex',
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: '20px',
                color: '#cbd5e1',
                lineHeight: 1.4,
                display: 'flex',
              }}
            >
              Official ISO/IEC 7810 ID-1 (CR80) Standard Layouts • Real-Time Split-Screen Studio • Instant PDF Export
            </div>
          </div>

          {/* Footer Metadata */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              borderTop: '1px solid #1e293b',
              paddingTop: '20px',
            }}
          >
            <div style={{ fontSize: '18px', color: '#F4D35E', fontWeight: 'bold', display: 'flex' }}>
              https://printportal.accero.app
            </div>
            <div style={{ fontSize: '15px', color: '#64748b', display: 'flex' }}>
              Built for Cyber Cafes, CSC Centers & Printing Shops
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate OG image: ${e.message}`, { status: 500 });
  }
}

