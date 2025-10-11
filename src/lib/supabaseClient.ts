"use client";

import { createClient } from "@supabase/supabase-js";

// 使用 NEXT_PUBLIC_ 前缀以便客户端可访问
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);