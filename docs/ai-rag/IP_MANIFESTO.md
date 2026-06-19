# INTELLECTUAL PROPERTY CONFIRMATION DOCUMENT: ENTERPRISE SECURITY & COMPLIANCE COPILOT RAG ENGINE

This document defines the technical architecture boundaries and ownership of the **Enterprise Security Policy & IT Audit Copilot RAG** artificial intelligence system, developed as a separate advanced security subsystem with a logical structure distinct from the basic business structure of the multi-tenant SaaS platform. This is an important academic proof demonstrating the ability of technological autonomy in the PTIT graduation project.

## 1. Components of the AI RAG Subsystem (Core AI Assets)

The Security Copilot system is built based on the tight integration of the following specific technical components:

### A. Compliance Knowledge Base Infrastructure
- **Physical Knowledge Base:** Tables `public.dharma_documents` (storing raw security policies) and `public.dharma_embeddings` (storing 1536-dimensional vectors). The physical structure is kept intact to ensure absolute backward compatibility.
- **Normalized Data Set (Structured Chunks):** Tens of thousands of quoted policy clauses, standardized according to ISO 27001, with detailed metadata layered by department (`department_id` - physically mapped to `tradition_id`).
- **Specialized Classification:** Risk management terminology relationship graph serving advanced semantic retrieval (Knowledge Graph).

### B. Intelligent Processing Core (Technical RAG Engine)
- **Hybrid Retrieval-Augmented Generation Engine:** Integrated stream processing logic at `supabase/functions/rag-chat/index.ts`.
- **Semantic Caching Engine:** Optimized query repetition algorithm based on Cosine Similarity at table `public.ai_query_cache`, combined with a self-healing mechanism.
- **Multi-Agent Classifier & Policy Expander:** Automatic routing of questions based on specialized departments (`THERAVADA` -> HR, `MAHAYANA` -> IT, `VAJRAYANA` -> Finance, `KHATTSI` -> Board) using `Gemini Flash Lite` before deep retrieval.
- **Compliance Citation System:** Algorithm for automatically generating accurate citations of enterprise policy clauses or ISO 27001 Annex from raw data.

### C. Operation and Monitoring Interface (Admin Security UI)
- **Advanced Console Interface:** Glassmorphism floating widget design with Neon Amber borders, integrated directly into the top-right corner of the `/admin` layout.
- **Real-time Interactive Components:** `AiSecurityCopilotWidget` component integrating security monitoring charts (Security Score), streaming byte feedback, auto-defense activation buttons (Force Logout of unauthorized accounts), and standard Markdown security report export.

## 2. Technical Contribution Roles

| Member | Role | Core Contribution |
| :--- | :--- | :--- |
| **SaaS Architect** | Technical & Infra | Design of RLS Database, JWT Custom Claims, Connection Pooling (Supavisor), WORM Vault, Webhook Alerting, Node JS Ingestion Scripts. |
| **AI Specialist** | Algorithm & Knowledge | Design of Edge Function Hybrid Search, Prompt Engineering, Semantic Caching, Building a test suite for ISO 27001 policy data. |

## 3. Modular Protection Plan

To ensure the AI subsystem can be easily embedded or transferred without affecting the operation of the main SaaS platform:
- **Logical Grouping:** All AI interface logic is packaged entirely within the file `components/admin/ai-security-copilot-widget.tsx`.
- **Database Isolation:** All knowledge data is managed separately through Row Level Security (RLS) at the database level, automatically filtered by `tenant_id` to prevent cross-tenant data leakage between enterprise customers.

---
*Intellectual Property Confirmation Document — PTIT 2026 Graduation Project*