import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    // Extract shortcode from path (e.g., /abc1234 -> abc1234)
    const shortCode = url.pathname.slice(1)

    if (!shortCode) {
      return new Response("Not Found", { status: 404 })
    }

    // Initialize Supabase Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Find Link
    const { data: link, error } = await supabase
      .from('links')
      .select('id, original_url, password, expires_at, is_active')
      .or(`short_code.eq.${shortCode},custom_slug.eq.${shortCode}`)
      .single()

    if (error || !link || !link.is_active) {
      return new Response("Not Found or Inactive", { status: 404 })
    }

    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return new Response("Link Expired", { status: 410 })
    }

    if (link.password) {
      // In a real edge function, you'd probably redirect them to a password entry page 
      // hosted on your frontend, passing the shortCode as a query param.
      // Example: return Response.redirect(`https://Sudi.app/protected?code=${shortCode}`, 302)
      return new Response("Password Protected - Redirect to UI handled on Client", { status: 401 })
    }

    // Parse Request Details
    const userAgent = req.headers.get('user-agent') || ''
    const device = /Mobi|Android/i.test(userAgent) ? 'mobile' : 'desktop'
    
    // Attempt to parse country/city from Cloudflare/Vercel headers if available
    const country = req.headers.get('cf-ipcountry') || null
    const referrer = req.headers.get('referer') || 'Direct'
    
    // Hash IP for privacy
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    const ipHashBuf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip))
    const ipHash = Array.from(new Uint8Array(ipHashBuf)).map(b => b.toString(16).padStart(2, '0')).join('')

    // Insert Click Data async
    supabase.from('link_clicks').insert({
      link_id: link.id,
      device,
      country,
      referrer,
      ip_hash: ipHash
    }).then(({error}) => {
      if(error) console.error("Error inserting click:", error)
    })

    // Perform Redirect
    return Response.redirect(link.original_url, 301)

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
