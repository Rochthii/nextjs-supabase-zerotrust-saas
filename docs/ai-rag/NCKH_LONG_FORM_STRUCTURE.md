# 📑 NCKH-02: Thesis Structure for Graduation Project / Research Paper (Extended Version)
## Topic: Designing a Multi-Departmental Security Policy Auditing System in SaaS Platforms based on GraphRAG Architecture
### Expected Scope: 60 - 80 pages | Excellent Graduation Thesis for PTIT Engineering System

---

## 📅 OVERALL REPORT OUTLINE

1. **Procedural Part (Cover, Declaration, Table of Contents, List of Abbreviations, List of Tables and Figures):** 5 pages
2. **Introduction:** 5 pages
3. **Chapter 1: Overview of SaaS Security and Current State of Security Policy Auditing:** 15 pages
4. **Chapter 2: System Architecture and GraphRAG Security Copilot Technical Solution:** 20 pages
5. **Chapter 3: Experimentation, Performance Measurement, and Practical Evaluation:** 15 pages
6. **Conclusion and Future Development:** 5 pages
7. **References & Verification Appendices:** 10+ pages

---

## 🏛️ DETAILED CHAPTER OUTLINE

### INTRODUCTION (5 Pages)
*Answering the question: Why is this topic urgent for the current cloud enterprise environment?*
- **Urgency:** The risk of cross-tenant data leakage in traditional SaaS and the difficulty of Information Security Officers (ISOs) in monitoring compliance audits on a large scale.
- **Objective:** Building a RAG-based security policy auditing system with absolute truthfulness (Zero Hallucination), supporting active defense.
- **Object & Scope:** Multi-departmental security policies (Human Resources & Legal, ISO 27001 Information Security, Financial Auditing, Executive Board Regulations).
- **Research Method:** Experimental measurement of latency, threat simulation to verify RLS, statistical reliability quoting sources.

### CHAPTER 1: THEORETICAL FOUNDATION AND CURRENT STATE (15 Pages)
*Answering the question: How is the world and Vietnam solving this problem?*
- **1.1. RAG Technology and Large Language Models (LLM):** Theory on Embedding, Vector Database, and the limitation of hallucination in commercial black-box LLMs.
- **1.2. GraphRAG and Knowledge Graph:** Why the relationship between policy clauses (e.g., access control regulations referencing penalty clauses) is more important than simple keyword search.
- **1.3. ISO/IEC 27017 Cloud Security Standard Framework:** Analysis of internal information security control clauses.
- **1.4. Current State of Security Policy Auditing Tools:** The lack of automated security policy lookup solutions in enterprises and why ordinary AI chatbots cannot accurately reference standard sources.

### CHAPTER 2: SYSTEM ARCHITECTURE AND TECHNICAL SOLUTION (20 Pages)
*Describing the proposed technical solution in detail (The core chapter to achieve maximum points)*
- **2.1. Policy Processing and Chunking:** Standardizing raw policy PDF data into vector space.
- **2.2. Building a Security Knowledge Graph:** Designing nodes (Policies, Clauses, Applicable Roles) and edges (Reference relationships, penalty relationships, exclusion relationships).
- **2.3. Hybrid Retrieval Algorithm & Source Layering:** Hybrid ranking formula combining dense (vector) and sparse (BM25/FTS) methods, prioritizing official text over interpretive guidance.
- **2.4. System Technology Infrastructure:**
  - Data Layer: Supabase PostgreSQL (pgvector, Full-Text Search).
  - Edge Stream Layer: Deno Edge Runtime (`ReadableStream` & SSE) for optimizing response time, overcoming serverless timeout limits.
  - AI Gateway Layer: Intent classifier (Router) and question expansion agent based on conversation history using Gemini.
- **2.5. Active Defense (SOAR) & Immutability:**
  - Integrating SOAR engine to automatically lock accounts/tenants upon detecting intrusion and sending red alerts to Admin via Telegram Bot using `net.http_post`.
  - Deploying WORM (Write Once Read Many) storage files to protect audit logs against repudiation.

### CHAPTER 3: EXPERIMENTATION AND EVALUATION (15 Pages)
*Presenting actual measurement data from the running system*
- **3.1. Introduction to the SecurityQA Test Dataset:** Compiling a set of compliance questions from system security experts.
- **3.2. Quantitative Results (Metrics):** Significant improvement in Faithfulness, Answer Relevancy, and Citation Accuracy of GraphRAG Security Copilot compared to regular RAG.
- **3.3. RLS PostgreSQL Optimization Experiment ($O(1)$ vs $O(N)$):** Tables and graphs demonstrating the absolute latency reduction effectiveness of Custom Claims JWT compared to traditional JOIN on scaling datasets from 1,000 to 100,000 real data records.
- **3.4. Cross-Tenant Attack Simulation Experiment:** Photographic evidence showing that RLS at the database level prevents 100% of cross-tenant read/write attacks.

### CONCLUSION AND FUTURE DEVELOPMENT (5 Pages)
- Summarizing the academic and practical contributions of the multi-tenant information security project.
- Future development: Integrating AWS S3 Object Lock as a practical WORM vault, automatically scanning source code vulnerabilities using AI Agents.

---

## ✍️ METHODS TO INCREASE DEPTH AND SPECIALIZATION FOR THE THESIS

1. **Standard Academic Architecture Diagrams:** Drawing Zero Trust data flow diagrams, Defense-in-depth hierarchy diagrams, and detailed Entity-Relationship Diagrams (ERD).
2. **Postgres Query Execution Plans (EXPLAIN ANALYZE):** Extracting the text of PostgreSQL query execution plans before and after RLS optimization for inclusion in the thesis appendix.
3. **ISO 27017 Compliance Mapping Table:** Presenting a detailed table mapping each cloud security control clause to the implemented source code evidence within the project.

---
*Thesis outline structure for an excellent graduation thesis — PTIT 2026*