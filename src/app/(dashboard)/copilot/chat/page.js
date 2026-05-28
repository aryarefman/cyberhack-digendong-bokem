'use client';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { ZONES, CATEGORIES } from '@/lib/mockData';
import { Send, Bot, User as UserIcon, ShieldCheck } from 'lucide-react';
import './chat.css';

let msgIdCounter = 100;
const getNextMsgId = () => {
  msgIdCounter += 1;
  return msgIdCounter;
};

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Hello ${user?.name || 'User'}! I am your AromaSys AI Copilot, connected to the live database.\n\nI can assist you with:\n• Checking stock levels and tracking statuses\n• Finding empty warehouse slots\n• Reviewing material expiration timelines\n• Analyzing cold-chain temperatures\n\nWhat can I help you with today?`,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Helper to fetch live database context for Gemini LLM
  const fetchDatabaseContext = async () => {
    try {
      const [invRes, slotsRes, tempRes] = await Promise.all([
        fetch('/api/inventory'),
        fetch('/api/slots'),
        fetch('/api/cold-chain')
      ]);
      
      const invData = await invRes.json();
      const slotsData = await slotsRes.json();
      const tempData = await tempRes.json();
      
      return {
        inventory: invData.success ? invData.items : [],
        slots: slotsData.success ? slotsData.slots : [],
        temperatures: tempData.success ? tempData.temperatures : {}
      };
    } catch (error) {
      console.error('Error fetching database context for AI:', error);
      return null;
    }
  };

  async function handleSend(text) {
    const msg = text || input.trim();
    if (!msg) return;

    // Add user message
    const userMsg = {
      id: getNextMsgId(),
      sender: 'user',
      text: msg,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // 1. Fetch live database context
      const dbContext = await fetchDatabaseContext();
      const contextText = dbContext 
        ? `
- Raw Material Categories: ${JSON.stringify(CATEGORIES)}
- Warehouse Zones: ${JSON.stringify(ZONES)}
- Inventory Data (Active Lots): ${JSON.stringify(dbContext.inventory)}
- Warehouse Slots: ${JSON.stringify(dbContext.slots.map(s => ({ id: s.id, zone: s.zone, occupied: s.occupied, itemId: s.itemId, itemName: s.item?.name })))}
- Cold-Chain Temperature Log (last 24 hours): ${JSON.stringify(dbContext.temperatures)}
`
        : 'Failed to retrieve database content.';

      // 2. Construct the Gemini System Prompt
      const fullPrompt = `
Anda adalah AromaSys AI Copilot, asisten gudang kecerdasan buatan untuk pabrik AromaSys.
Berikut adalah data aktual database gudang saat ini (dalam format JSON):
${contextText}

Tanggal hari ini (sebagai acuan waktu saat ini): ${new Date().toISOString().split('T')[0]}.

Tugas Anda:
1. Jawab pertanyaan pengguna secara akurat, ramah, dan profesional berdasarkan data di atas.
2. Jika ditanya tentang bahan yang expired, kritis (<7 hari), warning (<30 hari), periksalah data inventori di atas dan hitung sisa harinya dari tanggal hari ini.
3. Jika ditanya slot kosong, sebutkan slot yang 'occupied: false' dari data slot.
4. Tulis jawaban Anda dalam bahasa Inggris agar sesuai dengan visual UI. Gunakan format Markdown (seperti bold, bullet points, atau tabel) agar mudah dibaca di layar chat.
5. Jawab secara ringkas, to-the-point, dan berfokus pada data operasional gudang.

Pertanyaan Pengguna: "${msg}"
`;

      // 3. Request Gemini API
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyCk7MLn1egt_KdMnsaCOnh4bw1kS-B-K3I';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: fullPrompt }]
            }
          ]
        })
      });

      if (!res.ok) {
        throw new Error('API request failed');
      }

      const data = await res.json();
      const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not process your request at this moment.';

      const aiMsg = {
        id: getNextMsgId(),
        sender: 'ai',
        text: replyText,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Error generating Gemini response:', error);
      const errorMsg = {
        id: getNextMsgId(),
        sender: 'ai',
        text: 'Sorry, a connection error occurred while contacting the Gemini API. Please try again later.',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="chat-page animate-fade" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 className="page-title" style={{ fontSize: '32px', fontWeight: '700', color: '#202224', fontFamily: "'Poppins', sans-serif", margin: '0 0 8px 0' }}>Production Copilot</h1>
        <p className="page-subtitle" style={{ marginTop: 0, fontSize: '15px', color: '#212121', lineHeight: '1.4' }}>
          Query your connected ERP/WMS database using natural language, powered by live Gemini AI.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '24px', flex: 1, minHeight: 0 }}>
        {/* Left Panel (70%) */}
        <div style={{ flex: 7, display: 'flex', flexDirection: 'column', background: '#FFFFFF', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          {/* Chat Messages */}
          <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map(msg => (
              <div key={msg.id} className={`chat-bubble-wrapper ${msg.sender === 'user' ? 'chat-user' : 'chat-ai'}`}>
                {msg.sender === 'ai' && (
                  <div className="chat-avatar chat-avatar-ai" style={{ background: '#366306', color: '#FFFFFF' }}>
                    <Bot size={16} />
                  </div>
                )}
                <div className={`chat-bubble ${msg.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`} style={{
                  background: msg.sender === 'user' ? '#366306' : '#EEF3E7',
                  color: msg.sender === 'user' ? '#FFFFFF' : '#062012',
                  borderRadius: msg.sender === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                  padding: '12px 16px',
                  maxWidth: '75%'
                }}>
                  <div className="chat-text" style={{ fontSize: '14px', lineHeight: '1.5' }} dangerouslySetInnerHTML={{
                    __html: msg.text
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n/g, '<br/>')
                  }} />
                  <span className="chat-time" style={{ fontSize: '10px', display: 'block', textAlign: 'right', marginTop: '6px', opacity: 0.7 }}>{msg.time}</span>
                </div>
                {msg.sender === 'user' && (
                  <div className="chat-avatar chat-avatar-user" style={{ background: '#F4F5F7', color: '#202224' }}>
                    <UserIcon size={14} />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="chat-bubble-wrapper chat-ai">
                <div className="chat-avatar chat-avatar-ai" style={{ background: '#366306', color: '#FFFFFF' }}>
                  <Bot size={16} />
                </div>
                <div className="chat-bubble chat-bubble-ai chat-typing" style={{ background: '#EEF3E7', padding: '12px 16px', borderRadius: '12px 12px 12px 0' }}>
                  <div className="typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="chat-input-area" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input
                type="text"
                className="input chat-input"
                placeholder="Ask about stock, expiry, or operations..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isTyping}
                style={{ flex: 1, height: '48px', padding: '0 16px', borderRadius: '8px', border: '1px solid #D8D8D8' }}
              />
              <button
                className="btn btn-primary chat-send-btn btn-icon"
                onClick={() => handleSend()}
                disabled={isTyping || !input.trim()}
                style={{ width: '48px', height: '48px', background: '#366306', border: 'none', borderRadius: '8px', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#737969', textAlign: 'center' }}>
              AromaSys AI can make mistakes. Verify critical production data.
            </p>
          </div>
        </div>

        {/* Right Panel (30%) */}
        <div style={{ flex: 3, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Quick Insights Preset Buttons */}
          <div className="card" style={{ padding: '24px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#062012', marginBottom: '16px', fontFamily: "'Poppins', sans-serif" }}>Quick Insights</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Check Low Stock Items', prompt: 'Check for items with low stock or quantity under 30' },
                { label: 'Show Expiring Lots This Month', prompt: 'Show me any lots expiring this month' },
                { label: 'Generate Optimal PPIC Schedule', prompt: 'Analyze raw materials and formulate optimal PPIC schedule' },
                { label: 'Find Empty Cold Storage Slots', prompt: 'Find vacant cold storage locations and shelves' }
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(item.prompt)}
                  style={{
                    padding: '12px 14px',
                    textAlign: 'left',
                    background: '#EEF3E7',
                    border: '1px solid rgba(54,99,6,0.08)',
                    borderRadius: '8px',
                    color: '#366306',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontFamily: "'Poppins', sans-serif",
                    transition: 'all 0.2s ease-in-out'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#E3ECCA'}
                  onMouseOut={e => e.currentTarget.style.background = '#EEF3E7'}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* System Status Info Box */}
          <div className="card" style={{ padding: '20px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#737969', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.5px' }}>System Status</h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ width: '10px', height: '10px', background: '#84D187', borderRadius: '50%', boxShadow: '0 0 8px #84D187' }}></span>
              <div style={{ fontSize: '13px', color: '#202224' }}>
                <strong>Connected to ERP Database</strong>
                <span style={{ display: 'block', fontSize: '11px', color: '#737969', marginTop: '2px' }}>Last sync: 2 mins ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
