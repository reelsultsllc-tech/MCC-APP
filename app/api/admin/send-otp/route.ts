import { NextResponse } from 'next/server'
import { createHmac, randomInt } from 'crypto'
import { Resend } from 'resend'

const ADMIN_EMAIL = 'mycreditcafe2026@gmail.com'
const OTP_TTL_MS  = 10 * 60 * 1000 // 10 minutes

export async function POST(req: Request) {
  const { email } = await req.json()

  if (!email || email.toLowerCase() !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const otp       = String(randomInt(100000, 999999))
  const timestamp = Date.now()
  const secret    = process.env.OTP_SECRET!
  const hash      = createHmac('sha256', secret).update(`${otp}:${timestamp}`).digest('hex')
  const cookieVal = `${hash}.${timestamp}`

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error } = await resend.emails.send({
    from:    'My Credit Café <system@noreply.mycredit.cafe>',
    to:      ADMIN_EMAIL,
    subject: 'Tu código de acceso — MCC Admin',
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:400px;margin:0 auto;padding:32px 24px;background:#09030a;border-radius:16px;border:1px solid rgba(122,30,44,0.35)">
        <div style="text-align:center;margin-bottom:24px">
          <div style="display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;background:linear-gradient(135deg,#7A1E2C,#5C1520);border-radius:12px">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"/><path d="m9 12 2 2 4-4"/></svg>
          </div>
        </div>
        <h2 style="color:#fff;font-size:18px;font-weight:600;text-align:center;margin:0 0 8px">Código de acceso</h2>
        <p style="color:rgba(249,208,216,0.5);font-size:13px;text-align:center;margin:0 0 28px">MCC Panel de Administración</p>
        <div style="background:rgba(122,30,44,0.18);border:1px solid rgba(122,30,44,0.4);border-radius:12px;padding:20px;text-align:center;margin-bottom:24px">
          <span style="font-size:36px;font-weight:700;letter-spacing:10px;color:#fff">${otp}</span>
        </div>
        <p style="color:rgba(249,208,216,0.35);font-size:11px;text-align:center;margin:0">Válido por 10 minutos. No compartas este código.</p>
      </div>
    `,
  })

  if (error) {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('mcc_otp', cookieVal, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   OTP_TTL_MS / 1000,
    path:     '/',
  })
  return res
}
