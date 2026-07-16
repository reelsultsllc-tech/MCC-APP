import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'

const OTP_TTL_MS = 10 * 60 * 1000 // 10 minutes

export async function POST(req: Request) {
  const { otp } = await req.json()

  const cookieStore = await cookies()
  const cookieVal   = cookieStore.get('mcc_otp')?.value

  if (!cookieVal) {
    return NextResponse.json({ error: 'OTP expirado. Solicita uno nuevo.' }, { status: 400 })
  }

  const [storedHash, tsStr] = cookieVal.split('.')
  const timestamp = parseInt(tsStr, 10)

  if (isNaN(timestamp) || Date.now() - timestamp > OTP_TTL_MS) {
    return NextResponse.json({ error: 'OTP expirado. Solicita uno nuevo.' }, { status: 400 })
  }

  const secret   = process.env.OTP_SECRET!
  const expected = createHmac('sha256', secret).update(`${otp}:${timestamp}`).digest('hex')

  const match =
    expected.length === storedHash.length &&
    timingSafeEqual(Buffer.from(expected), Buffer.from(storedHash))

  if (!match) {
    return NextResponse.json({ error: 'Código incorrecto. Revisa tu correo.' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  // Clear OTP cookie after successful verification
  res.cookies.set('mcc_otp', '', { maxAge: 0, path: '/' })
  return res
}
