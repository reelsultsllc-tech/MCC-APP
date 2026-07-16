'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { sendEmailOtp } from '@/lib/supabase'
import { ShieldCheck, Mail } from 'lucide-react'

const ADMIN_EMAIL = 'mycreditcafe2026@gmail.com'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim().toLowerCase()
    if (trimmed !== ADMIN_EMAIL) {
      setError('Acceso no autorizado para este correo.')
      return
    }
    setLoading(true)
    setError('')
    const { error: err } = await sendEmailOtp(trimmed)
    if (err) {
      setError('Error al enviar el código. Intenta de nuevo.')
      setLoading(false)
      return
    }
    sessionStorage.setItem('mcc_admin_email', trimmed)
    router.push('/admin/otp')
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{ background: 'linear-gradient(160deg,#09030a 0%,#1a0c10 100%)' }}
    >
      {/* Brand */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2.5 mb-8"
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#7A1E2C,#5C1520)', boxShadow: '0 6px 20px rgba(122,30,44,0.4)' }}
        >
          <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 text-white w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>
        <div>
          <p className="font-lora font-bold text-white text-base leading-tight">MCC Admin</p>
          <p className="text-[10px]" style={{ color: 'rgba(249,208,216,0.4)' }}>Acceso restringido</p>
        </div>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="w-full max-w-[360px] rounded-2xl border p-6"
        style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(122,30,44,0.4)' }}
      >
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck size={16} color="#e04a6e" />
          <h1 className="font-lora text-lg font-semibold text-white">Acceso de administrador</h1>
        </div>
        <p className="text-xs mb-5" style={{ color: 'rgba(249,208,216,0.5)' }}>
          Solo el correo autorizado puede continuar.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'rgba(249,208,216,0.4)' }}>
              Correo electrónico
            </label>
            <div className="flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 transition-colors"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: error ? 'rgba(248,113,113,0.5)' : 'rgba(122,30,44,0.45)' }}>
              <Mail size={14} color="rgba(249,208,216,0.35)" />
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                placeholder="correo@ejemplo.com"
                autoFocus
                className="flex-1 bg-transparent text-sm outline-none text-white placeholder:opacity-30"
              />
            </div>
            {error && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="text-xs mt-1.5" style={{ color: '#f87171' }}>
                {error}
              </motion.p>
            )}
          </div>

          <button
            type="submit"
            disabled={!email || loading}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(180deg,#9b3545 0%,#7A1E2C 100%)', boxShadow: email ? '0 6px 20px -4px rgba(122,30,44,0.5)' : 'none' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
                Enviando código...
              </span>
            ) : 'Continuar →'}
          </button>
        </form>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-[10px] mt-6 text-center"
        style={{ color: 'rgba(249,208,216,0.25)' }}
      >
        My Credit Café · Panel de Administración
      </motion.p>
    </main>
  )
}
