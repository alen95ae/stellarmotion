import { NextResponse } from "next/server"
import { AirtableService } from "@/lib/airtable"

export async function GET() {
  try {
    console.log('🧪 Testing Airtable connection...');
    
    const isConnected = await AirtableService.testConnection();
    
    if (isConnected) {
      // Obtener algunos soportes para mostrar
      const soportes = await AirtableService.getSoportes();
      
      return NextResponse.json({
        success: true,
        message: 'Conexión exitosa con Airtable',
        connection: true,
        recordsCount: soportes.length,
        sampleRecords: soportes.slice(0, 3).map(s => ({
          id: s.id,
          nombre: s.nombre,
          estado: s.estado,
          precio: s.precio
        }))
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Error de conexión con Airtable',
        connection: false,
        error: 'No se pudo conectar con Airtable'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('❌ Error testing Airtable connection:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      connection: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
