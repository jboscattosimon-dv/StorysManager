import type { StoryFrame } from '../types'

const CLIENT_ID = import.meta.env.VITE_CANVA_CLIENT_ID as string | undefined

// ── Storage keys ──────────────────────────────────────────────────
const TOKEN_KEY    = 'canva_access_token'
const VERIFIER_KEY = 'canva_code_verifier'
const PENDING_KEY  = 'canva_pending_upload'   // frames saved before OAuth redirect

// ── PKCE ─────────────────────────────────────────────────────────
function randomB64url(len: number) {
  const b = new Uint8Array(len)
  crypto.getRandomValues(b)
  return btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async function sha256B64url(plain: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(plain))
  return btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

// ── Token ─────────────────────────────────────────────────────────
export const canvaConfigured = Boolean(CLIENT_ID)
export const getCanvaToken = () => sessionStorage.getItem(TOKEN_KEY)
export const clearCanvaToken = () => sessionStorage.removeItem(TOKEN_KEY)

// ── Pending upload (survives OAuth redirect) ──────────────────────
interface PendingUpload { frames: StoryFrame[]; projectName: string }

export function savePendingUpload(data: PendingUpload) {
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(data))
}

export function popPendingUpload(): PendingUpload | null {
  const raw = sessionStorage.getItem(PENDING_KEY)
  sessionStorage.removeItem(PENDING_KEY)
  try { return raw ? JSON.parse(raw) : null } catch { return null }
}

// ── OAuth: start (saves pending frames before redirect) ───────────
export async function startCanvaOAuth(pending?: PendingUpload) {
  if (!CLIENT_ID) throw new Error('VITE_CANVA_CLIENT_ID não configurado no Vercel.')

  if (pending) savePendingUpload(pending)

  const verifier  = randomB64url(32)
  const challenge = await sha256B64url(verifier)
  sessionStorage.setItem(VERIFIER_KEY, verifier)

  const redirectUri = window.location.origin
  const url = new URL('https://www.canva.com/api/oauth/authorize')
  url.searchParams.set('response_type',         'code')
  url.searchParams.set('client_id',             CLIENT_ID)
  url.searchParams.set('scope',                 'asset:write design:content:write')
  url.searchParams.set('code_challenge',        challenge)
  url.searchParams.set('code_challenge_method', 'S256')
  url.searchParams.set('state',                 'canva_save')

  window.location.href = url.toString()
}

// ── OAuth: exchange code → token ──────────────────────────────────
export async function exchangeCanvaCode(code: string): Promise<void> {
  const verifier = sessionStorage.getItem(VERIFIER_KEY)
  if (!verifier) throw new Error('PKCE verifier não encontrado. Tente conectar novamente.')

  const res = await fetch('/api/canva-token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ code, code_verifier: verifier, redirect_uri: window.location.origin }),
  })

  const data = await res.json()
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description ?? data.error ?? `HTTP ${res.status}`)
  }

  sessionStorage.setItem(TOKEN_KEY, data.access_token)
  sessionStorage.removeItem(VERIFIER_KEY)
}

// ── Render story frame → PNG Blob ─────────────────────────────────
export function frameToBlob(frame: StoryFrame): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    canvas.width = 1080; canvas.height = 1920
    const ctx = canvas.getContext('2d')!

    const stops = frame.backgroundColor.match(/#[0-9a-fA-F]{3,6}/g) ?? ['#111', '#333']
    if (frame.backgroundColor.startsWith('linear')) {
      const grad = ctx.createLinearGradient(0, 0, 1080, 1920)
      stops.forEach((c, i) => grad.addColorStop(i / Math.max(stops.length - 1, 1), c))
      ctx.fillStyle = grad
    } else {
      ctx.fillStyle = frame.backgroundColor
    }
    ctx.fillRect(0, 0, 1080, 1920)

    const drawText = () => {
      frame.textElements.forEach(el => {
        ctx.save()
        ctx.translate((el.x / 100) * 1080, (el.y / 100) * 1920)
        ctx.rotate((el.rotation * Math.PI) / 180)
        ctx.font = `${el.italic ? 'italic ' : ''}${el.bold ? 'bold ' : ''}${el.fontSize}px "${el.fontFamily}"`
        ctx.fillStyle = el.color
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.shadowColor = 'rgba(0,0,0,0.4)'
        ctx.shadowBlur = 20
        ctx.fillText(el.content, 0, 0)
        ctx.restore()
      })
      canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/png')
    }

    if (frame.imageUrl) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 1080, 1920)
        if (frame.overlayColor) { ctx.fillStyle = frame.overlayColor; ctx.fillRect(0, 0, 1080, 1920) }
        drawText()
      }
      img.onerror = drawText
      img.src = frame.imageUrl
    } else {
      drawText()
    }
  })
}

// ── Upload asset → Canva media library ────────────────────────────
async function uploadAsset(blob: Blob, name: string, token: string): Promise<string> {
  const nameB64 = btoa(unescape(encodeURIComponent(name)))

  const res = await fetch('https://api.canva.com/rest/v1/assets', {
    method: 'POST',
    headers: {
      Authorization:           `Bearer ${token}`,
      'Content-Type':          'image/png',
      'Asset-Upload-Metadata': JSON.stringify({ name_base64: nameB64, import_type: 'RASTER' }),
    },
    body: blob,
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.message ?? data.error ?? `Upload falhou (${res.status})`)

  // Response can be immediate or async job
  if (data.asset?.id) return data.asset.id
  if (data.job?.id)   return pollJob(data.job.id, token)
  throw new Error('Canva não retornou ID do asset.')
}

async function pollJob(jobId: string, token: string, tries = 0): Promise<string> {
  if (tries > 30) throw new Error('Upload demorou demais. Tente novamente.')
  await new Promise(r => setTimeout(r, 2000))

  const res  = await fetch(`https://api.canva.com/rest/v1/asset-uploads/${jobId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json()
  const job  = data.job ?? data

  if (job.status === 'success') return job.asset?.id ?? ''
  if (job.status === 'failed')  throw new Error('Upload rejeitado pelo Canva.')
  return pollJob(jobId, token, tries + 1)
}

// ── Create Canva design from asset ────────────────────────────────
async function createDesign(assetId: string, name: string, token: string): Promise<string> {
  const res = await fetch('https://api.canva.com/rest/v1/designs', {
    method:  'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify({ design_type: { name: 'Instagram Story' }, asset_id: assetId, title: name }),
  })
  const data = await res.json()

  // Return edit URL if available, else fallback to projects page
  return data.design?.urls?.edit_url
      ?? data.design?.urls?.view_url
      ?? 'https://www.canva.com/your-projects'
}

// ── Main: save frames → Canva ─────────────────────────────────────
export async function saveFramesToCanva(
  frames: StoryFrame[],
  projectName: string,
  onProgress?: (msg: string) => void
): Promise<string[]> {
  const token = getCanvaToken()
  if (!token) throw new Error('NOT_AUTHENTICATED')

  const urls: string[] = []

  for (let i = 0; i < frames.length; i++) {
    const name = frames.length > 1 ? `${projectName} — Story ${i + 1}` : projectName
    onProgress?.(`Renderizando story ${i + 1}/${frames.length}...`)
    const blob    = await frameToBlob(frames[i])

    onProgress?.(`Enviando story ${i + 1}/${frames.length} para o Canva...`)
    const assetId = await uploadAsset(blob, name, token)

    onProgress?.(`Criando design ${i + 1}/${frames.length}...`)
    const url     = await createDesign(assetId, name, token)
    urls.push(url)
  }

  return urls
}
