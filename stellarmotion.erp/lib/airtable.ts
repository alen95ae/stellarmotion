import Airtable from 'airtable'

// Validar variables de entorno
if (!process.env.AIRTABLE_API_KEY) {
  throw new Error('AIRTABLE_API_KEY is not defined in environment variables')
}
if (!process.env.AIRTABLE_BASE_ID) {
  throw new Error('AIRTABLE_BASE_ID is not defined in environment variables')
}

console.log('Airtable API Key:', process.env.AIRTABLE_API_KEY ? 'Set' : 'Not set')
console.log('Airtable Base ID:', process.env.AIRTABLE_BASE_ID ? 'Set' : 'Not set')

// Configuración de Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID!)

// Interfaces para los datos
export interface Soporte {
  id: string
  nombre: string
  descripcion: string
  ubicacion: string
  latitud: number
  longitud: number
  tipo: string
  estado: 'disponible' | 'ocupado' | 'reservado' | 'mantenimiento'
  precio: number
  dimensiones: {
    ancho: number
    alto: number
    area: number
  }
  imagenes: string[]
  categoria: string
  createdAt: Date
  updatedAt: Date
}

export interface Cliente {
  id: string
  nombre: string
  email: string
  telefono: string
  direccion: string
  nit: string
  estado: 'activo' | 'inactivo'
  createdAt: Date
  updatedAt: Date
}

export interface Categoria {
  id: string
  nombre: string
  descripcion: string
  icono: string
  color: string
}

// Funciones para convertir datos de Airtable
function mapSoporteFromAirtable(record: any): Soporte {
  return {
    id: record.id,
    nombre: record.get('Nombre') || '',
    descripcion: record.get('Descripcion') || '',
    ubicacion: record.get('Ubicacion') || '',
    latitud: record.get('Latitud') || 0,
    longitud: record.get('Longitud') || 0,
    tipo: record.get('Tipo') || '',
    estado: record.get('Estado') || 'disponible',
    precio: record.get('Precio') || 0,
    dimensiones: {
      ancho: record.get('Ancho') || 0,
      alto: record.get('Alto') || 0,
      area: record.get('Area') || 0
    },
    imagenes: record.get('Imagenes') || [],
    categoria: record.get('Categoria') || '',
    createdAt: new Date(record.get('Created') || Date.now()),
    updatedAt: new Date(record.get('Last Modified') || Date.now())
  }
}

function mapClienteFromAirtable(record: any): Cliente {
  return {
    id: record.id,
    nombre: record.get('Nombre') || '',
    email: record.get('Email') || '',
    telefono: record.get('Telefono') || '',
    direccion: record.get('Direccion') || '',
    nit: record.get('NIT') || '',
    estado: record.get('Estado') || 'activo',
    createdAt: new Date(record.get('Created') || Date.now()),
    updatedAt: new Date(record.get('Last Modified') || Date.now())
  }
}

function mapCategoriaFromAirtable(record: any): Categoria {
  return {
    id: record.id,
    nombre: record.get('Nombre') || '',
    descripcion: record.get('Descripcion') || '',
    icono: record.get('Icono') || '',
    color: record.get('Color') || '#3B82F6'
  }
}

// Clase para manejar operaciones de Airtable
export class AirtableService {
  // SOPORTES
  static async getSoportes(filters?: {
    search?: string
    categoria?: string
    estado?: string
    tipo?: string
  }) {
    try {
      console.log('Fetching soportes from Airtable...')
      const records = await base('Soportes').select({
        maxRecords: 100,
        sort: [{ field: 'Created', direction: 'desc' }]
      }).all()

      console.log(`Found ${records.length} records in Airtable`)
      let soportes = records.map(mapSoporteFromAirtable)

      // Aplicar filtros
      if (filters?.search) {
        const search = filters.search.toLowerCase()
        soportes = soportes.filter(s => 
          s.nombre.toLowerCase().includes(search) ||
          s.descripcion.toLowerCase().includes(search) ||
          s.ubicacion.toLowerCase().includes(search)
        )
      }

      if (filters?.categoria) {
        soportes = soportes.filter(s => s.categoria === filters.categoria)
      }

      if (filters?.estado) {
        soportes = soportes.filter(s => s.estado === filters.estado)
      }

      if (filters?.tipo) {
        soportes = soportes.filter(s => s.tipo === filters.tipo)
      }

      console.log(`Returning ${soportes.length} filtered soportes`)
      return soportes
    } catch (error) {
      console.error('Error fetching soportes from Airtable:', error)
      // En caso de error, devolver array vacío para que la app no se rompa
      return []
    }
  }

  static async getSoporteById(id: string): Promise<Soporte | null> {
    try {
      const record = await base('Soportes').find(id)
      return mapSoporteFromAirtable(record)
    } catch (error) {
      console.error('Error fetching soporte by ID:', error)
      return null
    }
  }

  static async createSoporte(data: Omit<Soporte, 'id' | 'createdAt' | 'updatedAt'>): Promise<Soporte> {
    try {
      const record = await base('Soportes').create({
        'Nombre': data.nombre,
        'Descripcion': data.descripcion,
        'Ubicacion': data.ubicacion,
        'Latitud': data.latitud,
        'Longitud': data.longitud,
        'Tipo': data.tipo,
        'Estado': data.estado,
        'Precio': data.precio,
        'Ancho': data.dimensiones.ancho,
        'Alto': data.dimensiones.alto,
        'Area': data.dimensiones.area,
        'Imagenes': data.imagenes,
        'Categoria': data.categoria
      })

      return mapSoporteFromAirtable(record)
    } catch (error) {
      console.error('Error creating soporte:', error)
      throw error
    }
  }

  static async updateSoporte(id: string, data: Partial<Soporte>): Promise<Soporte | null> {
    try {
      const updateFields: any = {}
      
      if (data.nombre) updateFields['Nombre'] = data.nombre
      if (data.descripcion) updateFields['Descripcion'] = data.descripcion
      if (data.ubicacion) updateFields['Ubicacion'] = data.ubicacion
      if (data.latitud !== undefined) updateFields['Latitud'] = data.latitud
      if (data.longitud !== undefined) updateFields['Longitud'] = data.longitud
      if (data.tipo) updateFields['Tipo'] = data.tipo
      if (data.estado) updateFields['Estado'] = data.estado
      if (data.precio !== undefined) updateFields['Precio'] = data.precio
      if (data.dimensiones) {
        if (data.dimensiones.ancho !== undefined) updateFields['Ancho'] = data.dimensiones.ancho
        if (data.dimensiones.alto !== undefined) updateFields['Alto'] = data.dimensiones.alto
        if (data.dimensiones.area !== undefined) updateFields['Area'] = data.dimensiones.area
      }
      if (data.imagenes) updateFields['Imagenes'] = data.imagenes
      if (data.categoria) updateFields['Categoria'] = data.categoria

      const record = await base('Soportes').update(id, updateFields)
      return mapSoporteFromAirtable(record)
    } catch (error) {
      console.error('Error updating soporte:', error)
      return null
    }
  }

  static async deleteSoporte(id: string): Promise<boolean> {
    try {
      await base('Soportes').destroy(id)
      return true
    } catch (error) {
      console.error('Error deleting soporte:', error)
      return false
    }
  }

  // CLIENTES
  static async getClientes() {
    try {
      const records = await base('Clientes').select({
        maxRecords: 100,
        sort: [{ field: 'Created', direction: 'desc' }]
      }).all()

      return records.map(mapClienteFromAirtable)
    } catch (error) {
      console.error('Error fetching clientes from Airtable:', error)
      throw error
    }
  }

  static async getClienteById(id: string): Promise<Cliente | null> {
    try {
      const record = await base('Clientes').find(id)
      return mapClienteFromAirtable(record)
    } catch (error) {
      console.error('Error fetching cliente by ID:', error)
      return null
    }
  }

  static async createCliente(data: Omit<Cliente, 'id' | 'createdAt' | 'updatedAt'>): Promise<Cliente> {
    try {
      const record = await base('Clientes').create({
        'Nombre': data.nombre,
        'Email': data.email,
        'Telefono': data.telefono,
        'Direccion': data.direccion,
        'NIT': data.nit,
        'Estado': data.estado
      })

      return mapClienteFromAirtable(record)
    } catch (error) {
      console.error('Error creating cliente:', error)
      throw error
    }
  }

  // CATEGORIAS
  static async getCategorias() {
    try {
      console.log('Fetching categorias from Airtable...')
      const records = await base('Categorias').select({
        maxRecords: 100
      }).all()

      console.log(`Found ${records.length} categorias in Airtable`)
      return records.map(mapCategoriaFromAirtable)
    } catch (error) {
      console.error('Error fetching categorias from Airtable:', error)
      // En caso de error, devolver array vacío para que la app no se rompa
      return []
    }
  }
}
