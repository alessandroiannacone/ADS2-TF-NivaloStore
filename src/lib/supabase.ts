import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://yrxortvkcnkgxegnjxme.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_Dg7NghuJBB4EFziIXHgJCQ_sb-5wi7W';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://tu-proyecto.supabase.co' &&
  supabaseAnonKey !== 'pega_aqui_tu_publishable_key' &&
  supabaseAnonKey !== 'tu-anon-key'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

