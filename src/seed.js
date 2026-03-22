import { db } from './firebase'
import { ref, set } from 'firebase/database'

const ahora = Date.now()

export const seedItems = async () => {
  await set(ref(db, 'items'), {
    op1: { id: 'op1', text: 'Costeo de todas las recetas', note: 'Faltan recetas madre + sub recetas', section: 'operaciones', createdAt: ahora },
    op2: { id: 'op2', text: 'Estandarización de recetas base', note: '', section: 'operaciones', createdAt: ahora },
    op3: { id: 'op3', text: 'Catálogo inteligente', note: 'Línea Signature 3–5 diseños, sabores estrella, opciones premium', section: 'operaciones', createdAt: ahora },
    op4: { id: 'op4', text: 'Manual de procesos + control de calidad', note: 'Secuencia de calidad documentada', section: 'operaciones', createdAt: ahora },
    op5: { id: 'op5', text: 'Ciclos pedido → entrega', note: 'Protocolo desde contacto hasta entrega', section: 'operaciones', createdAt: ahora },
    op6: { id: 'op6', text: 'Política de retrasos + calendario', note: '', section: 'operaciones', createdAt: ahora },
    fi1: { id: 'fi1', text: 'Separar cuenta bancaria BBVA (Pastelería)', note: 'Ya hay altas fiscales — falta separación de obligaciones', section: 'finanzas', urgent: true, createdAt: ahora },
    fi2: { id: 'fi2', text: 'Facturama — aprender a emitir facturas', note: '', section: 'finanzas', createdAt: ahora },
    fi3: { id: 'fi3', text: 'Registrar empleados al IMSS', note: 'Preguntar a la contadora qué conviene', section: 'finanzas', urgent: true, createdAt: ahora },
    fi4: { id: 'fi4', text: 'Opinión de cumplimiento SAT', note: 'Resultado llega a fin de mes', section: 'finanzas', urgent: true, createdAt: ahora },
    fi5: { id: 'fi5', text: 'Tabulador de ingresos y egresos', note: '', section: 'finanzas', createdAt: ahora },
    fi6: { id: 'fi6', text: 'Actualizar Control de Riesgo', note: '', section: 'finanzas', createdAt: ahora },
    fi7: { id: 'fi7', text: 'Indicadores clave (KPIs)', note: '', section: 'finanzas', createdAt: ahora },
    fi8: { id: 'fi8', text: 'Definir sueldo Beatriz', note: '', section: 'finanzas', createdAt: ahora },
    te1: { id: 'te1', text: 'Chatbot WhatsApp (Meta / N8N / agentes)', note: 'Investigar casos de uso META Business', section: 'tecnologia', createdAt: ahora },
    te2: { id: 'te2', text: 'Separar número de contacto oficial', note: '', section: 'tecnologia', createdAt: ahora },
    te3: { id: 'te3', text: 'Landing page con identidad definida', note: '', section: 'tecnologia', createdAt: ahora },
    te4: { id: 'te4', text: 'Hacer formatos operativos', note: '', section: 'tecnologia', createdAt: ahora },
    mk1: { id: 'mk1', text: 'Cambiar logo + identidad visual', note: 'Facebook, Instagram y landing con misma imagen', section: 'marketing', createdAt: ahora },
    mk2: { id: 'mk2', text: 'Carpeta de fotos Google Drive (top 50)', note: 'Edición con Krita', section: 'marketing', createdAt: ahora },
    mk3: { id: 'mk3', text: 'Contrato de alianza para publicidad', note: '', section: 'marketing', createdAt: ahora },
    in1: { id: 'in1', text: 'Cotización refrigerador / congelador', note: '', section: 'insumos', createdAt: ahora },
    in2: { id: 'in2', text: 'Rack o mueble + espiguero', note: '', section: 'insumos', createdAt: ahora },
    in3: { id: 'in3', text: 'Jarabes — cotización enviada 18-03-26', note: 'Seguimiento pendiente', section: 'insumos', createdAt: ahora },
    in4: { id: 'in4', text: 'Cartones corrugados, obleas, impresión', note: 'Obleas hojas de arroz/azúcar, transfer gelatina, impresión chocolate', section: 'insumos', createdAt: ahora },
    in5: { id: 'in5', text: 'Precios proveedores', note: '', section: 'insumos', createdAt: ahora },
  })
  console.log('✅ Seed completado')
}