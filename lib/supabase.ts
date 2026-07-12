import { createBrowserClient } from '@supabase/ssr'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// OJO: antes esto usaba createClient() de @supabase/supabase-js, que guarda
// la sesión en localStorage. El middleware.ts (que lee la sesión desde las
// cookies) nunca la veía, así que el login "funcionaba" pero el middleware
// trataba al usuario como visitante anónimo y lo devolvía a /login.
// createBrowserClient sincroniza la sesión en cookies además de localStorage,
// para que el navegador y el middleware vean exactamente lo mismo.
export const supabase = createBrowserClient(url, key)
