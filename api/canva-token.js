// Vercel serverless function — exchanges Canva OAuth code for access token.
// Accepts CANVA_CLIENT_ID or VITE_CANVA_CLIENT_ID (whichever the user set).
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') { res.status(204).end(); return }
  if (req.method !== 'POST')   { res.status(405).json({ error: 'Method not allowed' }); return }

  // Accept either naming convention
  const clientId     = process.env.CANVA_CLIENT_ID     ?? process.env.VITE_CANVA_CLIENT_ID
  const clientSecret = process.env.CANVA_CLIENT_SECRET ?? process.env.VITE_CANVA_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    console.error('[canva-token] Missing env vars. Have:', Object.keys(process.env).filter(k => k.includes('CANVA')))
    res.status(500).json({ error: 'Server missing CANVA credentials. Set CANVA_CLIENT_ID and CANVA_CLIENT_SECRET in Vercel env vars.' })
    return
  }

  const { code, code_verifier, redirect_uri } = req.body ?? {}
  if (!code || !code_verifier || !redirect_uri) {
    res.status(400).json({ error: 'Missing required fields', received: { code: !!code, code_verifier: !!code_verifier, redirect_uri } })
    return
  }

  const params = new URLSearchParams({
    grant_type:    'authorization_code',
    code,
    redirect_uri,
    client_id:     clientId,
    client_secret: clientSecret,
    code_verifier,
  })

  let upstream
  try {
    upstream = await fetch('https://api.canva.com/rest/v1/oauth/token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    params.toString(),
    })
  } catch (e) {
    console.error('[canva-token] Fetch to Canva failed:', e)
    res.status(502).json({ error: 'Failed to reach Canva servers.' })
    return
  }

  const data = await upstream.json()
  console.log('[canva-token] Canva status:', upstream.status, '| keys:', Object.keys(data))
  res.status(upstream.status).json(data)
}
