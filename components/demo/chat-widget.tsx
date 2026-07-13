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
//   building the WhatsApp bridge from scratch.

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

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

// Floating particles for the panel background
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: 'rgba(171,28,66,0.25)',
            left: `${(i * 8.3) % 100}%`,
            bottom: '-4px',
          }}
          animate={{
            y: [0, -(260 + Math.random() * 120)],
            x: [0, (Math.random() - 0.5) * 60],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 5 + (i % 4),
            repeat: Infinity,
            delay: i * 0.55,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

// Typing indicator (three pulsing dots)
function TypingIndicator() {
  return (
    <motion.div
      className="flex items-center gap-1 px-3 py-2 rounded-2xl self-start"
      style={{ background: '#2a1218', borderRadius: '14px 14px 14px 3px', border: '1px solid rgba(74,8,32,0.4)' }}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
    >
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: 'rgba(224,74,110,0.7)' }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.22 }}
        />
      ))}
    </motion.div>
  );
}

export function ChatWidget() {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [input,    setInput]    = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef               = useRef<HTMLDivElement>(null);

  const unread = messages.filter(m => m.from === 'team' && !m.read).length;

  useEffect(() => {
    if (open) {
      setMessages(msgs => msgs.map(m => ({ ...m, read: true })));
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    }
  }, [open]);

  useEffect(() => {
    if (messages.length > 0)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, [messages]);

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
    setIsTyping(true);
    // Simulate team response after delay (remove when backend is live)
    setTimeout(() => {
      setIsTyping(false);
      setMessages(m => [...m, {
        id:   `m${Date.now()}`,
        from: 'team',
        text: 'Gracias por tu mensaje, Elena. Te contactamos en breve.',
        time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        read: true,
      }]);
    }, 1400);
  };

  return (
    <>
      {/* Expanded panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed bottom-[5.5rem] right-6 z-50 w-80 rounded-2xl overflow-hidden flex flex-col"
            style={{
              height: '440px',
              background:  '#150a0d',
              border:      '1px solid rgba(74,8,32,0.55)',
              boxShadow:   '0 8px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(171,28,66,0.15)',
            }}
          >
            {/* Particles inside panel */}
            <Particles />

            {/* Panel header */}
            <div className="relative z-10 px-4 py-3 flex items-center gap-3 border-b flex-shrink-0"
              style={{ background: 'linear-gradient(90deg,#2a1218,#1e0e12)', borderColor: 'rgba(74,8,32,0.5)' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative"
                style={{ background: 'linear-gradient(135deg,#ab1c42,#4a0820)' }}>
                <span className="text-xs font-bold text-white">MCC</span>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2"
                  style={{ borderColor: '#1e0e12' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white">My Credit Café</div>
                <div className="text-xs" style={{ color: 'rgba(249,208,216,0.4)' }}>Equipo de soporte · en línea</div>
              </div>
              <button onClick={() => setOpen(false)}
                className="text-wine-400/40 hover:text-wine-200/70 transition-colors flex-shrink-0">
                <X size={15} />
              </button>
            </div>

            {/* Message list */}
            <div className="relative z-10 flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2.5">
              <AnimatePresence initial={false}>
                {messages.map(m => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className={cn('flex', m.from === 'client' ? 'justify-end' : 'justify-start')}
                  >
                    <div className="max-w-[76%]">
                      <div
                        className="px-3 py-2 text-xs leading-relaxed"
                        style={m.from === 'client'
                          ? { background: 'linear-gradient(135deg,#ab1c42,#7a1838)', color: '#fff', borderRadius: '14px 14px 3px 14px' }
                          : { background: '#2a1218', color: 'rgba(249,208,216,0.88)', borderRadius: '14px 14px 14px 3px', border: '1px solid rgba(74,8,32,0.4)' }
                        }
                      >
                        {m.text}
                      </div>
                      <div className="text-[9px] mt-0.5 px-1"
                        style={{ color: 'rgba(249,208,216,0.22)', textAlign: m.from === 'client' ? 'right' : 'left' }}>
                        {m.time}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              <AnimatePresence>
                {isTyping && <TypingIndicator key="typing" />}
              </AnimatePresence>

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="relative z-10 p-3 border-t flex-shrink-0"
              style={{ borderColor: 'rgba(74,8,32,0.4)', background: '#1e0e12' }}>
              <div className="flex gap-2 items-center">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 text-xs px-3 py-2 rounded-xl outline-none transition-all"
                  style={{
                    background:  '#2a1218',
                    border:      '1px solid rgba(74,8,32,0.45)',
                    color:       'rgba(249,208,216,0.88)',
                    caretColor:  '#e04a6e',
                  }}
                />
                <motion.button
                  onClick={send}
                  disabled={!input.trim()}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-30"
                  style={{ background: 'linear-gradient(135deg,#ab1c42,#7a1838)' }}
                >
                  <Send size={13} color="white" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating bubble */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center"
        style={{
          background:  'linear-gradient(135deg,#ab1c42,#7a1838)',
          boxShadow:   '0 4px 24px rgba(171,28,66,0.55), 0 1px 4px rgba(0,0,0,0.35)',
        }}
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="x"  initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}><X size={22} color="white" /></motion.div>
            : <motion.div key="mc" initial={{ rotate: 90, opacity: 0 }}  animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}><MessageCircle size={22} color="white" /></motion.div>
          }
        </AnimatePresence>

        {/* Unread badge */}
        <AnimatePresence>
          {!open && unread > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ background: '#fff', color: '#ab1c42' }}
            >
              {unread}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
