import { seedItems } from './seed'
import { useState, useEffect, useRef } from 'react'
import { db } from './firebase'
import { ref, onValue, set, update } from 'firebase/database'

const INITIAL_ITEMS = {
  operaciones: {
    label: 'Operaciones',
    color: '#FCD34D',
    bg: 'rgba(252,211,77,0.12)',
    items: [
      { id: 'op1', text: 'Costeo de todas las recetas', note: 'Faltan recetas madre + sub recetas' },
      { id: 'op2', text: 'Estandarización de recetas base', note: '' },
      { id: 'op3', text: 'Catálogo inteligente', note: 'Línea Signature 3–5 diseños, sabores estrella, opciones premium' },
      { id: 'op4', text: 'Manual de procesos + control de calidad', note: 'Secuencia de calidad documentada' },
      { id: 'op5', text: 'Ciclos pedido → entrega', note: 'Protocolo desde contacto hasta entrega' },
      { id: 'op6', text: 'Política de retrasos + calendario', note: '' },
    ]
  },
  finanzas: {
    label: 'Finanzas / Fiscal',
    color: '#34D399',
    bg: 'rgba(52,211,153,0.12)',
    items: [
      { id: 'fi1', text: 'Separar cuenta bancaria BBVA (Pastelería)', note: 'Ya hay altas fiscales — falta separación de obligaciones', urgent: true },
      { id: 'fi2', text: 'Facturama — aprender a emitir facturas', note: '' },
      { id: 'fi3', text: 'Registrar empleados al IMSS', note: 'Preguntar a la contadora qué conviene', urgent: true },
      { id: 'fi4', text: 'Opinión de cumplimiento SAT', note: 'Resultado llega a fin de mes', urgent: true },
      { id: 'fi5', text: 'Tabulador de ingresos y egresos', note: '' },
      { id: 'fi6', text: 'Actualizar Control de Riesgo', note: '' },
      { id: 'fi7', text: 'Indicadores clave (KPIs)', note: '' },
      { id: 'fi8', text: 'Definir sueldo Beatriz', note: '' },
    ]
  },
  tecnologia: {
    label: 'Tecnología',
    color: '#60A5FA',
    bg: 'rgba(96,165,250,0.12)',
    items: [
      { id: 'te1', text: 'Chatbot WhatsApp (Meta / N8N / agentes)', note: 'Investigar casos de uso META Business' },
      { id: 'te2', text: 'Separar número de contacto oficial', note: '' },
      { id: 'te3', text: 'Landing page con identidad definida', note: '' },
      { id: 'te4', text: 'Hacer formatos operativos', note: '' },
    ]
  },
  marketing: {
    label: 'Marketing',
    color: '#C084FC',
    bg: 'rgba(192,132,252,0.12)',
    items: [
      { id: 'mk1', text: 'Cambiar logo + identidad visual', note: 'Facebook, Instagram y landing con misma imagen' },
      { id: 'mk2', text: 'Carpeta de fotos Google Drive (top 50)', note: 'Edición con Krita' },
      { id: 'mk3', text: 'Contrato de alianza para publicidad', note: '' },
    ]
  },
  insumos: {
    label: 'Insumos / Equipo',
    color: '#2DD4BF',
    bg: 'rgba(45,212,191,0.12)',
    items: [
      { id: 'in1', text: 'Cotización refrigerador / congelador', note: '' },
      { id: 'in2', text: 'Rack o mueble + espiguero', note: '' },
      { id: 'in3', text: 'Jarabes — cotización enviada 18-03-26', note: 'Seguimiento pendiente' },
      { id: 'in4', text: 'Cartones corrugados, obleas, impresión', note: 'Obleas hojas de arroz/azúcar, transfer gelatina, impresión chocolate' },
      { id: 'in5', text: 'Precios proveedores', note: '' },
    ]
  }
}

const ALL_ITEMS = Object.entries(INITIAL_ITEMS).flatMap(([sectionKey, s]) =>
  s.items.map(i => ({ ...i, sectionKey, sectionLabel: s.label, sectionColor: s.color, sectionBg: s.bg }))
)
const ALL_IDS = ALL_ITEMS.map(i => i.id)

const S = {
  page: { minHeight: '100vh', background: '#0C0C0E', fontFamily: "'DM Sans', sans-serif" },
  header: { background: '#0C0C0E', borderBottom: '1px solid #1E1E24', padding: '20px 24px 16px', position: 'sticky', top: 0, zIndex: 10 },
  inner: { maxWidth: 640, margin: '0 auto' },
  card: { background: '#141418', border: '1px solid #1E1E24', borderRadius: 14, marginBottom: 10, overflow: 'hidden' },
}

export default function App() {
  const [checked, setChecked] = useState({})
  const [comments, setComments] = useState({})
  const [archived, setArchived] = useState({})
  const [expanded, setExpanded] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [draftText, setDraftText] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
  const [view, setView] = useState('main') // 'main' | 'archived'
  const textareaRef = useRef(null)


  // dentro del componente, ANTES del useEffect:
  useEffect(() => {
    seedItems()
  }, [])

  useEffect(() => {
    const unsub1 = onValue(ref(db, 'pendientes/checked'), s => setChecked(s.val() || {}))
    const unsub2 = onValue(ref(db, 'pendientes/comments'), s => setComments(s.val() || {}))
    const unsub3 = onValue(ref(db, 'pendientes/archived'), s => {
      setArchived(s.val() || {})
      setLoaded(true)
    })
    return () => { unsub1(); unsub2(); unsub3() }
  }, [])

  const toggleCheck = async (id, e) => {
    e.stopPropagation()
    const next = { ...checked, [id]: !checked[id] }
    setChecked(next)
    await set(ref(db, 'pendientes/checked'), next)
  }

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const startEdit = (id, e) => {
    e.stopPropagation()
    setEditingId(id)
    setDraftText(comments[id] || '')
    setTimeout(() => textareaRef.current?.focus(), 50)
  }

  const saveComment = async (id) => {
    const next = { ...comments, [id]: draftText }
    setComments(next)
    await set(ref(db, 'pendientes/comments'), next)
    setEditingId(null)
  }

  const archiveItem = async (id, e) => {
    e.stopPropagation()
    const next = { ...archived, [id]: true }
    setArchived(next)
    await set(ref(db, 'pendientes/archived'), next)
    setExpanded(prev => ({ ...prev, [id]: false }))
  }

  const deleteItem = async (id) => {
    const next = { ...archived }
    delete next[id]
    setArchived(next)
    await set(ref(db, 'pendientes/archived'), next)
  }

  const restoreItem = async (id) => {
    const next = { ...archived }
    delete next[id]
    setArchived(next)
    await set(ref(db, 'pendientes/archived'), next)
  }

  const resetAll = async () => {
    setChecked({})
    await set(ref(db, 'pendientes/checked'), {})
  }

  const activeItems = ALL_IDS.filter(id => !archived[id])
  const total = activeItems.length
  const done = activeItems.filter(id => checked[id]).length
  const pct = Math.round((done / total) * 100) || 0
  const archivedItems = ALL_ITEMS.filter(i => archived[i.id])

  if (!loaded) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0C0C0E' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 32, height: 32, border: '2px solid #2A2A2E', borderTop: '2px solid #6B6B75', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ color: '#6B6B75', fontSize: 14, fontFamily: 'sans-serif' }}>Conectando...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <div style={S.page}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .item-row { display: flex; align-items: flex-start; gap: 12px; padding: 12px 16px; cursor: pointer; transition: background 0.15s; }
        .item-row:hover { background: rgba(255,255,255,0.03); }
        .item-row.done .item-text { opacity: 0.4; text-decoration: line-through; text-decoration-color: #3A3A40; }
        .check-circle { width: 20px; height: 20px; border-radius: 50%; border: 1.5px solid #3A3A40; flex-shrink: 0; margin-top: 2px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; background: transparent; }
        .item-row.done .check-circle { background: #22C55E; border-color: #22C55E; }
        .check-svg { display: none; }
        .item-row.done .check-svg { display: block; }
        .icon-btn { background: none; border: none; cursor: pointer; padding: 4px; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: background 0.15s; opacity: 0.4; }
        .icon-btn:hover { background: rgba(255,255,255,0.07); opacity: 1; }
        .expand-panel { padding: 0 16px 14px 48px; animation: slideDown 0.2s ease; }
        .comment-box { width: 100%; background: #0C0C0E; border: 1px solid #2A2A2E; border-radius: 8px; color: #D0D0D8; font-size: 13px; font-family: inherit; padding: 10px 12px; resize: none; outline: none; line-height: 1.5; min-height: 72px; }
        .comment-box:focus { border-color: #4A4A52; }
        .comment-text { font-size: 13px; color: #9090A0; line-height: 1.6; white-space: pre-wrap; background: #0C0C0E; border: 1px solid #1E1E24; border-radius: 8px; padding: 10px 12px; min-height: 40px; }
        .pill-btn { padding: 4px 12px; border-radius: 20px; border: 1px solid #2A2A2E; background: transparent; font-size: 12px; color: #6B6B75; cursor: pointer; font-family: inherit; transition: all 0.15s; }
        .pill-btn:hover { border-color: #4A4A52; color: #D0D0D8; }
        .pill-btn.active { background: #E0E0E8; border-color: #E0E0E8; color: #0C0C0E; }
        .pill-btn.danger:hover { border-color: #EF4444; color: #F87171; }
        .pill-btn.save { border-color: #22C55E; color: #22C55E; }
        .pill-btn.save:hover { background: rgba(34,197,94,0.1); }
        .nav-tab { background: none; border: none; font-family: inherit; font-size: 13px; font-weight: 500; color: #4A4A52; cursor: pointer; padding: 6px 0; border-bottom: 2px solid transparent; transition: all 0.15s; }
        .nav-tab.active { color: #E0E0E8; border-bottom-color: #E0E0E8; }
        .progress-track { height: 3px; background: #1E1E24; border-radius: 2px; overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 2px; background: linear-gradient(90deg, #22C55E, #16A34A); transition: width 0.4s ease; }
        .section-card { background: #141418; border: 1px solid #1E1E24; border-radius: 14px; margin-bottom: 10px; overflow: hidden; }
        .archived-card { background: #141418; border: 1px solid #1E1E24; border-radius: 12px; padding: 14px 16px; margin-bottom: 8px; }
      `}</style>

      {/* Header */}
      <div style={S.header}>
        <div style={S.inner}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: '#E0E0E8', fontWeight: 400 }}>Pendientes — Fresa & Lavanda</h1>
            <span style={{ fontSize: 12, color: '#4A4A52' }}>{done}/{total}</span>
          </div>
          <div className="progress-track" style={{ marginBottom: 14 }}>
            <div className="progress-fill" style={{ width: pct + '%' }} />
          </div>
          {/* Nav tabs */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 12, borderBottom: '1px solid #1E1E24', paddingBottom: 0 }}>
            <button className={`nav-tab ${view === 'main' ? 'active' : ''}`} onClick={() => setView('main')}>Activos</button>
            <button className={`nav-tab ${view === 'archived' ? 'active' : ''}`} onClick={() => setView('archived')}>
              Archivados {archivedItems.length > 0 && <span style={{ fontSize: 11, background: '#2A2A2E', borderRadius: 10, padding: '1px 6px', marginLeft: 4 }}>{archivedItems.length}</span>}
            </button>
          </div>
          {view === 'main' && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <button className={`pill-btn ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>Todos</button>
              <button className={`pill-btn ${activeFilter === 'urgent' ? 'active' : ''}`} onClick={() => setActiveFilter('urgent')}>⚡ Urgentes</button>
              <button className={`pill-btn ${activeFilter === 'pending' ? 'active' : ''}`} onClick={() => setActiveFilter('pending')}>Pendientes</button>
              <div style={{ flex: 1 }} />
              <button className="pill-btn danger" onClick={resetAll}>Reiniciar</button>
            </div>
          )}
        </div>
      </div>

      {/* Main view */}
      {view === 'main' && (
        <div style={{ ...S.inner, padding: '16px 16px 40px' }}>
          {Object.entries(INITIAL_ITEMS).map(([key, section]) => {
            let items = section.items.filter(i => !archived[i.id])
            if (activeFilter === 'urgent') items = items.filter(i => i.urgent)
            if (activeFilter === 'pending') items = items.filter(i => !checked[i.id])
            if (items.length === 0) return null

            const secDone = section.items.filter(i => checked[i.id] && !archived[i.id]).length
            const secTotal = section.items.filter(i => !archived[i.id]).length

            return (
              <div key={key} className="section-card">
                <div style={{ padding: '11px 16px 9px', borderBottom: '1px solid #1E1E24', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: section.bg, color: section.color, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    {section.label}
                  </span>
                  <span style={{ fontSize: 12, color: '#3A3A40' }}>{secDone}/{secTotal}</span>
                </div>
                <div style={{ padding: '4px 0' }}>
                  {items.map(item => (
                    <div key={item.id}>
                      <div className={`item-row ${checked[item.id] ? 'done' : ''}`} onClick={() => toggleExpand(item.id)}>
                        {/* Checkbox */}
                        <div className="check-circle" onClick={(e) => toggleCheck(item.id, e)}>
                          <svg className="check-svg" width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        {/* Text */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <span className="item-text" style={{ fontSize: 13, fontWeight: 500, color: '#D0D0D8', lineHeight: 1.4 }}>{item.text}</span>
                            {item.urgent && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'rgba(239,68,68,0.15)', color: '#F87171', fontWeight: 600 }}>URGENTE</span>}
                            {comments[item.id] && <span style={{ fontSize: 10, color: '#4A4A52' }}>💬</span>}
                          </div>
                          {item.note && <p style={{ fontSize: 12, color: '#4A4A52', marginTop: 2, lineHeight: 1.4 }}>{item.note}</p>}
                        </div>
                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                          <button className="icon-btn" title="Archivar" onClick={(e) => archiveItem(item.id, e)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9090A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" /><line x1="10" y1="12" x2="14" y2="12" />
                            </svg>
                          </button>
                          <button className="icon-btn" title="Notas" onClick={(e) => { toggleExpand(item.id); startEdit(item.id, e) }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9090A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <span style={{ fontSize: 12, color: '#3A3A40', alignSelf: 'center', marginLeft: 2 }}>{expanded[item.id] ? '▲' : '▼'}</span>
                        </div>
                      </div>

                      {/* Expand panel */}
                      {expanded[item.id] && (
                        <div className="expand-panel">
                          {editingId === item.id ? (
                            <div>
                              <textarea
                                ref={textareaRef}
                                className="comment-box"
                                value={draftText}
                                onChange={e => setDraftText(e.target.value)}
                                placeholder="Agrega notas, acuerdos, contexto..."
                                rows={3}
                              />
                              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                <button className="pill-btn save" onClick={() => saveComment(item.id)}>Guardar</button>
                                <button className="pill-btn" onClick={() => setEditingId(null)}>Cancelar</button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              {comments[item.id]
                                ? <div className="comment-text">{comments[item.id]}</div>
                                : <p style={{ fontSize: 12, color: '#3A3A40', fontStyle: 'italic' }}>Sin notas aún.</p>
                              }
                              <button className="pill-btn" style={{ marginTop: 8 }} onClick={(e) => startEdit(item.id, e)}>
                                {comments[item.id] ? 'Editar nota' : '+ Agregar nota'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {pct === 100 && total > 0 && (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
              <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: '#E0E0E8' }}>¡Todo listo!</p>
              <p style={{ fontSize: 13, color: '#4A4A52', marginTop: 4 }}>Todos los pendientes completados</p>
            </div>
          )}
        </div>
      )}

      {/* Archived view */}
      {view === 'archived' && (
        <div style={{ ...S.inner, padding: '16px 16px 40px' }}>
          {archivedItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 16px' }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>🗂️</p>
              <p style={{ fontSize: 14, color: '#4A4A52' }}>No hay pendientes archivados</p>
            </div>
          ) : (
            archivedItems.map(item => (
              <div key={item.id} className="archived-card">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '1px 7px', borderRadius: 20, background: item.sectionBg, color: item.sectionColor, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                        {item.sectionLabel}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#9090A0', lineHeight: 1.4, textDecoration: 'line-through', textDecorationColor: '#3A3A40' }}>{item.text}</p>
                    {comments[item.id] && (
                      <p style={{ fontSize: 12, color: '#4A4A52', marginTop: 6, lineHeight: 1.5, background: '#0C0C0E', borderRadius: 6, padding: '6px 10px' }}>{comments[item.id]}</p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button className="pill-btn" onClick={() => restoreItem(item.id)} title="Restaurar">↩ Restaurar</button>
                    <button className="pill-btn danger" onClick={() => deleteItem(item.id)} title="Eliminar permanentemente">🗑</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
