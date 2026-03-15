import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://izfisvtcxlkguktrpdpy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6ZmlzdnRjeGxrZ3VrdHJwZHB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NTc4ODUsImV4cCI6MjA4OTEzMzg4NX0.t6kVYiHIMHyHFaeYEqgXQ7zy_vnXe_QpyQCBE5ScTIE';

export const gallerySupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const GENERATE_URL = `${SUPABASE_URL}/functions/v1/generate-image`;
export { SUPABASE_ANON_KEY };
