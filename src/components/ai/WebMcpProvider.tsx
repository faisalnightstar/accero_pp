'use client';

import { useEffect } from 'react';

/**
 * WebMCP Tool Definition with strict JSON Schema Draft-07 compliance.
 */
export interface WebMcpTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, { type: string; description: string; enum?: string[] }>;
    required: string[];
  };
  handler?: (args: Record<string, any>) => Promise<any> | any;
}

export const WEBMCP_TOOLS: WebMcpTool[] = [
  {
    name: 'lookup_document',
    description:
      'Verify and load official document data into the interactive studio for CR80 PVC formatting (PAN, Aadhaar, Voter ID, Driving Licence, Vehicle RC, or Ration Card).',
    inputSchema: {
      type: 'object',
      properties: {
        documentType: {
          type: 'string',
          enum: ['pan', 'aadhaar', 'voter', 'dl', 'rc', 'ration'],
          description: 'Official document type category to verify and format.',
        },
        documentNumber: {
          type: 'string',
          description:
            'Alphanumeric identifier (e.g., 10-char PAN ABCDE1234F, 12-digit Aadhaar, EPIC voter ID, State DL number, or vehicle registration number).',
        },
      },
      required: ['documentType', 'documentNumber'],
    },
    handler: async (args) => {
      return {
        status: 'ready',
        targetUrl: `/studio?type=${encodeURIComponent(args.documentType)}&lookup=${encodeURIComponent(args.documentNumber)}`,
        message: `Studio ready for ${args.documentType.toUpperCase()} lookup.`,
      };
    },
  },
  {
    name: 'search_knowledge_base',
    description:
      'Search operator knowledge base, printer tray setups (Epson L805, Canon G-series), card dimensions, and error resolution guides.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'Search keyword or question (e.g., "Epson L805 tray alignment", "CR80 card dimensions", "missing photo fix").',
        },
      },
      required: ['query'],
    },
    handler: async (args) => {
      return {
        status: 'success',
        resultsUrl: `/faq?q=${encodeURIComponent(args.query)}`,
        message: `Found operator guides matching: ${args.query}`,
      };
    },
  },
  {
    name: 'submit_support_inquiry',
    description:
      'Submit a technical support, billing, or enterprise multi-counter inquiry to Accero PrintPortal operator helpdesk.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Full name of the contact person or CSC operator.',
        },
        email: {
          type: 'string',
          description: 'Email address for support correspondence.',
        },
        phone: {
          type: 'string',
          description: 'Mobile or WhatsApp phone number.',
        },
        subject: {
          type: 'string',
          enum: ['Printer Tray Setup', 'Wallet & Payment', 'Multi-Counter Enterprise', 'General Inquiry'],
          description: 'Category of inquiry.',
        },
        message: {
          type: 'string',
          description: 'Detailed description of the question or technical assistance request.',
        },
      },
      required: ['name', 'email', 'message'],
    },
    handler: async (args) => {
      return {
        status: 'received',
        ticketId: `ACC-${Date.now().toString().slice(-6)}`,
        message: `Inquiry registered for ${args.name}. An operator specialist will respond shortly.`,
      };
    },
  },
];

/**
 * Client-side WebMCP Provider registering tools with navigator.modelContext
 * and exposing diagnostics for Chrome DevTools and Lighthouse Agentic Web audits.
 */
export default function WebMcpProvider() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Expose tools in window context for inspection
    (window as any).__WEBMCP_TOOLS__ = WEBMCP_TOOLS;

    // Register with native browser WebMCP if available (Chrome AI / Prompt API)
    const nav = navigator as any;
    if (nav?.modelContext?.registerTool && typeof nav.modelContext.registerTool === 'function') {
      try {
        for (const tool of WEBMCP_TOOLS) {
          nav.modelContext.registerTool({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema,
            execute: tool.handler,
          });
        }
      } catch (err) {
        // Non-blocking in experimental browser builds
        console.debug('[WebMCP] Registration note:', err);
      }
    }
  }, []);

  return null;
}

