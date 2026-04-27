// Vercel serverless function — exchanges Canva OAuth code for access token.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') { res.status(204).end(); return }
  if (req.method !== 'POST')   { res.status(405).json({ error: 'Method not allowed' }); return }

  const clientId     = process.env.CANVA_CLIENT_ID
  const clientSecret = process.env.CANVA_CLIENT_SECRET

  console.log('[canva-token] clientId present:', !!clientId)
  console.log('[canva-token] clientSecret present:', !!clientSecret)

  if (!clientId || !clientSecret) {
    res.status(500).json({ error: 'Missing CANVA_CLIENT_ID or CANVA_CLIENT_SECRET env vars on server' })
    return
  }

  const body = req.body ?? {}
  const { code, code_verifier, redirect_uri } = body

  console.log('[canva-token] code present:', !!code)
  console.log('[canva-token] code_verifier present:', !!code_verifier)
  console.log('[canva-token] redirect_uri:', redirect_uri)

  if (!code || !code_verifier || !redirect_uri) {
    res.status(400).json({ error: 'Missing code, code_verifier or redirect_uri', received: { code: !!code, code_verifier: !!code_verifier, redirect_uri } })
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

  console.log('[canva-token] calling Canva token endpoint...')

  const upstream = await fetch('https://api.canva.com/rest/v1/oauth/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    params.toString(),
  })

  const data = await upstream.json()
  console.log('[canva-token] Canva response status:', upstream.status)
  console.log('[canva-token] Canva response keys:', Object.keys(data))

  res.status(upstream.status).json(data)
}
