'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User as UserIcon, X, Lightbulb, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CHAT_PRESETS } from '@/lib/mockData';
import { api } from '@/lib/api';
import type { ChatMessage } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=';

function renderMarkdown(text: string): string {
  if (!text) return '';
  let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const lines = html.split('\n');
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^\s*\|/.test(line)) {
      const rows: string[] = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) { rows.push(lines[i]); i++; }
      const dataRows = rows.filter(l => !/^\s*\|[\s\-:|]+\|\s*$/.test(l));
      if (dataRows.length) {
        let t = '<table style="border-collapse:collapse;width:100%;font-size:11px;margin:6px 0">';
        dataRows.forEach((row, ri) => {
          const cells = row.split('|').filter((_, ci, arr) => ci > 0 && ci < arr.length - 1);
          t += '<tr>';
          cells.forEach(c => { const tag = ri === 0 ? 'th' : 'td'; t += `<${tag} style="border:1px solid #e5e7eb;padding:3px 6px;${ri === 0 ? 'background:#f3f4f6;font-weight:600' : ''}">${inline(c.trim())}</${tag}>`; });
          t += '</tr>';
        });
        out.push(t + '</table>');
      }
      continue;
    }
    if (/^\s*[-*•]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*•]\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*[-*•]\s+/, '')); i++; }
      out.push('<ul style="margin:4px 0;padding-left:18px">' + items.map(it => `<li style="margin:2px 0">${inline(it)}</li>`).join('') + '</ul>');
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*\d+\.\s+/, '')); i++; }
      out.push('<ol style="margin:4px 0;padding-left:18px">' + items.map(it => `<li style="margin:2px 0">${inline(it)}</li>`).join('') + '</ol>');
      continue;
    }
    if (/^\s*#{1,4}\s+/.test(line)) {
      const m = line.match(/^\s*(#{1,4})\s+(.*)/);
      if (m) { out.push(`<p style="font-weight:700;margin:6px 0 2px">${inline(m[2])}</p>`); i++; continue; }
    }
    if (line.trim() === '') { out.push('<br/>'); i++; continue; }
    out.push(`<p style="margin:2px 0;line-height:1.5">${inline(line)}</p>`);
    i++;
  }
  return out.join('');
}

function inline(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '<code style="background:#f3f4f6;border-radius:3px;padding:1px 4px;font-family:monospace;font-size:11px">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

export default function ChatbotOverlay({ isOpen, onClose, messages, setMessages }: Props) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dbContext, setDbContext] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { if (isOpen) inputRef.current?.focus(); }, [isOpen]);

  useEffect(() => {
    async function loadCtx() {
      try {
        const invData = await api.get<{ success: boolean; items: Array<{ name: string; status: string; qty: number; unit: string; location: string }> }>('/inventory');
        if (invData.success) setDbContext(`Live inventory (${invData.items?.length} items): ${JSON.stringify((invData.items ?? []).slice(0, 10))}`);
      } catch {}
    }
    if (isOpen) Promise.resolve().then(loadCtx);
  }, [isOpen]);

  async function sendMessage(text: string) {
    if (!text.trim() || isLoading) return;
    const userMsg: ChatMessage = { id: Date.now(), sender: 'user', text: text.trim(), time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? '';
    const systemPrompt = `You are Aro, the AromaSys AI Copilot — a warehouse AI assistant. Context: ${dbContext || 'Warehouse management system'}. Answer concisely and helpfully.`;
    const prompt = `${systemPrompt}\n\nUser: ${text.trim()}`;

    let responseText = '';
    for (const model of ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash']) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        });
        if (!res.ok) continue;
        const data = await res.json();
        responseText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        if (responseText) break;
      } catch { continue; }
    }

    if (!responseText) responseText = 'Maaf, saya tidak dapat terhubung ke AI saat ini.';
    const aiMsg: ChatMessage = { id: Date.now() + 1, sender: 'ai', text: responseText, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]" onClick={onClose} />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-full max-w-[420px] bg-white shadow-2xl z-[61] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-stone-100 bg-[#2C742F] text-white shrink-0">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">Aro — AromaSys Copilot</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#AAE970] animate-pulse" />
                  <span className="text-xs text-white/80">Connected to warehouse DB</span>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${msg.sender === 'ai' ? 'bg-[#2C742F] text-white' : 'bg-stone-200 text-[#1C1B1F]'}`}>
                    {msg.sender === 'ai' ? <Bot className="w-3.5 h-3.5" /> : <UserIcon className="w-3.5 h-3.5" />}
                  </div>
                  <div className={`max-w-[80%] space-y-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className={`rounded-2xl px-3.5 py-2.5 text-sm ${msg.sender === 'ai' ? 'bg-stone-50 text-[#1C1B1F] rounded-tl-none' : 'bg-[#2C742F] text-white rounded-tr-none'}`}>
                      {msg.sender === 'ai'
                        ? <div className="text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }} />
                        : <p className="text-xs">{msg.text}</p>}
                    </div>
                    <span className="text-[10px] text-[#79747E] px-1">{msg.time}</span>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#2C742F] flex items-center justify-center shrink-0"><Bot className="w-3.5 h-3.5 text-white" /></div>
                  <div className="bg-stone-50 rounded-2xl rounded-tl-none px-3.5 py-2.5">
                    <div className="flex gap-1 items-center">
                      {[0, 150, 300].map(d => <div key={d} className="w-1.5 h-1.5 rounded-full bg-[#79747E] animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick presets */}
            <div className="px-4 py-2 border-t border-stone-100 flex gap-1.5 overflow-x-auto">
              {CHAT_PRESETS.slice(0, 4).map(p => (
                <button key={p} onClick={() => sendMessage(p)} disabled={isLoading}
                  className="shrink-0 px-2.5 py-1.5 rounded-full bg-stone-50 border border-stone-200 text-[10px] font-semibold text-[#1C1B1F] hover:bg-[#D7E5D8]/50 transition-all whitespace-nowrap disabled:opacity-50">
                  {p}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-stone-100 flex items-center gap-2 shrink-0">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') sendMessage(input); }}
                placeholder="Ask Aro anything..."
                className="flex-1 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-[#1C1B1F] focus:outline-none focus:ring-1 focus:ring-[#2C742F]/30"
              />
              <button onClick={() => sendMessage(input)} disabled={isLoading || !input.trim()}
                className="w-9 h-9 rounded-xl bg-[#2C742F] hover:bg-[#366306] text-white flex items-center justify-center transition-all disabled:opacity-50 shrink-0">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
