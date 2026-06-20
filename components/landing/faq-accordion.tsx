"use client";

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs: FaqItem[] = [
    {
      question: "Does TenantShield include Stripe subscription billing?",
      answer: (
        <span>
          No. TenantShield is a dedicated, compliance-grade security and multi-tenancy core. While standard boilerplates focus heavily on Stripe billing and simple UI, TenantShield solves the hard security and database isolation problems (FORCE RLS, immutable audit logs, Edge firewalls) that take months to get audited and approved. Stripe integrations can be added in an afternoon, but securing a multi-tenant DB is where you risk your company's survival.
        </span>
      )
    },
    {
      question: "How long does setup take and what are the dependencies?",
      answer: (
        <span>
          Standard setup takes less than 15 minutes. It requires a Supabase instance (database + auth) and an Upstash Redis database (for Edge active defense caching). The project includes 9 numbered SQL migration files that can be run in the Supabase SQL editor. Telegram (for SOAR alerts), Cloudinary (for media uploads), and Resend (for emails) are entirely optional and can be toggled on/off in the configuration.
        </span>
      )
    },
    {
      question: "What makes FORCE RLS different from standard Supabase RLS?",
      answer: (
        <span>
          Standard Supabase templates use <code className="bg-slate-950 px-1 py-0.5 rounded text-indigo-400">ENABLE ROW LEVEL SECURITY</code>. While this isolates client-facing queries, it can be completely bypassed by the database owner (<code className="bg-slate-950 px-1 py-0.5 rounded text-indigo-400">service_role</code> key) or system queries. TenantShield applies <code className="bg-slate-950 px-1 py-0.5 rounded text-indigo-400">FORCE ROW LEVEL SECURITY</code> on all 14 tables, which forces policies to run even on system bypass contexts, guaranteeing that no developer mistake or service key leak can accidentally expose cross-tenant data.
        </span>
      )
    },
    {
      question: "Is Firebase Cloud Messaging (FCM) required for push notifications?",
      answer: (
        <span>
          No. Firebase FCM is completely deactivated on the client and bypassed on the backend by default to reduce complexity for buyers who don't need it. The push notification payloads are safely caught and logged to the console, allowing you to easily hook them into any push service (like OneSignal or Courier) or re-enable Firebase if desired.
        </span>
      )
    },
    {
      question: "Can I use TenantShield for commercial client projects?",
      answer: (
        <span>
          Yes, absolutely. Under our Agency and Unlimited licenses, you are fully authorized to deploy TenantShield as the core backend framework for multiple client projects. You may not resell the source code itself as a boilerplate, but you can build SaaS products or custom enterprise portals for your clients.
        </span>
      )
    },
    {
      question: "How does the WORM Audit Vault prevent tampering?",
      answer: (
        <span>
          The Write Once Read Many (WORM) ledger is implemented via PostgreSQL triggers. Any attempts to <code className="bg-slate-950 px-1 py-0.5 rounded text-indigo-400">UPDATE</code> or <code className="bg-slate-950 px-1 py-0.5 rounded text-indigo-400">DELETE</code> records inside the <code className="bg-slate-950 px-1 py-0.5 rounded text-indigo-400">audit_logs</code> table are intercepted at the database layer and immediately rejected with exceptions, making it structurally impossible to alter history. Furthermore, the log entries are cryptographically linked in a SHA-256 block chain and cross-verified off-database in Supabase Storage.
        </span>
      )
    },
    {
      question: "What is the update policy after purchase?",
      answer: (
        <span>
          All licensing tiers include lifetime updates. We actively maintain TenantShield to support the latest Next.js features, Supabase SDK updates, and security best practices. You will receive email notifications or access to the repository to download new releases.
        </span>
      )
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div 
            key={index}
            className="bg-slate-900/30 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-slate-800 transition-colors"
          >
            <button
              onClick={() => toggleAccordion(index)}
              className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className={`w-5 h-5 shrink-0 transition-colors ${isOpen ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span className="font-extrabold text-slate-200 text-sm sm:text-base">{faq.question}</span>
              </div>
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-indigo-400 shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
              )}
            </button>
            
            {/* Answer transition */}
            <div 
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isOpen ? 'max-h-[500px] border-t border-slate-900' : 'max-h-0'
              }`}
            >
              <div className="p-6 text-sm text-slate-400 leading-relaxed bg-slate-950/20">
                {faq.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
