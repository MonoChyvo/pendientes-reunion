import { useState, useEffect } from 'react'
import { db } from './firebase'
import { ref, onValue, set } from 'firebase/database'

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

const ALL_IDS = Object.values(INITIAL_ITEMS).flatMap(s => s.items.map(i => i.id))

export default function App() {
  const [checked, setChecked] = useState({})
  const [loaded, setLoaded] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    const dbRef = ref(db, 'pendientes/checked')
    console.log('🔌 Conectando a Firebase...')
    const unsub = onValue(dbRef, (snap) => {
      console.log('✅ Firebase conectado. Datos:', snap.val())
      setChecked(snap.val() || {})
      setLoaded(true)
    }, (error) => {
      console.error('❌ Error Firebase:', error)
    })
    return () => unsub()
  }, [])

  const toggle = async (id) => {
    const next = { ...checked, [id]: !checked[id] }
    console.log(`🔄 Toggle "${id}" →`, next[id] ? 'completado' : 'desmarcado')
    setChecked(next)
    await set(ref(db, 'pendientes/checked'), next)
    console.log('💾 Guardado en Firebase')
  }

  const resetAll = async () => {
    setChecked({})
    await set(ref(db, 'pendientes/checked'), {})
  }

  const total = ALL_IDS.length
  const done = ALL_IDS.filter(id => checked[id]).length
  const pct = Math.round((done / total) * 100)

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
    <div style={{ minHeight: '100vh', background: '#0C0C0E', fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .item-row { display: flex; align-items: flex-start; gap: 12px; padding: 12px 16px; border-radius: 10px; cursor: pointer; transition: background 0.15s; }
        .item-row:hover { background: rgba(255,255,255,0.04); }
        .item-row.done { opacity: 0.35; }
        .check-circle { width: 20px; height: 20px; border-radius: 50%; border: 1.5px solid #3A3A40; flex-shrink: 0; margin-top: 2px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; background: transparent; }
        .item-row.done .check-circle { background: #22C55E; border-color: #22C55E; }
        .check-svg { display: none; }
        .item-row.done .check-svg { display: block; }
        .filter-pill { padding: 5px 14px; border-radius: 20px; border: 1px solid #2A2A2E; background: transparent; font-size: 12px; font-weight: 500; color: #6B6B75; cursor: pointer; transition: all 0.15s; font-family: inherit; }
        .filter-pill:hover { border-color: #4A4A52; color: #E0E0E8; }
        .filter-pill.active { background: #E0E0E8; border-color: #E0E0E8; color: #0C0C0E; }
        .reset-btn { padding: 6px 14px; border-radius: 8px; border: 1px solid #2A2A2E; background: transparent; font-size: 12px; color: #6B6B75; cursor: pointer; font-family: inherit; transition: all 0.15s; }
        .reset-btn:hover { border-color: #EF4444; color: #EF4444; }
        .section-card { background: #141418; border: 1px solid #1E1E24; border-radius: 14px; margin-bottom: 10px; overflow: hidden; }
        .progress-track { height: 3px; background: #1E1E24; border-radius: 2px; overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 2px; background: linear-gradient(90deg, #22C55E, #16A34A); transition: width 0.4s ease; }
      `}</style>

      {/* Header */}
      <div style={{ background: '#0C0C0E', borderBottom: '1px solid #1E1E24', padding: '20px 24px 16px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: '#E0E0E8', fontWeight: 400 }}>Pendientes — Fresa & Lavanda</h1>
            <span style={{ fontSize: 12, color: '#4A4A52' }}>{done}/{total}</span>
          </div>
          <div className="progress-track" style={{ marginBottom: 14 }}>
            <div className="progress-fill" style={{ width: pct + '%' }} />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <button className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>Todos</button>
            <button className={`filter-pill ${activeFilter === 'urgent' ? 'active' : ''}`} onClick={() => setActiveFilter('urgent')}>⚡ Urgentes</button>
            <button className={`filter-pill ${activeFilter === 'pending' ? 'active' : ''}`} onClick={() => setActiveFilter('pending')}>Pendientes</button>
            <div style={{ flex: 1 }} />
            <button className="reset-btn" onClick={resetAll}>Reiniciar</button>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '16px 16px 40px' }}>
        {Object.entries(INITIAL_ITEMS).map(([key, section]) => {
          let items = section.items
          if (activeFilter === 'urgent') items = items.filter(i => i.urgent)
          if (activeFilter === 'pending') items = items.filter(i => !checked[i.id])
          if (items.length === 0) return null

          const secDone = section.items.filter(i => checked[i.id]).length

          return (
            <div key={key} className="section-card">
              <div style={{ padding: '11px 16px 9px', borderBottom: '1px solid #1E1E24', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: section.bg, color: section.color, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {section.label}
                </span>
                <span style={{ fontSize: 12, color: '#3A3A40' }}>{secDone}/{section.items.length}</span>
              </div>
              <div style={{ padding: '6px 0' }}>
                {items.map(item => (
                  <div key={item.id} className={`item-row ${checked[item.id] ? 'done' : ''}`} onClick={() => toggle(item.id)}>
                    <div className="check-circle">
                      <svg className="check-svg" width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#D0D0D8', lineHeight: 1.4 }}>{item.text}</span>
                        {item.urgent && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'rgba(239,68,68,0.15)', color: '#F87171', fontWeight: 600, letterSpacing: '0.04em' }}>URGENTE</span>}
                      </div>
                      {item.note && <p style={{ fontSize: 12, color: '#4A4A52', marginTop: 2, lineHeight: 1.4 }}>{item.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {pct === 100 && (
          <div style={{ textAlign: 'center', padding: '32px 16px', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
            <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: '#E0E0E8' }}>¡Todo listo!</p>
            <p style={{ fontSize: 13, color: '#4A4A52', marginTop: 4 }}>Todos los pendientes completados</p>
          </div>
        )}
      </div>
    </div>
  )
}
