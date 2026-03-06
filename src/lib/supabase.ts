import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Allow running without Supabase (local-state mode)
export const supabase = url && key ? createClient(url, key) : null;
