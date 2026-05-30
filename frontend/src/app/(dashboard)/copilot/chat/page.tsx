'use client';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User as UserIcon, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { CHAT_PRESETS } from '@/lib/mockData';
import type { ChatMessage } from '@/types';

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=`;
const FALLBACK_MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash'];

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
        let t = '<table class="text-xs border-collapse w-full my-2">';
        dataRows.forEach((row, ri) => {
          const cells = row.split('|').filter((_, ci, arr) => ci > 0 && ci < arr.length - 1);
          t += ri === 0 ? '<thead><tr>' : '<tr>';
          cells.forEach(c => { t += ri === 0 ? `<th class="border border-stone-200 px-2 py-1 bg-stone-50 font-semibold">${c.trim()}</th>` : `<td class="border border-stone-200 px-2 py-1">${c.trim()}</td>`; });
          t += ri === 0 ? '</tr></thead>' : '</tr>';
        });
        out.push(t + '</table>');
      }
      continue;
    }
    if (/^\s*[-*•]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*•]\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*[-*•]\s+/, '')); i++; }
      out.push('<ul class="list-disc ml-4 my-1 space-y-0.5">' + items.map(it => `<li>${applyInline(it)}</li>`).join('') + '</ul>');
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*\d+\.\s+/, '')); i++; }
      out.push('<ol class="list-decimal ml-4 my-1 space-y-0.5">' + items.map(it => `<li>${applyInline(it)}</li>`).join('') + '</ol>');
      continue;
    }
    if (/^\s*#{1,4}\s+/.test(line)) {
      const m = line.match(/^\s*(#{1,4})\s+(.*)/);
      if (m) { out.push(`<p class="font-bold text-sm mt-2">${applyInline(m[2])}</p>`); i++; continue; }
    }
    if (line.trim() === '') { out.push('<br/>'); i++; continue; }
    out.push(`<p class="leading-relaxed">${applyInline(line)}</p>`);
    i++;
  }
  return out.join('');
}

function applyInline(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '<code class="bg-stone-100 rounded px-1 font-mono text-xs">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

const SYSTEM_CONTEXT = (ctx: string) => `You are Aro, the AromaSys AI Copilot. You are a warehouse management assistant for an aroma/perfume ingredient warehouse.
Live warehouse context: ${ctx}
Answer concisely and helpfully in the same language as the user's question. Use markdown for structured output.`;

export default function CopilotChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: Date.now(), sender: 'ai',
    text: `Hey there! I'm **Aro**, your AromaSys AI Copilot. I'm connected live to the warehouse database. Ask me anything about your warehouse — stock levels, expiry dates, cold-chain temps, slot availability, or PPIC scheduling!`,
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dbContext, setDbContext] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    async function loadContext() {
      try {
        const [invData, auditData] = await Promise.all([
          api.get<{ success: boolean; items: Array<{ name: string; status: string; qty: number; unit: string; location: string; expiry: string }> }>('/inventory'),
          api.get<{ success: boolean; logs: Array<{ action: string; user: string; detail: string }> }>('/audit'),
        ]);
        const items = invData.success ? invData.items ?? [] : [];
        const logs = auditData.success ? auditData.logs ?? [] : [];
        setDbContext(`Inventory (${items.length} items): ${JSON.stringify(items.slice(0, 15))}. Recent audit: ${JSON.stringify(logs.slice(0, 5))}.`);
      } catch { setDbContext('Live DB context unavailable.'); }
    }
    Promise.resolve().then(loadContext);
  }, []);

  async function sendMessage(text: string) {
    if (!text.trim() || isLoading) return;
    const userMsg: ChatMessage = { id: Date.now(), sender: 'user', text: text.trim(), time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? '';
    const prompt = SYSTEM_CONTEXT(dbContext) + `\n\nUser: ${text.trim()}`;

    let responseText = '';
    const modelsToTry = ['gemini-2.5-flash', ...FALLBACK_MODELS];

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        });
        if (!res.ok) continue;
        const data = await res.json();
        responseText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        if (responseText) break;
      } catch { continue; }
    }

    if (!responseText) responseText = 'Maaf, saya tidak dapat terhubung ke AI saat ini. Silakan coba lagi.';

    const aiMsg: ChatMessage = { id: Date.now() + 1, sender: 'ai', text: responseText, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-h-[700px]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#2C742F]/10 flex items-center justify-center"><Bot className="w-5 h-5 text-[#2C742F]" /></div>
        <div>
          <h1 className="text-2xl font-extrabold text-[#1C1B1F]">Production Copilot</h1>
          <p className="text-xs text-[#79747E]">AI assistant connected to live warehouse database</p>
        </div>
        <span className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Online
        </span>
      </div>

      {/* Chat window */}
      <div className="flex-1 bg-[#F5FBF3] rounded-2xl border border-[#2C742F]/10 shadow-[6px_6px_54px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${msg.sender === 'ai' ? 'bg-[#2C742F] text-white' : 'bg-stone-200 text-[#1C1B1F]'}`}>
                {msg.sender === 'ai' ? <Bot className="w-4 h-4" /> : (user?.name?.charAt(0) ?? <UserIcon className="w-4 h-4" />)}
              </div>
              <div className={`max-w-[80%] ${msg.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div className={`rounded-2xl px-4 py-3 text-sm ${msg.sender === 'ai' ? 'bg-stone-50 text-[#1C1B1F] rounded-tl-none' : 'bg-[#2C742F] text-white rounded-tr-none'}`}>
                  {msg.sender === 'ai'
                    ? <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }} />
                    : <p>{msg.text}</p>}
                </div>
                <span className="text-[10px] text-[#79747E]">{msg.time}</span>
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#2C742F] flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-white" /></div>
              <div className="bg-stone-50 rounded-2xl rounded-tl-none px-4 py-3">
                <div className="flex gap-1.5 items-center"><div className="w-2 h-2 rounded-full bg-[#79747E] animate-bounce" style={{ animationDelay: '0ms' }} /><div className="w-2 h-2 rounded-full bg-[#79747E] animate-bounce" style={{ animationDelay: '150ms' }} /><div className="w-2 h-2 rounded-full bg-[#79747E] animate-bounce" style={{ animationDelay: '300ms' }} /></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick presets */}
        <div className="px-4 py-2 border-t border-stone-100 flex gap-2 overflow-x-auto">
          {CHAT_PRESETS.map(preset => (
            <button key={preset} onClick={() => sendMessage(preset)} disabled={isLoading}
              className="shrink-0 px-3 py-1.5 rounded-full bg-stone-50 border border-stone-200 text-xs font-semibold text-[#1C1B1F] hover:bg-[#D7E5D8]/50 hover:border-[#2C742F]/30 transition-all whitespace-nowrap disabled:opacity-50">
              {preset}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-stone-100 flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Aro about your warehouse... (Enter to send)"
            rows={1}
            className="flex-1 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-[#1C1B1F] focus:outline-none focus:ring-1 focus:ring-[#2C742F]/30 resize-none min-h-[40px] max-h-[120px] bg-white"
            style={{ height: 'auto' }}
            onInput={e => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 120) + 'px'; }}
          />
          <button onClick={() => sendMessage(input)} disabled={isLoading || !input.trim()}
            className="w-10 h-10 rounded-xl bg-[#2C742F] hover:bg-[#366306] text-white flex items-center justify-center transition-all disabled:opacity-50 shrink-0">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
