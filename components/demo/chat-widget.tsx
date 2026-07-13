'use client';

// Floating chat widget — fixed bottom-right, visible on all pages.
//
// Backend contract (not yet wired):
//   SEND:    POST /api/messages { clientId, text, timestamp }
//              → Webhook → WhatsApp Cloud API (same pipe as Verde Law) → MCC team phone
//   RECEIVE: WhatsApp reply → inbound webhook → POST /api/messages/incoming
//              → SSE or 5s polling → append to messages list
//
// CDM alternative to evaluate:
//   CDM "SMS with Twilio" in Notify/Automation may cover the same need without
//   building the WhatsApp bridge from scratch. Confirm CDM Twilio seat is active
//   and supports bidirectional messaging before choosing an approach.

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

interface Message {
  id: string;
  from: 'client' | 'team';
  text: string;
  time: string;
  read: boolean;
}

const MOCK_MESSAGES: Message[] = [
  { id: 'm1', from: 'team',   text: 'Hola Elena, ¿en qué podemos ayudarte hoy?',         time: '10:02', read: true  },
  { id: 'm2', from: 'client', text: '¿Cuándo estará lista la ronda 3?',                   time: '10:15', read: true  },
  { id: 'm3', from: 'team',   text: 'Estamos en proceso. Te avisamos la próxima semana.', time: '10:18', read: false },
];

export function ChatWidget() {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [input,    setInput]    = useState('');
  const bottomRef              = useRef<HTMLDivElement>(null);

  const unread = messages.filter(m => m.from === 'team' && !m.read).length;

  useEffect(() => {
    if (open) {
      setMessages(msgs => msgs.map(m => ({ ...m, read: true })));
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    }
  }, [open]);

  const send = () => {
    if (!input.trim()) return;
    const msg: Message = {
      id:   `m${Date.now()}`,
      from: 'client',
      text: input.trim(),
      time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      read: true,
    };
    setMessages(m => [...m, msg]);
    setInput('');
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  return (
    <>
      {/* Expanded panel */}
      {open && (
        <div
          className="fixed bottom-[5.5rem] right-6 z-50 w-80 rounded-2xl border shadow-2xl overflow-hidden flex flex-col animate-slide-in-up"
          style={{
            height: '420px',
            background:  '#150a0d',
            borderColor: 'rgba(74,8,32,0.55)',
            boxShadow:   '0 8px 40px rgba(0,0,0,0.65), 0 0 0 1px rgba(74,8,32,0.2)',
          }}
        >
          {/* Panel header */}
          <div className="px-4 py-3 flex items-center gap-3 border-b flex-shrink-0"
            style={{ background: 'linear-gradient(90deg,#2a1218,#1e0e12)', borderColor: 'rgba(74,8,32,0.5)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#ab1c42,#4a0820)' }}>
              <span className="text-xs font-bold text-white">MCC</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white">My Credit Café</div>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(249,208,216,0.4)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                Equipo de soporte
              </div>
            </div>
            <button onClick={() => setOpen(false)}
              className="text-wine-400/40 hover:text-wine-200/70 transition-colors flex-shrink-0">
              <X size={15} />
            </button>
          </div>

          {/* Message list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.from === 'client' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[76%]">
                  <div className="px-3 py-2 text-xs leading-relaxed"
                    style={m.from === 'client'
                      ? { background: 'linear-gradient(135deg,#ab1c42,#7a1838)', color: '#fff', borderRadius: '14px 14px 3px 14px' }
                      : { background: '#2a1218', color: 'rgba(249,208,216,0.85)', borderRadius: '14px 14px 14px 3px', border: '1px solid rgba(74,8,32,0.4)' }
                    }>
                    {m.text}
                  </div>
                  <div className="text-[9px] mt-0.5 px-1"
                    style={{ color: 'rgba(249,208,216,0.22)', textAlign: m.from === 'client' ? 'right' : 'left' }}>
                    {m.time}
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input row */}
          <div className="p-3 border-t flex-shrink-0"
            style={{ borderColor: 'rgba(74,8,32,0.4)', background: '#1e0e12' }}>
            <div className="flex gap-2 items-center">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Escribe un mensaje..."
                className="flex-1 text-xs px-3 py-2 rounded-xl outline-none"
                style={{
                  background:  '#2a1218',
                  border:      '1px solid rgba(74,8,32,0.45)',
                  color:       'rgba(249,208,216,0.85)',
                  caretColor:  '#e04a6e',
                }}
              />
              <button
                onClick={send}
                disabled={!input.trim()}
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:brightness-110 disabled:opacity-30"
                style={{ background: 'linear-gradient(135deg,#ab1c42,#7a1838)' }}
              >
                <Send size={13} color="white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating bubble */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          background:  'linear-gradient(135deg,#ab1c42,#7a1838)',
          boxShadow:   '0 4px 24px rgba(171,28,66,0.5), 0 1px 4px rgba(0,0,0,0.3)',
        }}
      >
        {open
          ? <X size={22} color="white" />
          : <MessageCircle size={22} color="white" />
        }
        {!open && unread > 0 && (
          <span
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{ background: '#fff', color: '#ab1c42' }}
          >
            {unread}
          </span>
        )}
      </button>
    </>
  );
}
