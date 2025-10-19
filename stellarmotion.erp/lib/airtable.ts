// Airtable REST API Helper
// Configuración de la API de Airtable usando fetch nativo

const AIRTABLE_API_URL = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_SOPORTES}`;

// Función para generar código interno automático secuencial
async function generateInternalCode(): Promise<string> {
  try {
    // Obtener todos los soportes para encontrar el último código
    const response = await fetch(AIRTABLE_API_URL, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Error fetching records');
    }
    
    const data = await response.json();
    const records = data.records || [];
    
    // Buscar códigos existentes y determinar el siguiente número
    let maxCode = 0;
    const existingCodes = new Set();
    
    records.forEach((record: any) => {
      const codigoInterno = record.fields['Código interno'] || '';
      if (codigoInterno) {
        existingCodes.add(codigoInterno);
        
        // Buscar patrones de códigos existentes para determinar el formato
        const patterns = [
          /^VG-(\d+)$/,      // VG-120
          /^MA-(\d+)$/,      // MA-045
          /^LEPM-(\d+)$/,    // LEPM-009
          /^PL-CC-(\d+)$/,   // PL-CC-202
          /^VP-R1-(\d+)$/,   // VP-R1-15
          /^SM-(\d+)$/       // SM-001 (nuevo formato)
        ];
        
        for (const pattern of patterns) {
          const match = codigoInterno.match(pattern);
          if (match) {
            const codeNumber = parseInt(match[1], 10);
            if (codeNumber > maxCode) {
              maxCode = codeNumber;
            }
            break;
          }
        }
      }
    });
    
    // Generar el siguiente código en formato SM-XXX
    const nextCode = maxCode + 1;
    let newCode = `SM-${String(nextCode).padStart(3, '0')}`;
    
    // Asegurar que el código no exista
    let counter = nextCode;
    while (existingCodes.has(newCode)) {
      counter++;
      newCode = `SM-${String(counter).padStart(3, '0')}`;
    }
    
    return newCode;
  } catch (error) {
    console.error('Error generating internal code:', error);
    // Fallback: usar timestamp para generar código único
    const timestamp = Date.now().toString().slice(-3);
    return `SM-${timestamp}`;
  }
}

// Headers comunes para todas las peticiones
const getHeaders = () => ({
  'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
  'Content-Type': 'application/json'
});

// Interfaces para los datos
export interface Soporte {
  id: string;
  nombre: string;
  descripcion: string;
  ubicacion: string;
  latitud: number;
  longitud: number;
  tipo: string;
  estado: 'disponible' | 'ocupado' | 'reservado' | 'mantenimiento';
  precio: number;
  dimensiones: {
    ancho: number;
    alto: number;
    area: number;
  };
  imagenes: string[];
  categoria: string;
  // Campos adicionales de Airtable
  codigoInterno?: string;
  codigoCliente?: string;
  pais?: string;
  ciudad?: string;
  googleMapsLink?: string;
  impactosDiarios?: number;
  impactosDiariosPorM2?: number;
  resumenAutomatico?: string;
  partnerId?: string;
  partner?: {
    id: string;
    name: string;
    companyName?: string;
    email: string;
  };
  owner?: string;
  iluminacion?: boolean;
  destacado?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  nit: string;
  estado: 'activo' | 'inactivo';
  createdAt: Date;
  updatedAt: Date;
}

export interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
}

// Función para mapear registros de Airtable a nuestro formato
async function mapSoporteFromAirtable(record: any): Promise<Soporte> {
  const fields = record.fields;
  
  return {
    id: record.id,
    nombre: fields['Título del soporte'] || fields.Nombre || '',
    descripcion: fields.Descripción || fields.Descripcion || '',
    ubicacion: fields.Ciudad || fields.Ubicacion || '',
    latitud: fields.Latitud || 0,
    longitud: fields.Longitud || 0,
    tipo: fields['Tipo de soporte'] || fields.Tipo || '',
    estado: fields['Estado del soporte'] || fields.Estado || fields.estado || 'disponible',
    precio: fields['Precio por mes'] || fields.Precio || 0,
    dimensiones: {
      ancho: fields.Ancho || 0,
      alto: fields.Alto || 0,
      area: fields['Superficie (m²)'] || fields.Area || 0
    },
    imagenes: [
      fields['Imagen 1'],
      fields['Imagen 2'],
      fields['Imagen 3']
    ].filter(img => img && typeof img === 'string' && img.trim() !== '') || [],
    categoria: fields['Categoría de Ubicación'] || fields.Categoria || '',
    // Campos adicionales para el mapeo correcto
    codigoInterno: fields['Código interno'] || await generateInternalCode(),
    codigoCliente: fields['Código cliente'] || '',
    pais: fields.País || '',
    ciudad: fields.Ciudad || '',
    googleMapsLink: fields['Enlace de Google Maps'] || '',
    impactosDiarios: fields['Impactos diarios'] || 0,
    impactosDiariosPorM2: fields['Impactos diarios por m²'] || 0,
    resumenAutomatico: fields['Resumen automático'] || '',
    // Campos de Partner desde Airtable
    partnerId: fields['Partner ID'] || fields.PartnerID || null,
    partner: fields['Partner'] ? {
      id: fields['Partner ID'] || '',
      name: fields['Partner'] || '',
      companyName: fields['Partner Company'] || null,
      email: fields['Partner Email'] || ''
    } : null,
    owner: fields['Propietario'] || fields.Owner || null,
    iluminacion: fields['Iluminación'] || fields.Iluminacion || fields.iluminacion || false,
    destacado: fields['Destacado'] || fields.Destacado || fields.destacado || false,
    createdAt: new Date(fields.Created || Date.now()),
    updatedAt: new Date(fields['Last Modified'] || Date.now())
  };
}

// Función para mapear clientes de Airtable
function mapClienteFromAirtable(record: any): Cliente {
  const fields = record.fields;
  return {
    id: record.id,
    nombre: fields.Nombre || '',
    email: fields.Email || '',
    telefono: fields.Telefono || '',
    direccion: fields.Direccion || '',
    nit: fields.NIT || '',
    estado: fields.Estado || 'activo',
    createdAt: new Date(fields.Created || Date.now()),
    updatedAt: new Date(fields['Last Modified'] || Date.now())
  };
}

// Función para mapear categorías de Airtable
function mapCategoriaFromAirtable(record: any): Categoria {
  const fields = record.fields;
  return {
    id: record.id,
    nombre: fields.Nombre || '',
    descripcion: fields.Descripcion || '',
    icono: fields.Icono || '',
    color: fields.Color || '#3B82F6'
  };
}

// Clase principal para manejar operaciones de Airtable
export class AirtableService {
  // SOPORTES
  static async getSoportes(filters?: {
    search?: string;
    categoria?: string;
    estado?: string;
    tipo?: string;
  }): Promise<Soporte[]> {
    try {
      console.log('🔍 Fetching soportes from Airtable...');
      console.log('📡 API URL:', AIRTABLE_API_URL);
      
      const response = await fetch(AIRTABLE_API_URL, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.error('❌ Airtable authentication failed:', response.status, response.statusText);
          throw new Error('Airtable authentication failed');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Found ${data.records.length} records in Airtable`);
      
      let soportes = await Promise.all(data.records.map(mapSoporteFromAirtable));
      
      // Debug: mostrar estados de los soportes
      console.log('📋 Estados de soportes encontrados:', soportes.map(s => ({ id: s.id, nombre: s.nombre, estado: s.estado })));

      // Aplicar filtros
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        soportes = soportes.filter(s => 
          s.nombre.toLowerCase().includes(search) ||
          s.descripcion.toLowerCase().includes(search) ||
          s.ubicacion.toLowerCase().includes(search)
        );
      }

      if (filters?.categoria) {
        soportes = soportes.filter(s => s.categoria === filters.categoria);
      }

      if (filters?.estado) {
        console.log(`🔍 Aplicando filtro de estado: "${filters.estado}"`);
        const beforeCount = soportes.length;
        soportes = soportes.filter(s => {
          const estadoSoporte = s.estado?.trim();
          const estadoFiltro = filters.estado.trim();
          
          // Comparación flexible: exacta, lowercase, o uppercase
          return estadoSoporte === estadoFiltro ||
                 estadoSoporte?.toLowerCase() === estadoFiltro.toLowerCase() ||
                 estadoSoporte?.toUpperCase() === estadoFiltro.toUpperCase();
        });
        console.log(`📊 Filtro de estado: ${beforeCount} → ${soportes.length} soportes`);
      }

      if (filters?.tipo) {
        soportes = soportes.filter(s => s.tipo === filters.tipo);
      }

      console.log(`📊 Returning ${soportes.length} filtered soportes`);
      return soportes;
    } catch (error) {
      console.error('❌ Error fetching soportes from Airtable:', error);
      console.log('🔄 Falling back to mock data...');
      
      // Datos mock de fallback
      const mockSoportes: Soporte[] = [
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
          partnerId: "partner_1",
          partner: {
            id: "partner_1",
            name: "Carlos Mendoza",
            companyName: "Publicidad Andina SRL",
            email: "carlos@publicidadandina.com"
          },
          owner: "Carlos Mendoza",
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
          partnerId: "partner_2",
          partner: {
            id: "partner_2",
            name: "Ana García",
            companyName: "Digital Media Solutions",
            email: "ana@digitalmedia.bo"
          },
          owner: "Ana García",
          createdAt: new Date("2024-01-20"),
          updatedAt: new Date("2024-01-20")
        },
        {
          id: "3",
          nombre: "MUPI Zona Sur",
          descripcion: "MUPI en la zona sur de Santa Cruz",
          ubicacion: "Zona Sur, Santa Cruz, Bolivia",
          latitud: -17.8000,
          longitud: -63.2000,
          tipo: "MUPI",
          estado: "reservado",
          precio: 450,
          dimensiones: {
            ancho: 2,
            alto: 3,
            area: 6
          },
          imagenes: ["/uploads/support_1757272160679_wozoor8owlo.png"],
          categoria: "MUPI",
          owner: "María López",
          createdAt: new Date("2024-01-25"),
          updatedAt: new Date("2024-01-25")
        },
        {
          id: "4",
          nombre: "Valla Centro - Mantenimiento",
          descripcion: "Valla en mantenimiento técnico",
          ubicacion: "Centro, La Paz, Bolivia",
          latitud: -16.5000,
          longitud: -68.1500,
          tipo: "Valla",
          estado: "mantenimiento",
          precio: 0,
          dimensiones: {
            ancho: 4,
            alto: 2,
            area: 8
          },
          imagenes: ["/uploads/support_1757272160679_wozoor8owlo.png"],
          categoria: "Vallas",
          owner: "Técnico Mantenimiento",
          createdAt: new Date("2024-01-30"),
          updatedAt: new Date("2024-01-30")
        }
      ];

      let filteredSoportes = [...mockSoportes];

      // Aplicar filtros a los datos mock
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        filteredSoportes = filteredSoportes.filter(s => 
          s.nombre.toLowerCase().includes(search) ||
          s.descripcion.toLowerCase().includes(search) ||
          s.ubicacion.toLowerCase().includes(search)
        );
      }

      if (filters?.categoria) {
        filteredSoportes = filteredSoportes.filter(s => s.categoria === filters.categoria);
      }

      if (filters?.estado) {
        filteredSoportes = filteredSoportes.filter(s => s.estado === filters.estado);
      }

      if (filters?.tipo) {
        filteredSoportes = filteredSoportes.filter(s => s.tipo === filters.tipo);
      }

      console.log(`📦 Returning ${filteredSoportes.length} mock soportes`);
      return filteredSoportes;
    }
  }

  static async getSoporteById(id: string): Promise<Soporte | null> {
    try {
      console.log(`🔍 Fetching soporte by ID: ${id}`);
      
      const response = await fetch(`${AIRTABLE_API_URL}/${id}`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('❌ Soporte not found');
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Soporte found in Airtable');
      return await mapSoporteFromAirtable(data);
    } catch (error) {
      console.error('❌ Error fetching soporte by ID:', error);
      return null;
    }
  }

  static async createSoporte(data: any): Promise<Soporte | null> {
    try {
      console.log('➕ Creating new soporte in Airtable...');
      console.log('📤 Datos recibidos para crear:', data);
      
      const createFields: any = {};
      
      // Campos básicos
      if (data['Título del soporte']) createFields['Título del soporte'] = data['Título del soporte'];
      if (data['Descripción']) createFields['Descripción'] = data['Descripción'];
      if (data['Tipo de soporte']) createFields['Tipo de soporte'] = data['Tipo de soporte'];
      if (data['Estado del soporte']) createFields['Estado'] = data['Estado del soporte'];
      if (data['Precio por mes'] !== undefined) createFields['Precio por mes'] = data['Precio por mes'];
      
      // Dimensiones
      if (data.dimensiones) {
        if (data.dimensiones.ancho !== undefined) createFields['Ancho'] = data.dimensiones.ancho;
        if (data.dimensiones.alto !== undefined) createFields['Alto'] = data.dimensiones.alto;
        // Superficie (m²) es un campo calculado automáticamente en Airtable
      }
      
      // Campos adicionales
      if (data['Código interno']) createFields['Código interno'] = data['Código interno'];
      if (data['Código cliente']) createFields['Código cliente'] = data['Código cliente'];
      if (data['Impactos diarios'] !== undefined) createFields['Impactos diarios'] = data['Impactos diarios'];
      if (data['Enlace de Google Maps']) createFields['Enlace de Google Maps'] = data['Enlace de Google Maps'];
      if (data['Propietario']) createFields['Partner'] = data['Propietario'];
      
      // Campos de ubicación
      if (data.ciudad) createFields['Ciudad'] = data.ciudad;
      if (data.pais) createFields['País'] = data.pais;
      if (data.ubicacion) createFields['Ubicación'] = data.ubicacion;
      
      // Campos booleanos
      if (data['Iluminación'] !== undefined) createFields['Iluminación'] = data['Iluminación'];
      if (data['Destacado'] !== undefined) createFields['Destacado'] = data['Destacado'];
      
      // Imágenes
      if (data.imagenes && data.imagenes.length > 0) {
        data.imagenes.forEach((image: string, index: number) => {
          if (index < 3) { // Airtable tiene campos Imagen 1, Imagen 2, Imagen 3
            createFields[`Imagen ${index + 1}`] = image;
          }
        });
      }
      
      console.log('📤 Campos que se enviarán a Airtable:', createFields);
      
      const response = await fetch(AIRTABLE_API_URL, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          fields: createFields
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response from Airtable:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Soporte created successfully');
      return await mapSoporteFromAirtable(result);
    } catch (error) {
      console.error('❌ Error creating soporte:', error);
      return null;
    }
  }

  static async updateSoporte(id: string, data: Partial<Soporte>): Promise<Soporte | null> {
    try {
      console.log(`🔄 Updating soporte ${id} in Airtable...`);
      
      const updateFields: any = {};
      
      // Función para mapear estados de ERP a Airtable
      const mapEstadoToAirtable = (estado: string) => {
        const estadoMap: Record<string, string> = {
          'DISPONIBLE': 'Disponible',
          'RESERVADO': 'Reservado', 
          'OCUPADO': 'Ocupado',
          'MANTENIMIENTO': 'Mantenimiento'
        };
        return estadoMap[estado] || 'Disponible';
      };

      // Solo campos básicos que sabemos que existen
      if (data['Título del soporte']) updateFields['Título del soporte'] = data['Título del soporte'];
      if (data['Descripción']) updateFields['Descripción'] = data['Descripción'];
      if (data['Tipo de soporte']) updateFields['Tipo de soporte'] = data['Tipo de soporte'];
      if (data['Estado del soporte']) updateFields['Estado'] = mapEstadoToAirtable(data['Estado del soporte']);
      if (data['Precio por mes'] !== undefined) updateFields['Precio por mes'] = data['Precio por mes'];
      
      // Dimensiones (solo Ancho y Alto, Superficie es calculada automáticamente)
      if (data.dimensiones) {
        if (data.dimensiones.ancho !== undefined) updateFields['Ancho'] = data.dimensiones.ancho;
        if (data.dimensiones.alto !== undefined) updateFields['Alto'] = data.dimensiones.alto;
        // Superficie (m²) es un campo calculado automáticamente en Airtable, no lo enviamos
      }
      
      // Campos adicionales (solo los que sabemos que existen)
      if (data['Código interno']) updateFields['Código interno'] = data['Código interno'];
      if (data['Código cliente']) updateFields['Código cliente'] = data['Código cliente'];
      if (data['Impactos diarios'] !== undefined) updateFields['Impactos diarios'] = data['Impactos diarios'];
      if (data['Enlace de Google Maps']) updateFields['Enlace de Google Maps'] = data['Enlace de Google Maps'];
      if (data['Propietario']) updateFields['Partner'] = data['Propietario'];
      
      // Campos de ubicación
      if (data.ciudad) updateFields['Ciudad'] = data.ciudad;
      if (data.pais) updateFields['País'] = data.pais;
      
      // Campos booleanos (solo si están definidos)
      if (data['Iluminación'] !== undefined) updateFields['Iluminación'] = data['Iluminación'];
      if (data['Destacado'] !== undefined) updateFields['Destacado'] = data['Destacado'];

      console.log('📤 Enviando campos a Airtable:', updateFields);

      const response = await fetch(`${AIRTABLE_API_URL}/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({
          fields: updateFields
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response from Airtable:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Soporte updated successfully');
      return await mapSoporteFromAirtable(result);
    } catch (error) {
      console.error('❌ Error updating soporte:', error);
      return null;
    }
  }

  static async deleteSoporte(id: string): Promise<boolean> {
    try {
      console.log(`🗑️ Deleting soporte ${id} from Airtable...`);
      
      const response = await fetch(`${AIRTABLE_API_URL}/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('✅ Soporte deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ Error deleting soporte:', error);
      return false;
    }
  }

  // Función para cambiar TODOS los códigos al formato SM-XXX
  static async generateTestCodes(): Promise<void> {
    try {
      console.log('🔄 Converting ALL existing codes to SM-XXX format...');
      
      // Obtener todos los soportes
      const response = await fetch(AIRTABLE_API_URL, {
        method: 'GET',
        headers: getHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Error fetching records');
      }
      
      const data = await response.json();
      const records = data.records || [];
      
      console.log(`📊 Found ${records.length} records in Airtable`);
      
      // Mostrar códigos existentes antes del cambio
      const existingCodes = records.map((record: any) => ({
        id: record.id,
        nombre: record.fields['Título del soporte'] || record.fields.Nombre || 'Sin título',
        codigo: record.fields['Código interno'] || 'Sin código'
      }));
      
      console.log('📋 Existing codes (BEFORE):');
      existingCodes.forEach((item: any) => {
        console.log(`  - ${item.nombre}: ${item.codigo}`);
      });
      
      // Generar nuevos códigos SM-XXX para TODOS los registros
      const updates = [];
      
      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const newCode = `SM-${String(i + 1).padStart(3, '0')}`;
        
        updates.push({
          id: record.id,
          nombre: record.fields['Título del soporte'] || record.fields.Nombre || 'Sin título',
          oldCode: record.fields['Código interno'] || 'Sin código',
          newCode: newCode,
          fields: {
            'Código interno': newCode
          }
        });
      }
      
      console.log('🔄 Converting codes:');
      updates.forEach((update: any) => {
        console.log(`  - ${update.nombre}: ${update.oldCode} → ${update.newCode}`);
      });
      
      // Actualizar TODOS los registros en Airtable
      for (const update of updates) {
        await fetch(`${AIRTABLE_API_URL}/${update.id}`, {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify({
            fields: update.fields
          })
        });
        console.log(`✅ Updated ${update.nombre}: ${update.oldCode} → ${update.newCode}`);
      }
      
      console.log(`✅ Converted ${updates.length} codes to SM-XXX format`);
    } catch (error) {
      console.error('❌ Error converting codes:', error);
    }
  }

  // CLIENTES
  static async getClientes(): Promise<Cliente[]> {
    try {
      console.log('🔍 Fetching clientes from Airtable...');
      
      const clientesUrl = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Clientes`;
      const response = await fetch(clientesUrl, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Found ${data.records.length} clientes in Airtable`);
      return data.records.map(mapClienteFromAirtable);
    } catch (error) {
      console.error('❌ Error fetching clientes from Airtable:', error);
      throw error;
    }
  }

  static async getClienteById(id: string): Promise<Cliente | null> {
    try {
      console.log(`🔍 Fetching cliente by ID: ${id}`);
      
      const clientesUrl = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Clientes/${id}`;
      const response = await fetch(clientesUrl, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('❌ Cliente not found');
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Cliente found in Airtable');
      return mapClienteFromAirtable(data);
    } catch (error) {
      console.error('❌ Error fetching cliente by ID:', error);
      return null;
    }
  }

  static async createCliente(data: Omit<Cliente, 'id' | 'createdAt' | 'updatedAt'>): Promise<Cliente> {
    try {
      console.log('➕ Creating new cliente in Airtable...');
      
      const clientesUrl = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Clientes`;
      const response = await fetch(clientesUrl, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          fields: {
            'Nombre': data.nombre,
            'Email': data.email,
            'Telefono': data.telefono,
            'Direccion': data.direccion,
            'NIT': data.nit,
            'Estado': data.estado
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Cliente created successfully');
      return mapClienteFromAirtable(result);
    } catch (error) {
      console.error('❌ Error creating cliente:', error);
      throw error;
    }
  }

  // CATEGORIAS
  static async getCategorias(): Promise<Categoria[]> {
    try {
      console.log('🔍 Fetching categorias from Airtable...');
      
      const categoriasUrl = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Categorias`;
      const response = await fetch(categoriasUrl, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Found ${data.records.length} categorias in Airtable`);
      return data.records.map(mapCategoriaFromAirtable);
    } catch (error) {
      console.error('❌ Error fetching categorias from Airtable:', error);
      console.log('🔄 Falling back to mock categorias...');
      
      // Categorías mock de fallback
      return [
        {
          id: "1",
          nombre: "Vallas",
          descripcion: "Soportes publicitarios en vallas",
          icono: "🏗️",
          color: "#3B82F6"
        },
        {
          id: "2", 
          nombre: "Digital",
          descripcion: "Soportes publicitarios digitales",
          icono: "📱",
          color: "#10B981"
        },
        {
          id: "3",
          nombre: "Transporte",
          descripcion: "Soportes en transporte público",
          icono: "🚌",
          color: "#F59E0B"
        }
      ];
    }
  }

  // Función de test de conexión
  static async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing Airtable connection...');
      console.log('📡 API URL:', AIRTABLE_API_URL);
      console.log('🔑 API Key:', process.env.AIRTABLE_API_KEY ? 'Set' : 'Not set');
      console.log('🏠 Base ID:', process.env.AIRTABLE_BASE_ID ? 'Set' : 'Not set');
      
      const response = await fetch(AIRTABLE_API_URL, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        console.error('❌ Connection test failed:', response.status, response.statusText);
        return false;
      }

      const data = await response.json();
      console.log(`✅ Connection test successful! Found ${data.records.length} records`);
      
      // Mostrar los primeros 3 registros
      const firstThree = data.records.slice(0, 3);
      console.log('📋 First 3 records:');
      firstThree.forEach((record: any, index: number) => {
        console.log(`  ${index + 1}. ${record.fields.Nombre || 'Sin nombre'} (${record.fields.Estado || 'Sin estado'})`);
      });
      
      return true;
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }
  }
}