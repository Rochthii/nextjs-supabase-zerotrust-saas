import React from 'react';
 
export default async function TenantHomePage({ params }: { params: Promise<{ domain: string }> }) {
  const resolvedParams = await params;
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-md w-full bg-slate-800 p-8 rounded-xl shadow-xl border border-slate-700 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-indigo-400 mb-2">Welcome!</h1>
        <p className="text-slate-400 mb-6">You are visiting domain: <code className="text-slate-200">{resolvedParams.domain}</code></p>
        <p className="text-slate-300 text-sm mb-6">
          This is a clean, secure B2B multi-tenant SaaS workspace powered by Zero Trust Supabase RLS and Next.js.
        </p>
        <a 
          href="/login" 
          className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition"
        >
          Access Member Portal
        </a>
      </div>
    </div>
  );
}