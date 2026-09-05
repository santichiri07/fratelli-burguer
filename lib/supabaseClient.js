import { createClient } from "@supabase/supabase-js";

/* Estas dos variables vienen del archivo .env.local
   (no las escribas acá directamente) */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);