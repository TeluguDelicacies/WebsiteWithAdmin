
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm';

// Supabase Client Configuration
// In production, requests route through the Netlify proxy (/api/supabase)
// to prevent Indian ISPs (ACT Fibernet, JioFiber, Airtel) from poisoning/blocking *.supabase.co
const isBrowser = typeof window !== 'undefined';
const isLocalhost = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const DIRECT_SUPABASE_URL = 'https://pfffotghmcofyrvqynbl.supabase.co';
const SUPABASE_URL = (isBrowser && !isLocalhost)
    ? `${window.location.origin}/api/supabase`
    : DIRECT_SUPABASE_URL;

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmZmZvdGdobWNvZnlydnF5bmJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNTM4OTYsImV4cCI6MjA4MDgyOTg5Nn0.eo9VOZZGX4do91GYnBCJa6a9mqcbVqqolQDQ4-C9YYc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);