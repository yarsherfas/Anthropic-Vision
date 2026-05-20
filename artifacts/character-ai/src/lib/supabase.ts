import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://bcfwjnnuyfenlgeglydf.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjZndqbm51eWZlbmxnZWdseWRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNjI5NjAsImV4cCI6MjA5NDgzODk2MH0.XefhArwwr4sbDHAhyzqe2I4f-k6LskpqpWF5iev6v9A";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
