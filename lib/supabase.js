
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

/**
 * Recursively rewrites any Supabase storage URLs (e.g. *.supabase.co/storage/...)
 * into our domain's proxied URL (/api/supabase/storage/...) so Indian ISPs cannot block images.
 */
export function deepProxyUrls(target) {
    if (!target) return target;
    if (!isBrowser || isLocalhost) return target;

    const proxyOrigin = `${window.location.origin}/api/supabase`;

    function transform(val) {
        if (typeof val === 'string') {
            if (val.includes(DIRECT_SUPABASE_URL)) {
                return val.replaceAll(DIRECT_SUPABASE_URL, proxyOrigin);
            }
            return val;
        }
        if (Array.isArray(val)) {
            return val.map(transform);
        }
        if (val !== null && typeof val === 'object') {
            // Avoid mutating class instances like Dates, Blobs, HTML elements
            if (val.constructor && val.constructor.name !== 'Object') {
                return val;
            }
            const res = {};
            for (const key of Object.keys(val)) {
                res[key] = transform(val[key]);
            }
            return res;
        }
        return val;
    }

    return transform(target);
}

// Make globally accessible
if (isBrowser) {
    window.deepProxyUrls = deepProxyUrls;
    window.proxySupabaseUrl = deepProxyUrls;
}

const rawClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function wrapBuilder(builder) {
    return new Proxy(builder, {
        get(target, prop) {
            if (prop === 'then') {
                return function(resolve, reject) {
                    return target.then((res) => {
                        if (res && res.data) {
                            res.data = deepProxyUrls(res.data);
                        }
                        return resolve ? resolve(res) : res;
                    }, reject);
                };
            }
            const val = target[prop];
            if (typeof val === 'function') {
                return function(...args) {
                    const result = val.apply(target, args);
                    if (result && typeof result.then === 'function') {
                        return wrapBuilder(result);
                    }
                    return result;
                };
            }
            return val;
        }
    });
}

// Export wrapped client that automatically proxies any image/storage URLs returned by database queries
export const supabase = new Proxy(rawClient, {
    get(target, prop) {
        if (prop === 'from') {
            return function(...args) {
                const builder = target.from(...args);
                return wrapBuilder(builder);
            };
        }
        return target[prop];
    }
});