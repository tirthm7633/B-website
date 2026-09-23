// Vercel serverless function — POST /api/consultation
//
// Sends a consultation-request notification via Resend
// (https://resend.com). Needs a RESEND_API_KEY environment variable set
// in the Vercel project settings; without one, this responds with a
// clear ok:false reason instead of throwing, since the client treats the
// email as best-effort and still shows its own success state regardless
// (see src/components/ConsultationModal.tsx) — a missing/invalid key
// should never block someone from getting their catalog download or
// WhatsApp confirmation.
//
// Uses the Web-standard Request/Response signature Vercel Node functions
// support, so this needs no extra dependency (no @vercel/node types) —
// this file lives outside tsconfig.app.json's "src" include, so it isn't
// part of the Vite app's own type-check/build either; Vercel compiles it
// independently at deploy time.
import { CONSULTATION_EMAIL } from '../src/data/consultation-config'

interface ConsultationPayload {
  name: string
  phone: string
  interest: string
  source: string
  brand?: string
  catalogTitle?: string
  projectTitle?: string
  timestamp: string
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[api/consultation] RESEND_API_KEY is not set in this environment — skipping email send.')
    return new Response(JSON.stringify({ ok: false, reason: 'email_not_configured' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let payload: ConsultationPayload
  try {
    payload = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 })
  }

  if (!payload.name?.trim() || !payload.phone?.trim()) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 })
  }

  const lines = [
    `Name: ${payload.name}`,
    `Phone: ${payload.phone}`,
    `Interested in: ${payload.interest}`,
    `Source: ${payload.source}`,
    payload.brand ? `Brand: ${payload.brand}` : null,
    payload.catalogTitle ? `Catalog: ${payload.catalogTitle}` : null,
    payload.projectTitle ? `Referenced project: ${payload.projectTitle}` : null,
    `Submitted: ${payload.timestamp}`,
  ].filter((line): line is string => line !== null)

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      // TODO: "from" uses Resend's shared onboarding@resend.dev sender,
      // which works with no setup but is rate-limited and clearly not a
      // Buildcon House address — once a real sending domain is verified
      // in Resend, switch this to e.g. "Buildcon House <consultations@buildconhouse.com>".
      body: JSON.stringify({
        from: 'Buildcon House Website <onboarding@resend.dev>',
        to: [CONSULTATION_EMAIL],
        subject: `New consultation request — ${payload.name}`,
        text: lines.join('\n'),
      }),
    })

    if (!res.ok) {
      const detail = await res.text()
      console.error('[api/consultation] Resend API error:', res.status, detail)
      return new Response(JSON.stringify({ ok: false, reason: 'send_failed' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('[api/consultation] Failed to reach Resend:', err)
    return new Response(JSON.stringify({ ok: false, reason: 'network_error' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
