import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAIResponse } from '../data/aiResponses';

const quickActions = [
  { icon: '💰', text: 'How to save more?',    query: 'How can I save more money?' },
  { icon: '🎯', text: 'Set up a budget',      query: 'How to set budget' },
  { icon: '📈', text: 'Investment tips',       query: 'Where should I invest?' },
  { icon: '✂️', text: 'Reduce expenses',      query: 'How to reduce expenses' },
];

const fmt = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const renderText = (text) =>
  text.split('\n').map((line, i) => {
    const html = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    if (!line) return <br key={i} />;
    return <div key={i} dangerouslySetInnerHTML={{ __html: html }} />;
  });

// default position: bottom-right
const DEFAULT_POS = { x: window.innerWidth - 74, y: window.innerHeight - 74 };

export default function AIFloatingWidget() {
  const { user } = useAuth();
  const [pos, setPos]         = useState(() => {
    const saved = localStorage.getItem('ai_icon_pos');
    return saved ? JSON.parse(saved) : DEFAULT_POS;
  });
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput]     = useState('');
  const [typing, setTyping]   = useState(false);
  const [pulse, setPulse]     = useState(true);
  const [dragging, setDragging] = useState(false);

  const btnRef      = useRef(null);
  const dragData    = useRef(null); // { startX, startY, origX, origY }
  const hasMoved    = useRef(false);
  const messagesEnd = useRef(null);
  const inputRef    = useRef(null);

  /* ── save position ── */
  useEffect(() => {
    localStorage.setItem('ai_icon_pos', JSON.stringify(pos));
  }, [pos]);

  /* ── scroll to bottom ── */
  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  /* ── focus on open ── */
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 250);
  }, [open]);

  /* ── drag handlers ── */
  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    hasMoved.current = false;
    dragData.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
    setDragging(true);
  }, [pos]);

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragData.current) return;
      const dx = e.clientX - dragData.current.startX;
      const dy = e.clientY - dragData.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved.current = true;
      const nx = Math.max(0, Math.min(window.innerWidth  - 52, dragData.current.origX + dx));
      const ny = Math.max(0, Math.min(window.innerHeight - 52, dragData.current.origY + dy));
      setPos({ x: nx, y: ny });
    };
    const onMouseUp = () => {
      if (!dragData.current) return;
      dragData.current = null;
      setDragging(false);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup',   onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup',   onMouseUp);
    };
  }, []);

  /* ── click (only if not dragged) ── */
  const handleClick = () => {
    if (hasMoved.current) return;
    setOpen(o => !o);
    setPulse(false);
  };

  /* ── panel position: try to keep inside viewport ── */
  const PANEL_W = 360;
  const PANEL_H = 500;
  const panelLeft = Math.min(pos.x, window.innerWidth  - PANEL_W - 8);
  const panelTop  = pos.y + 58 + PANEL_H > window.innerHeight
    ? pos.y - PANEL_H - 8
    : pos.y + 58;

  /* ── AI chat ── */
  const getInitials = () =>
    (user?.first_name?.[0] || user?.username?.[0] || '?').toUpperCase();

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    setMessages(p => [...p, { id: Date.now(), type: 'user', text: text.trim(), time: fmt() }]);
    setInput('');
    setTyping(true);
    await new Promise(r => setTimeout(r, 700 + Math.random() * 900));
    setTyping(false);
    setMessages(p => [...p, { id: Date.now()+1, type: 'assistant', text: getAIResponse(text), time: fmt() }]);
  };

  const handleSubmit = (e) => { e.preventDefault(); sendMessage(input); };

  /* ─────────────────────────────── RENDER ─────────────────────────────── */
  return (
    <>
      {/* ── Draggable Trigger Icon ── */}
      <button
        id="ai-float-btn"
        ref={btnRef}
        onMouseDown={onMouseDown}
        onClick={handleClick}
        title="AI Finance Assistant (drag me!)"
        style={{
          position:   'fixed',
          left:        pos.x,
          top:         pos.y,
          zIndex:      1200,
          width:       50,
          height:      50,
          borderRadius:'50%',
          border:      'none',
          cursor:      dragging ? 'grabbing' : 'grab',
          background:  'linear-gradient(135deg,#0096E6,#29A8EF)',
          boxShadow:   pulse
            ? '0 0 0 0 rgba(0,150,230,0.7)'
            : '0 6px 24px rgba(0,150,230,0.45)',
          display:     'flex',
          alignItems:  'center',
          justifyContent:'center',
          fontSize:    24,
          userSelect:  'none',
          animation:   pulse ? 'ai-pulse 2s infinite' : 'none',
          transition:  dragging ? 'none' : 'box-shadow 0.2s',
        }}
      >
        🤖
      </button>

      {/* ── Backdrop ── */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position:'fixed', inset:0, zIndex:1299,
            background:'rgba(0,0,0,0.1)',
            backdropFilter:'blur(1.5px)',
          }}
        />
      )}

      {/* ── Glass Chat Panel ── */}
      <div
        id="ai-float-panel"
        style={{
          position:      'fixed',
          left:           panelLeft,
          top:            panelTop,
          zIndex:         1300,
          width:          PANEL_W,
          maxHeight:      PANEL_H,
          display:        'flex',
          flexDirection:  'column',
          borderRadius:   20,
          overflow:       'hidden',
          background:     'rgba(240,250,255,0.90)',
          backdropFilter: 'blur(32px) saturate(1.8)',
          WebkitBackdropFilter:'blur(32px) saturate(1.8)',
          border:         '1px solid rgba(0,150,230,0.20)',
          boxShadow:      '0 28px 64px rgba(0,100,180,0.18), 0 0 0 1px rgba(0,150,230,0.12)',
          transform:      open ? 'scale(1) translateY(0)' : 'scale(0.94) translateY(-8px)',
          opacity:        open ? 1 : 0,
          pointerEvents:  open ? 'all' : 'none',
          transition:     'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease',
          transformOrigin:'top center',
        }}
      >
        {/* Header */}
        <div style={{
          display:'flex', alignItems:'center', gap:10,
          padding:'13px 15px 11px',
          borderBottom:'1px solid rgba(255,255,255,0.08)',
          background:'rgba(0,150,230,0.10)',
          flexShrink:0,
        }}>
          <div style={{
            width:36, height:36, borderRadius:10, flexShrink:0,
            background:'linear-gradient(135deg,#0096E6,#29A8EF)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:19,
          }}>🤖</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:13.5,color:'#0D3B66'}}>Paisa AI</div>
            <div style={{fontSize:11,color:'#0096E6',display:'flex',alignItems:'center',gap:5}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:'#00B86E',display:'inline-block'}}/>
              Online · Finance Assistant
            </div>
          </div>
          <button onClick={() => setOpen(false)} style={{
            background:'rgba(0,100,180,0.08)', border:'none', cursor:'pointer',
            color:'#2E7DAF', borderRadius:8, width:28, height:28,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:15,
          }}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(0,150,230,0.16)'}
            onMouseLeave={e=>e.currentTarget.style.background='rgba(0,100,180,0.08)'}
          >✕</button>
        </div>

        {/* Messages */}
        <div style={{
          flex:1, overflowY:'auto', padding:'12px 12px 6px',
          display:'flex', flexDirection:'column', gap:9,
          scrollbarWidth:'thin', scrollbarColor:'rgba(255,255,255,0.08) transparent',
        }}>
          {messages.length === 0 ? (
            <div style={{textAlign:'center',paddingTop:8}}>
              <div style={{fontSize:34,marginBottom:6}}>🤖</div>
              <div style={{color:'#0D3B66',fontWeight:600,fontSize:13.5,marginBottom:4}}>
                Hi {user?.first_name || 'there'}! 👋
              </div>
              <div style={{color:'#2E7DAF',fontSize:11.5,marginBottom:14}}>
                Ask me anything about your finances.
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7}}>
                {quickActions.map((a,i) => (
                  <button key={i} onClick={()=>sendMessage(a.query)} style={{
                    background:'rgba(0,150,230,0.06)',
                    border:'1px solid rgba(0,150,230,0.15)',
                    borderRadius:10, padding:'8px 9px',
                    cursor:'pointer', textAlign:'left',
                  }}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(0,150,230,0.15)'}
                    onMouseLeave={e=>e.currentTarget.style.background='rgba(0,150,230,0.06)'}
                  >
                    <div style={{fontSize:17,marginBottom:2}}>{a.icon}</div>
                    <div style={{fontSize:11,color:'#2E7DAF',fontWeight:500}}>{a.text}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} style={{
                display:'flex',
                flexDirection: msg.type==='user' ? 'row-reverse' : 'row',
                gap:7, alignItems:'flex-start',
              }}>
                <div style={{
                  width:26, height:26, borderRadius:7, flexShrink:0,
                  background: msg.type==='user'
                    ? 'linear-gradient(135deg,#0096E6,#29A8EF)'
                    : 'linear-gradient(135deg,#00B86E,#00965A)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize: msg.type==='user' ? 11 : 14,
                  color:'#fff', fontWeight:700,
                }}>
                  {msg.type==='user' ? getInitials() : '🤖'}
                </div>
                <div style={{maxWidth:'79%'}}>
                  <div style={{
                    background: msg.type==='user'
                      ? 'linear-gradient(135deg,rgba(0,150,230,0.85),rgba(41,168,239,0.75))'
                      : '#FFFFFF',
                    border: msg.type==='user' ? '1px solid rgba(0,150,230,0.3)' : '1px solid rgba(0,150,230,0.12)',
                    borderRadius: msg.type==='user' ? '13px 3px 13px 13px' : '3px 13px 13px 13px',
                    padding:'7px 11px',
                    fontSize:12.5, color: msg.type==='user' ? '#fff' : '#0D3B66', lineHeight:1.55,
                    boxShadow:'0 1px 4px rgba(0,100,180,0.08)',
                  }}>
                    {renderText(msg.text)}
                  </div>
                  <div style={{fontSize:9.5,color:'#6BAED4',marginTop:2,
                    textAlign:msg.type==='user'?'right':'left'}}>
                    {msg.time}
                  </div>
                </div>
              </div>
            ))
          )}

          {typing && (
            <div style={{display:'flex',gap:7,alignItems:'center'}}>
              <div style={{
                width:26,height:26,borderRadius:7,flexShrink:0,
                background:'linear-gradient(135deg,#00B86E,#00965A)',
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,
              }}>🤖</div>
              <div style={{
                background:'#FFFFFF',
                border:'1px solid rgba(0,150,230,0.12)',
                borderRadius:'3px 13px 13px 13px',
                padding:'10px 14px',
                display:'flex',gap:5,alignItems:'center',
                boxShadow:'0 1px 4px rgba(0,100,180,0.08)',
              }}>
                {[0,1,2].map(i=>(
                  <div key={i} style={{
                    width:5,height:5,borderRadius:'50%',background:'#0096E6',
                    animation:`typing-bounce 1.2s ease-in-out ${i*0.2}s infinite`,
                  }}/>
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEnd}/>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} style={{
          display:'flex',gap:7,padding:'9px 11px 11px',
          borderTop:'1px solid rgba(0,150,230,0.12)',
          background:'rgba(235,247,253,0.95)',flexShrink:0,
        }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e=>setInput(e.target.value)}
            disabled={typing}
            placeholder="Ask about your finances…"
            id="ai-float-input"
            style={{
              flex:1, background:'rgba(0,150,230,0.07)',
              border:'1px solid rgba(0,150,230,0.18)',
              borderRadius:11, padding:'8px 12px',
              fontSize:12.5, color:'#0D3B66', outline:'none',
            }}
            onFocus={e=>e.target.style.borderColor='rgba(0,150,230,0.55)'}
            onBlur={e=>e.target.style.borderColor='rgba(0,150,230,0.18)'}
          />
          <button type="submit" disabled={!input.trim()||typing} id="ai-float-send"
            style={{
              width:36,height:36,borderRadius:9,border:'none',
              background: input.trim()&&!typing
                ? 'linear-gradient(135deg,#0096E6,#29A8EF)'
                : 'rgba(0,150,230,0.12)',
              color:'#fff',
              cursor:input.trim()&&!typing?'pointer':'not-allowed',
              fontSize:15,display:'flex',alignItems:'center',
              justifyContent:'center',flexShrink:0,
            }}
          >➤</button>
        </form>
      </div>

      <style>{`
        @keyframes ai-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(0,150,230,0.75); }
          70%  { box-shadow: 0 0 0 14px rgba(0,150,230,0); }
          100% { box-shadow: 0 0 0 0 rgba(0,150,230,0); }
        }
        @keyframes typing-bounce {
          0%,60%,100% { transform:translateY(0); }
          30%          { transform:translateY(-5px); }
        }
        #ai-float-btn:active { transform: scale(0.93); }
      `}</style>
    </>
  );
}
