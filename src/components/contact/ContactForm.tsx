'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  if (submitted) {
    return (
      <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
        <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
        <h3 className="text-base font-bold text-emerald-950">Message Received!</h3>
        <p className="text-xs text-emerald-800 leading-relaxed max-w-sm mx-auto">
          Thank you for contacting Accero PrintPortal. An operator support specialist will review your inquiry and follow up within 4-8 business hours.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      toolname="contact_support_form"
      tooldescription="Send a direct support, printer setup, or enterprise inquiry to Accero PrintPortal staff"
      toolautosubmit="true"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contact-name" className="block text-xs font-semibold text-slate-700 mb-1">
            Your Name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            toolparamdescription="Full name of contact person or operator"
            placeholder="e.g. Rahul Sharma"
            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#1D3557] focus:ring-1 focus:ring-[#1D3557] transition-colors"
          />
        </div>
        <div>
          <label htmlFor="contact-phone" className="block text-xs font-semibold text-slate-700 mb-1">
            Phone / WhatsApp
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            toolparamdescription="Mobile or WhatsApp contact number"
            placeholder="e.g. 9876543210"
            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#1D3557] focus:ring-1 focus:ring-[#1D3557] transition-colors"
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-email" className="block text-xs font-semibold text-slate-700 mb-1">
          Email Address
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          toolparamdescription="Valid email address for response and ticketing"
          placeholder="e.g. rahul@cybercafe.com"
          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#1D3557] focus:ring-1 focus:ring-[#1D3557] transition-colors"
        />
      </div>

      <div>
        <label htmlFor="contact-business-type" className="block text-xs font-semibold text-slate-700 mb-1">
          Business Type
        </label>
        <select
          id="contact-business-type"
          name="businessType"
          toolparamdescription="Operator category: Cyber Cafe, CSC VLE, Printing Shop, or Enterprise"
          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#1D3557] focus:ring-1 focus:ring-[#1D3557] transition-colors"
          defaultValue="cyber-cafe"
        >
          <option value="cyber-cafe">Cyber Cafe Owner</option>
          <option value="csc-vle">CSC Operator / VLE</option>
          <option value="printing-shop">Commercial Printing Shop</option>
          <option value="digital-service">Digital Service Center / Jan Seva Kendra</option>
          <option value="enterprise">Enterprise / Multi-Counter Network</option>
          <option value="other">Other Inquiry</option>
        </select>
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-xs font-semibold text-slate-700 mb-1">
          Message or Query
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={4}
          required
          toolparamdescription="Detailed description of inquiry, printer model, or volume requirement"
          placeholder="Describe your inquiry, printer model, or high-volume requirements..."
          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#1D3557] focus:ring-1 focus:ring-[#1D3557] transition-colors"
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="md"
        isLoading={isSubmitting}
        className="w-full"
        icon={<Send className="w-3.5 h-3.5" />}
        iconPosition="right"
      >
        Submit Inquiry
      </Button>
    </form>
  );
}
