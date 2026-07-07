'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MccLogo from '@/components/MccLogo'

const CROA_FULL_TEXT = `Credit Repair Organizations Act (CROA) — Sus Derechos

Bajo la Credit Repair Organizations Act (15 U.S.C. § 1679 et seq.), usted tiene los siguientes derechos:

1. Derecho a cancelar: Puede cancelar el contrato con My Credit Coffee sin costo ni penalidad dentro de los primeros 3 días hábiles de haber firmado el contrato.

2. Pago previo a servicios: Ninguna organización de reparación de crédito puede cobrar ni aceptar pago antes de haber completado los servicios prometidos.

3. Información veraz: Tiene derecho a recibir información completa y veraz sobre los servicios a prestarse y los resultados esperados.

4. Contrato por escrito: Tiene derecho a un contrato escrito que describa los servicios, tarifas y términos de cancelación.

5. Prohibición de engaños: La organización no puede hacer representaciones falsas o engañosas sobre sus servicios, experiencia o resultados.

6. No puede borrar información precisa: Información verdadera, verificable y que no esté desactualizada no puede ser legalmente eliminada de su reporte de crédito.

Para ejercer cualquiera de estos derechos o para más información, contáctenos en support@mycreditcoffee.com`

export default function DisclosurePage() {
  const router = useRouter()
  const [croaChecked, setCroaChecked] = useState(false)
  const [cancelChecked, setCancelChecked] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const canContinue = croaChecked && cancelChecked

  function handleContinue() {
    if (!canContinue) return
    // Mark disclosure as done
    sessionStorage.setItem('mcc_disclosure_done', 'true')
    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen bg-[#F7F5F4] flex flex-col items-center justify-start px-6 py-10">
      <div className="w-full max-w-[430px]">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <MccLogo size={52} />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-lora text-2xl font-medium text-[#241014] mb-2">
            Antes de empezar
          </h1>
          <p className="text-sm text-[#57504E]">
            Por favor lee y acepta los siguientes puntos para continuar.
          </p>
        </div>

        {/* Checkboxes */}
        <div className="space-y-4 mb-6">
          {/* CROA checkbox */}
          <button
            onClick={() => setCroaChecked(!croaChecked)}
            className="w-full text-left flex items-start gap-3 bg-white rounded-xl border border-[#E7E2E1] p-4 shadow-sm transition-colors hover:border-[#7A1E2C]"
          >
            <div
              className={`
                mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                ${croaChecked ? 'bg-[#7A1E2C] border-[#7A1E2C]' : 'bg-white border-[#E7E2E1]'}
              `}
            >
              {croaChecked && (
                <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                  <path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <p className="text-sm text-[#241014] leading-relaxed">
              Entiendo que bajo la{' '}
              <span className="font-medium">Credit Repair Organizations Act</span>, tengo
              derecho a cancelar este contrato sin costo dentro de los primeros 3 días hábiles.
            </p>
          </button>

          {/* Cancellation checkbox */}
          <button
            onClick={() => setCancelChecked(!cancelChecked)}
            className="w-full text-left flex items-start gap-3 bg-white rounded-xl border border-[#E7E2E1] p-4 shadow-sm transition-colors hover:border-[#7A1E2C]"
          >
            <div
              className={`
                mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                ${cancelChecked ? 'bg-[#7A1E2C] border-[#7A1E2C]' : 'bg-white border-[#E7E2E1]'}
              `}
            >
              {cancelChecked && (
                <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                  <path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <p className="text-sm text-[#241014] leading-relaxed">
              Entiendo que puedo cancelar el servicio en cualquier momento con un aviso de{' '}
              <span className="font-medium">30 días</span>.
            </p>
          </button>
        </div>

        {/* Rights link */}
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 text-sm text-[#7A1E2C] font-medium mb-8 hover:underline"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#7A1E2C" strokeWidth="1.4" />
            <text x="8" y="12" textAnchor="middle" fontSize="9" fill="#7A1E2C" fontFamily="system-ui" fontWeight="600">i</text>
          </svg>
          Ver mis derechos completos
        </button>

        {/* Continue button */}
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className="
            w-full py-3.5 rounded-xl font-medium text-base text-white
            bg-[#7A1E2C] hover:bg-[#5C1520] active:bg-[#5C1520]
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-colors duration-150
          "
        >
          Continuar al portal
        </button>
      </div>

      {/* Rights Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 px-4 pb-0"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <div className="bg-white w-full max-w-[430px] rounded-t-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E7E2E1]">
              <h2 className="font-lora text-lg font-medium text-[#241014]">Tus derechos (CROA)</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#9C9492] hover:text-[#241014] transition-colors"
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M6 6L16 16M16 6L6 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-4">
              <pre className="text-sm text-[#57504E] whitespace-pre-wrap leading-relaxed font-body">
                {CROA_FULL_TEXT}
              </pre>
            </div>
            <div className="px-5 py-4 border-t border-[#E7E2E1]">
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3 rounded-xl font-medium text-[#7A1E2C] border border-[#7A1E2C] hover:bg-[#F7F5F4] transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
