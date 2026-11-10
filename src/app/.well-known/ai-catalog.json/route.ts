import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = 86400; // 24 hours

const ARD_MANIFEST = {
  $schema: 'https://agenticresourcediscovery.org/schemas/v0.91/ard-manifest.json',
  entries: [
    {
      '@context': {
        air: 'https://agenticresourcediscovery.org/ns#',
      },
      identifier: 'urn:air:printportal.accero.app:utility:document-processor',
      displayName: 'Accero PrintPortal Document Processing & Printing Utility',
      type: 'application/json',
      description:
        'Multi-user document processing, verification, and CR80 PVC card print formatting SaaS for PAN, Aadhaar, Voter ID, Driving Licence, and Vehicle RC.',
      url: 'https://printportal.accero.app',
      tags: [
        'document-printing',
        'pvc-card-printing',
        'cr80-format',
        'pan-card',
        'aadhaar',
        'voter-id',
        'driving-licence',
        'vehicle-rc',
        'ration-card',
      ],
      capabilities: [
        'document-lookup',
        'document-editing',
        'multilingual-rendering',
        'pvc-card-formatting',
        'zero-margin-printing',
      ],
      representativeQueries: [
        'Format and print PAN card in CR80 PVC size with photo and signature.',
        'Lookup Aadhaar document and format for Epson L805 PVC card tray.',
        'Print Voter ID EPIC card with barcode and Hindi Devanagari text.',
        'Format driving licence or vehicle RC for smart card tray printing.',
        'Verify document number and fill missing fields in live split-screen editor.',
      ],
      version: '1.0.0',
      updatedAt: '2026-11-10T00:00:00Z',
      trustManifest: {
        identity: 'https://printportal.accero.app',
        identityType: 'https',
        trustSchema: {
          governanceUri: 'https://printportal.accero.app/security',
        },
      },
    },
  ],
};

export async function GET() {
  return NextResponse.json(ARD_MANIFEST, {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    },
  });
}

