// Tipos base para el proyecto Refolder

export interface User {
  id: string
  email: string
  name?: string
  created_at: string
  updated_at: string
}

export interface Obra {
  id: string
  nombre: string
  descripcion?: string
  direccion: string
  cliente_id: string
  estado: 'planificacion' | 'en_curso' | 'pausada' | 'finalizada' | 'cancelada'
  fecha_inicio?: string
  fecha_fin_prevista?: string
  fecha_fin?: string
  presupuesto_total?: number
  created_at: string
  updated_at: string
}

export interface Cliente {
  id: string
  nombre: string
  email?: string
  telefono?: string
  direccion?: string
  notas?: string
  created_at: string
  updated_at: string
}

export interface Presupuesto {
  id: string
  obra_id: string
  nombre: string
  descripcion?: string
  importe_total: number
  estado: 'borrador' | 'enviado' | 'aceptado' | 'rechazado'
  fecha_creacion: string
  fecha_validez?: string
  created_at: string
  updated_at: string
}

export interface Proveedor {
  id: string
  nombre: string
  tipo: 'material' | 'mano_obra' | 'servicio' | 'otro'
  contacto?: string
  telefono?: string
  email?: string
  direccion?: string
  notas?: string
  created_at: string
  updated_at: string
}


