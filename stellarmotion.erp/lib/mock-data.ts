// Datos mock para reemplazar Prisma
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

// Datos mock
export const mockSoportes: Soporte[] = [
  {
    id: "1",
    nombre: "Valla Principal - Av. 16 de Julio",
    descripcion: "Valla publicitaria en la avenida principal de La Paz",
    ubicacion: "Av. 16 de Julio, La Paz, Bolivia",
    latitud: -16.5000,
    longitud: -68.1500,
    tipo: "Valla",
    estado: "disponible",
    precio: 850,
    dimensiones: {
      ancho: 6,
      alto: 3,
      area: 18
    },
    imagenes: ["/uploads/support_1756998070185_mh13r4ik97i.png"],
    categoria: "Vallas",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15")
  },
  {
    id: "2",
    nombre: "Pantalla LED - Centro Comercial",
    descripcion: "Pantalla digital en el centro comercial más grande de Santa Cruz",
    ubicacion: "Centro Comercial, Santa Cruz, Bolivia",
    latitud: -17.7833,
    longitud: -63.1833,
    tipo: "Digital",
    estado: "ocupado",
    precio: 1200,
    dimensiones: {
      ancho: 4,
      alto: 2.5,
      area: 10
    },
    imagenes: ["/uploads/support_1757212460921_t095k9k832b.png"],
    categoria: "Digital",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20")
  },
  {
    id: "3",
    nombre: "MUPI - Zona Peatonal",
    descripcion: "MUPI en zona peatonal de Cochabamba",
    ubicacion: "Zona Peatonal, Cochabamba, Bolivia",
    latitud: -17.3833,
    longitud: -66.1667,
    tipo: "MUPI",
    estado: "disponible",
    precio: 450,
    dimensiones: {
      ancho: 1.2,
      alto: 2.4,
      area: 2.88
    },
    imagenes: ["/uploads/support_1757272160679_wozoor8owlo.png"],
    categoria: "MUPI",
    createdAt: new Date("2024-01-25"),
    updatedAt: new Date("2024-01-25")
  }
]

export const mockClientes: Cliente[] = [
  {
    id: "1",
    nombre: "Coca-Cola Bolivia",
    email: "contacto@cocacola.bo",
    telefono: "+591 2 1234567",
    direccion: "Av. Mariscal Santa Cruz, La Paz",
    nit: "123456789",
    estado: "activo",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10")
  },
  {
    id: "2",
    nombre: "Banco Nacional de Bolivia",
    email: "marketing@bnb.com.bo",
    telefono: "+591 2 2345678",
    direccion: "Av. 16 de Julio, La Paz",
    nit: "987654321",
    estado: "activo",
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-12")
  },
  {
    id: "3",
    nombre: "Entel Bolivia",
    email: "publicidad@entel.bo",
    telefono: "+591 2 3456789",
    direccion: "Av. Arce, La Paz",
    nit: "456789123",
    estado: "activo",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15")
  }
]

export const mockCategorias: Categoria[] = [
  {
    id: "1",
    nombre: "Vallas",
    descripcion: "Vallas publicitarias tradicionales",
    icono: "billboard",
    color: "#3B82F6"
  },
  {
    id: "2",
    nombre: "Digital",
    descripcion: "Pantallas digitales y LED",
    icono: "monitor",
    color: "#10B981"
  },
  {
    id: "3",
    nombre: "MUPI",
    descripcion: "Mobiliario urbano para información",
    icono: "map-pin",
    color: "#F59E0B"
  }
]

// Funciones mock para simular operaciones de base de datos
export class MockDatabase {
  static async findMany<T>(data: T[]): Promise<T[]> {
    return Promise.resolve([...data])
  }

  static async findUnique<T>(data: T[], id: string): Promise<T | null> {
    const item = data.find((item: any) => item.id === id)
    return item ? { ...item } : null
  }

  static async create<T>(data: T[], newItem: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const id = (data.length + 1).toString()
    const now = new Date()
    const created = {
      ...newItem,
      id,
      createdAt: now,
      updatedAt: now
    } as T
    data.push(created)
    return created
  }

  static async update<T>(data: T[], id: string, updates: Partial<T>): Promise<T | null> {
    const index = data.findIndex((item: any) => item.id === id)
    if (index === -1) return null
    
    const updated = {
      ...data[index],
      ...updates,
      updatedAt: new Date()
    } as T
    data[index] = updated
    return updated
  }

  static async delete<T>(data: T[], id: string): Promise<T | null> {
    const index = data.findIndex((item: any) => item.id === id)
    if (index === -1) return null
    
    const deleted = data[index]
    data.splice(index, 1)
    return deleted
  }
}
