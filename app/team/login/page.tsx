'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SignInCard2 } from '@/components/ui/sign-in-card-2'
import { sendEmailOtp } from '@/lib/supabase'

export default function TeamLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(email: string) {
    setLoading(true)
    const { error } = await sendEmailOtp(email.trim())
    if (!error) {
      sessionStorage.setItem('mcc_team_email', email.trim())
      router.push('/team/otp')
    }
    setLoading(false)
  }

  return <SignInCard2 onSubmit={handleSubmit} loading={loading} />
}
