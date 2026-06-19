/**
 * Centralized Supabase queries (Barrel File)
 *
 * Modularized Architecture:
 * 1. public data (cached): unstable_cache + Service Role Client for high performance.
 * 2. admin data (real-time): createClient (SSR) enforcing RLS security.
 */

export * from './queries/shared';
export * from './queries/learning-resources';
export * from './queries/media';
export * from './queries/categories';
export * from './queries/about';
export * from './queries/dashboard';
export * from './queries/layout';
