# Enterprise Policy Ingestion Guide

## Overview

The **Security Policy & IT Audit Copilot RAG** system supports the administration and analysis of security policies for **4 core departments** within an enterprise. Each policy document ingested into the system must be classified with the correct department ID (`department_id` - equivalent to the physical `tradition_id` of the database for backward compatibility) so that AI can categorize the context and generate accurate security compliance questions for employees.

---

## Department List & Policy Classification (`tradition_id` mapping)

| Database Code | Department Name | Representative Policy Documents |
|:---|:---|:---|
| `THERAVADA` | **HR & Legal** | Non-Disclosure Agreement (NDA), Employee Code of Conduct, Personal Data Protection Policy (Decree 13/2023/ND-CP). |
| `MAHAYANA` | **IT Security** | ISO/IEC 27001:2013 Standard, Security Incident Response (SOAR) Procedure, Cloud Data Isolation Risk. |
| `VAJRAYANA` | **Finance Audit** | Internal Audit Regulation, Budget Management Procedure, Multi-Branch Transaction Control. |
| `KHATTSI` | **Executive Board** | Strategic Resolutions, Corporate Governance Regulations. |
| `GENERAL` | **General Policies** | Company Operating Regulations, Hybrid Work Policy. |

---

## Ingesting New Policies (Web Admin)

### Step 1: Access Control & Security (RBAC)
> [!IMPORTANT]
> All policy ingestion APIs are now protected by the `requireAdmin` access control layer. Users must have the **Super Admin** or **Compliance Officer** role to activate the policy ingestion process.

### Step 2: Upload PDF Documents & Provide Metadata
Access **Admin → Security Center → AI Policy Management → Ingest Documents**. 
The PDF will be analyzed, chunked, and security entities will be extracted and pushed to the `/api/admin/ai/parse-pdf` API for processing.

---

## Advanced Ingestion (Using Scripts)

For massive technical standard documents (e.g., the entire ISO 27001 document with hundreds of pages), it is recommended to use a Node.js script to run in the background via the terminal to control the process, avoid browser timeouts, and handle API rate limits.

### Sample Script: `scripts/ingest_policies.mjs`
The script is optimized for:
- **ESM Compatibility**: Importing PDF processing libraries in modern Node.js environments.
- **Rate Limiting Guard**: Automatically delaying (sleep 1000ms) after each embedding chunk to avoid exceeding the Google Cloud API quota.
- **Environment Aware**: Automatically reading authentication information from the `.env.local` configuration file.

**Execution:**
```powershell
node scripts/ingest_policies.mjs
```

---

## Standard Metadata Structure by Department

### 1. HR & Legal
```json
{
  "author":            "Head of HR/Legal Department",
  "effective_date":    "2026-01-01",
  "classification":    "CONFIDENTIAL (Internal Confidentiality)",
  "legal_framework":   "Decree 13/2023/ND-CP on Personal Data Protection",
  "language":          "vi"
}
```

### 2. IT Security
```json
{
  "author":            "Chief Information Security Officer (CISO)",
  "framework":         "ISO/IEC 27001 Annex A",
  "iso_control":       "A.12.4.1 (Event Logging)",
  "target_systems":    "PostgreSQL RLS, Supabase Cloud, Next.js Serverless Edge",
  "language":          "vi"
}
```

### 3. Finance Audit
```json
{
  "author":            "Head of Finance Audit Department",
  "auditor":           "Internal Audit Team",
  "regulation":        "Corporate Financial Management Regulation",
  "scope":             "Entire corporation and branches (Tenants)",
  "language":          "vi"
}
```

---

## Compliance Assessment Question Approval Process

After the policy document is successfully embedded into the Vector Database, the AI Copilot will automatically compile compliance assessment questions. These questions must be reviewed by the **Compliance Team** before distribution to employees:

1. Access **Admin → Security Center → Assessment Panel → Pending Review**.
2. Carefully review each question:
   - Does the question content align with the company's policies?
   - Are the multiple-choice answers 100% accurate?  
   - Does the explanation section specifically reference the security policy article?
3. Click **"Approve Question"** or **"Reject / Request AI to Regenerate"**.
4. Approved questions will be automatically added to the company's periodic assessment question bank.

---

## Troubleshooting Technical Issues during Ingestion

| Common Issues | Common Causes | Solution |
| :--- | :--- | :--- |
| **500 Internal Server Error** | Complex PDF document with scanned tables | Ensure the PDF file has been OCR-processed or check the `dynamic import` configuration of the parser in the Edge runtime. |
| **403 Forbidden / Unauthorized** | Expired or insufficiently privileged JWT Token | Log out and log back in with a Super Admin-privileged account. |
| **429 Too Many Requests** | Exceeding the Google Gemini API embedding quota | Wait 60 seconds for the quota to recover or configure a failover API key (Gemini Failover Key) in `.env.local`. |

---

*Tutorial updated: 23/05/2026 — Enterprise Security Copilot RAG Core v2.2.0 (Academic & Production Grade)*