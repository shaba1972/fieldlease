import dotenv from "dotenv";
dotenv.config();

console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SERVICE_ROLE_KEY exists:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
import { createClient } from "@supabase/supabase-js";


export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);