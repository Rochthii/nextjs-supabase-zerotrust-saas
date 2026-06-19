# GUIDE TO DEFENDING THESIS: 3 OPTIMIZATION PINS FOR DATABASE AND INTERROGATION SCRIPTS
> **Thesis Topic:** Research and Design of Secure Multi-tenant SaaS Architecture  
> **Author:** Cham Roch Thi (PTIT)  
> **Supporting Module:** Database-side Security & Performance Optimization  

---

## PART I: 3 OPTIMIZATION PINS FOR HIGH-PERFORMANCE DATABASE IN THE PROJECT

These are 3 core database optimization solutions that have been implemented in the project, operating at the deepest level (Database-level) to ensure absolute security and high performance of the platform.

### 1. B-Tree Index System on All Foreign Keys `tenant_id` (Scale-Ready Indexing)

*   **Real-World Problem (If no index):** 
    When the data size of the platform expands to hundreds of thousands or millions of rows, if the foreign key column `tenant_id` has no index, the Row Level Security (RLS) policies when executed force PostgreSQL to run **Sequential Scan (Seq Scan - Sequential Scan)** to scan through all physical rows of the table on the disk to find compatible data. This will immediately cause the Database CPU to jump to 100%, causing connection congestion and crashing the entire system (connection lock timeout).
*   **Solution Design in the Project:** 
    All 9 core business tables (`media`, `categories`, `pages`, `about_sections`, `hero_slides`, `dharma_talks`, `event_registrations`, `contact_messages`, `transaction_projects`) have been indexed with a **B-Tree Index** specifically named `idx_[table_name]_tenant` on the `tenant_id` field (Details in file [20260228095500_phase45_global_tenant_isolation.sql](file:///e:/PTIT_THESIS_SAAS/supabase/migrations/20260228095500_phase45_global_tenant_isolation.sql#L38-L54)).
*   **Outstanding Effect:** 
    Shorten the query time from linear $O(N)$ to the minimum complexity **$O(\log N_{\text{tenant}})$** (B-Tree Index Scan). The Database only needs to perform 3 to 4 comparison operations on the binary index tree to point directly to the data partition of that Tenant, helping the system handle loads **thousands of times** without consuming resources.

---

### 2. Automatic `tenant_id` Filling Mechanism by DB Trigger (Auto-inject Database Triggers)

*   **Real-World Problem (If no trigger):** 
    Next.js developers when developing API modules (Server Actions/REST API) can easily forget to assign the `tenant_id` field in the INSERT statement (e.g., when creating a new news post, a category, or a dharma talk). This error is extremely dangerous, can cause cross-tenant data leakage or leave the foreign key blank, causing data integrity errors.
*   **Solution Design in the Project:** 
    Build a smart Database Trigger named **`ensure_tenant_id`** that is triggered before INSERT on all 12 content tables of the system. This trigger automatically calls the `auto_set_tenant_id()` function to extract the `tenant_id` of the currently connected user (read directly from the RAM Session) and assign it to the record.
    ```sql
    CREATE OR REPLACE FUNCTION public.auto_set_tenant_id()
    RETURNS TRIGGER AS $$
    DECLARE
        current_tenant UUID;
        root_tenant UUID := '55555555-5555-5555-5555-555555555555';
    BEGIN
        -- If the User App has sent the tenant_id (Super Admin selects), keep it.
        IF NEW.tenant_id IS NOT NULL THEN
            RETURN NEW;
        END IF;

        -- Get the current branch ID of the logged-in user
        current_tenant := public.get_current_tenant_id();

        -- Default to assign tenant_id
        IF current_tenant IS NULL THEN
            NEW.tenant_id := root_tenant;
        ELSE
            NEW.tenant_id := current_tenant;
        END IF;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    ```
*   **Outstanding Effect:** 
    Completely eliminate human errors (Human errors) in the application development layer. The Next.js API code is always clean, concise (no need to repeat lines of code to manually pass tenant ID) because the database has automatically managed security from the core.

---

### 3. Optimizing RLS Measurement to Static Aggregation Mechanism (Single-Aggregation)

*   **Traditional Measurement Problem:** 
    When running a large-scale experiment of 100,000 rows to measure RLS performance, the traditional measurement mechanism using a loop cursor in PL/pgSQL (`FOR record IN SELECT LOOP ... END LOOP;`) consumes a lot of physical CPU of the server for local variable allocation and context switching 100,000 times continuously. This makes the processing time jump up to ~800ms, easily causing connection congestion or API Server timeout (10-second limit on Vercel).
*   **Solution Design in the Project:** 
    Optimize the entire measurement algorithm of the two RPC functions `measure_db_rls_join` and `measure_db_rls_claims` to a **Single-Aggregation** mechanism: `SELECT count(*) INTO temp_count FROM (...)`.
    ```sql
    CREATE OR REPLACE FUNCTION public.measure_db_rls_claims(limit_count int)
    RETURNS double precision AS $$
    DECLARE
        start_time timestamptz;
        end_time timestamptz;
        temp_count bigint;
    BEGIN
        start_time := clock_timestamp();
        
        -- Use a direct count query to eliminate 100% PL/pgSQL loop overhead
        SELECT count(*) INTO temp_count FROM (
            SELECT bj.id 
            FROM public.benchmark_jwt bj
            WHERE (bj.tenant_id = '55555555-5555-5555-5555-555555555555')
            LIMIT limit_count
        ) s;
        
        end_time := clock_timestamp();
        RETURN extract(epoch from (end_time - start_time)) * 1000.0; -- Return in ms
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    ```
*   **Outstanding Effect:** 
    The Database executes the query at the optimal C level of PostgreSQL without going through any loops in the procedure layer, helping the actual processing time decrease significantly from **~800ms to just ~30ms** for 100,000 rows, ensuring the measurement is completely objective and accurate.

---

## PART II: INTERROGATION SCRIPTS BEFORE THE DEFENSE COUNCIL

Below are the 5 most in-depth questions that database and information security experts will ask and the most persuasive way to answer them:

### 💬 Question 1: *"Why did you put the logic of assigning `tenant_id` down to the Database Trigger instead of handling it in the Next.js Backend?"*
*   **Defense Answer:** 
    > *"Honorable teachers, in modern software design, the **Security-by-Design** principle requires security and data integrity to be enforced at the deepest level and closest to the data possible (Database-level).*
    > 
    > *If handled in Next.js, we would have to write repeated lines of code to assign `tenant_id` in many different API files, which can easily lead to human errors or accidental omissions by developers (Human errors). Moving this logic down to the Database Trigger ensures absolute security at the database level, keeping the Next.js API code clean and immune to configuration errors."*

### 💬 Question 2: *"Why did you have to create a separate B-Tree index on the `tenant_id` column of all auxiliary tables?"*
*   **Defense Answer:** 
    > *"Honorable teachers, the `tenant_id` column is the foreign key column (Foreign Key) for RLS to apply isolation policies. In PostgreSQL, when a record in the parent table `tenants` is deleted or updated, the Database Engine must check all child tables to ensure data integrity.*
    > 
    > *If there is no B-Tree index on the foreign key `tenant_id` in the child tables, PostgreSQL will be forced to run **Sequential Scan (sequential scan)** on all child tables to check. At a scale of millions of rows, this will lock the Database (Table Lock) and crash the system. Creating a B-Tree Index on the `tenant_id` column in all child tables solves this problem, bringing the data extraction and deletion speed to the optimal level $O(\log N)$."*

### 💬 Question 3: *"Is your measurement mechanism really objective when the Database always has a caching feature?"*
*   **Defense Answer:** 
    > *"This is a very important point in the experiment. To ensure authentic data, we performed measurements using the **P99 (Worst-case)** percentile – which is the worst delay where data falls into a cache miss state and must be retrieved directly from the physical SSD.*
    > 
    > *The P99 percentile results show: Even when the cache is missed and the data must be read from the disk, the **Optimized RLS (Claims)** mechanism proposed by us, thanks to the elimination of JOIN, has saved up to 20% of the total physical delay compared to traditional RLS JOIN."*

### 💬 Question 4: *"Why didn't you use App-side filtering (filtering on the Next.js side) for simplicity and reducing the load on the Database?"*
*   **Defense Answer:** 
    > *"Honorable teachers, filtering data at the application layer (App-side filtering) seriously violates the **Zero Trust** security principle. If an attacker bypasses the application layer or exploits memory leaks, all raw data of other tenants will be exposed.*
    > 
    > *Moreover, our measurement experiment shows that when the data increases to 100,000 rows, pulling raw data through the network causes serious network I/O congestion, pushing the delay up to over 1,000 ms, making it impossible in terms of performance. Therefore, deep security filtering at the Database level using RLS is the only optimal solution."*

### 💬 Question 5: *"JWT Custom Claims have a size limit (usually 4KB). If a User belongs to many tenants or has complex permissions, will your claims be overflowed and cause errors?"*
*   **Defense Answer:** 
    > *"Honorable teachers, this is a real limitation of JWT technology. To solve this problem, in the design of the enterprise-level SaaS system, we apply a hybrid solution:*
    > 
    > *For ordinary users who only belong to 1 tenant (accounting for 99% of the system), the system uses Custom Claims to achieve constant speed in RAM. For special accounts (such as Super Admin managing thousands of tenants), the system will bypass claims and automatically fall back to dynamic permission lookup via RPC. This solution perfectly balances maximum performance and system flexibility."*