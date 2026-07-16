'use client'

import { useRouter } from 'next/navigation'
import { LogOut, Settings, Shield } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger, PopoverClose } from '@/components/ui/popover'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const tk = {
  bg:     '#09030a',
  card:   'rgba(255,255,255,0.04)',
  cardB:  'rgba(122,30,44,0.4)',
  accent: '#ab1c42',
  lite:   '#e04a6e',
  text:   'rgba(255,255,255,0.92)',
  muted:  'rgba(249,208,216,0.5)',
  dim:    'rgba(249,208,216,0.25)',
}

interface AdminProfilePopoverProps {
  onNavigate?: (section: string) => void
}

export default function AdminProfilePopover({ onNavigate }: AdminProfilePopoverProps) {
  const router = useRouter()

  function handleLogout() {
    sessionStorage.removeItem('mcc_admin_session')
    sessionStorage.removeItem('mcc_admin_email')
    router.push('/admin/login')
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 rounded-xl p-1 pr-3 transition-colors hover:bg-white/5 focus:outline-none">
          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarFallback
              className="text-xs font-bold"
              style={{ background: 'linear-gradient(135deg,#7A1E2C,#ab1c42)', color: '#fff' }}
            >
              MA
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:block text-xs font-medium" style={{ color: tk.muted }}>
            Admin
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        style={{ background: '#140810', borderColor: 'rgba(122,30,44,0.5)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'rgba(122,30,44,0.3)' }}>
          <Avatar className="h-10 w-10">
            <AvatarFallback
              className="text-sm font-bold"
              style={{ background: 'linear-gradient(135deg,#7A1E2C,#ab1c42)', color: '#fff' }}
            >
              MA
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: tk.text }}>MCC Admin</p>
            <p className="text-xs truncate" style={{ color: tk.muted }}>mycreditcafe2026@gmail.com</p>
          </div>
        </div>

        {/* Menu */}
        <div className="py-2 px-2">
          <PopoverClose asChild>
            <button
              onClick={() => onNavigate?.('settings')}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/5"
              style={{ color: tk.muted }}
            >
              <Settings size={14} />
              Configuración
            </button>
          </PopoverClose>

          <div className="flex items-center gap-2 rounded-lg px-3 py-1.5 mt-0.5">
            <Shield size={12} style={{ color: tk.lite }} />
            <span className="text-[10px]" style={{ color: tk.dim }}>Acceso de administrador</span>
          </div>
        </div>

        {/* Logout */}
        <div className="border-t px-2 py-2" style={{ borderColor: 'rgba(122,30,44,0.3)' }}>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-red-950/30"
            style={{ color: '#f87171' }}
          >
            <LogOut size={14} />
            Cerrar sesión
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
