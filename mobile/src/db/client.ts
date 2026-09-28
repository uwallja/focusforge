/**
 * Supabase client.
 *
 * One client for both data (`supabase.from(...)`) and auth (`supabase.auth.*`). The backend is
 * tinbase, which speaks the Supabase API, so nothing here is vendor-specific — the same code runs
 * against Supabase itself.
 *
 * WHY THERE IS NO ADAPTER LAYER
 * This template previously went through @vibecode-db/client, choosing between a mock adapter and a
 * Supabase adapter at runtime, with the schema duplicated in TypeScript. That indirection is gone:
 * the schema lives in supabase/migrations/*.sql and is applied to a real database, so there is one
 * way to reach data and it behaves the same in development and production.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import type { Database } from './types';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
const hasSupabaseConfig = Boolean(url && anonKey);

if (!hasSupabaseConfig) {
  console.warn('[db] Local-only mode: EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY are not set. The app will run with a mock client and persisted local data only.');
}

const createLocalClient = () => ({
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
    signUp: async () => ({ data: { user: null, session: null }, error: null }),
    signOut: async () => ({ error: null }),
  },
  from: () => ({
    select: async () => ({ data: [], error: null }),
    insert: async () => ({ data: null, error: null }),
    update: async () => ({ data: null, error: null }),
    delete: async () => ({ data: null, error: null }),
    eq: () => ({ select: async () => ({ data: [], error: null }), insert: async () => ({ data: null, error: null }), update: async () => ({ data: null, error: null }), delete: async () => ({ data: null, error: null }) }),
    order: () => ({ limit: async () => ({ data: [], error: null }) }),
  }),
  channel: () => ({
    on: () => ({ subscribe: () => ({ status: 'SUBSCRIBED' }) }),
    subscribe: () => ({ status: 'SUBSCRIBED' }),
  }),
});

export const supabase = hasSupabaseConfig
  ? createClient<Database>(url, anonKey, {
      auth: {
        // AsyncStorage on native, where there is no window. NOT on web: the web
        // bundle is also evaluated in Node — the dev server bundles it at boot, and
        // AsyncStorage reaches for `window` the moment Supabase restores a session,
        // which throws `ReferenceError: window is not defined` and takes the whole
        // dev server down before it ever listens. Leaving storage undefined lets
        // Supabase pick localStorage in a browser and an in-memory store elsewhere,
        // both of which are window-safe.
        storage: Platform.OS === 'web' ? undefined : AsyncStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : (createLocalClient() as any);

// Preview auto sign-in is only attempted when a real Supabase project is configured.
if (hasSupabaseConfig && (process.env.EXPO_PUBLIC_RAPIDNATIVE_MODE === 'designer' || process.env.EXPO_PUBLIC_RAPIDNATIVE_MODE === 'staging')) {
  void supabase.auth.getUser().then(async ({ data, error }) => {
    if (!error && data?.user) return;
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: 'demo@rapidnative.com',
      password: 'rapidnative-demo',
    });
    if (signInError) {
      console.warn('[preview-auth] demo sign-in failed:', signInError.message);
      return;
    }
    const { queryClient } = await import('@/src/lib/queryClient');
    queryClient.invalidateQueries({ queryKey: ['auth'] });
  });
}

export default supabase;
