import { NextResponse } from 'next/server'
import { AirtableService } from '@/lib/airtable'

function withCors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

export async function OPTIONS() {
  return withCors(new NextResponse())
}

export async function POST() {
  try {
    console.log('🔄 Generating test codes...')
    
    await AirtableService.generateTestCodes()
    
    return withCors(NextResponse.json({
      success: true,
      message: 'Códigos de prueba generados correctamente'
    }))
  } catch (error) {
    console.error('❌ Error generating test codes:', error)
    return withCors(NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    ))
  }
}
