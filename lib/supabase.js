
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// REPLACE THESE WITH YOUR ACTUAL SUPABASE CREDENTIALS
const SUPABASE_URL = 'https://pfffotghmcofyrvqynbl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmZmZvdGdobWNvZnlydnF5bmJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNTM4OTYsImV4cCI6MjA4MDgyOTg5Nn0.eo9VOZZGX4do91GYnBCJa6a9mqcbVqqolQDQ4-C9YYc';

if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
    console.warn('Supabase credentials not set. Please update lib/supabase.js');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);