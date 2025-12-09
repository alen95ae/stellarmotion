import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

function withCors(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
  return response
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }))
}

export async function POST(req: Request) {
  try {
    // LOG TEMPORAL: Verificar que estamos usando service role
    console.log("🔐 Using service role:", process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 8));
    
    const { ids, action, data } = await req.json() as {
      ids: string[], action: 'delete'|'update', data?: any
    }
    
    if (!Array.isArray(ids) || !ids.length) {
      return withCors(NextResponse.json({ error: 'Sin IDs' }, { status: 400 }))
    }

    if (action === 'delete') {
      const { error } = await supabaseServer
        .from('soportes')
        .delete()
        .in('id', ids)
      
      if (error) {
        console.error('Error deleting soportes:', error)
        return withCors(NextResponse.json({ error: error.message }, { status: 500 }))
      }
      
      return withCors(NextResponse.json({ ok: true, count: ids.length }))
    }

    if (action === 'update') {
      // Cambio de código para un único ítem
      if (data?.__codeSingle) {
        if (ids.length !== 1) {
          return withCors(NextResponse.json({ error: 'Código: seleccione solo 1 elemento' }, { status: 400 }))
        }
        try {
          const { error } = await supabaseServer
            .from('soportes')
            .update({ codigo_interno: String(data.__codeSingle).trim() })
            .eq('id', ids[0])
          
          if (error) {
            return withCors(NextResponse.json({ error: 'Código duplicado o inválido' }, { status: 409 }))
          }
          
          return withCors(NextResponse.json({ ok: true, count: 1 }))
        } catch (e) {
          return withCors(NextResponse.json({ error: 'Código duplicado o inválido' }, { status: 409 }))
        }
      }

      // Mapear campos permitidos a estructura Supabase
      const allowed = ['status','owner','type','title','priceMonth','widthM','heightM','city','country','dailyImpressions','featured']
      const patch: Record<string, any> = {}
      
      for (const k of allowed) {
        if (k in (data || {})) {
          // Mapear campos a estructura Supabase
          if (k === 'status') {
            // Mapear estado a formato ENUM de Supabase
            const estadoMap: Record<string, string> = {
              'DISPONIBLE': 'Disponible',
              'RESERVADO': 'Reservado',
              'OCUPADO': 'Ocupado',
              'MANTENIMIENTO': 'Mantenimiento',
              'disponible': 'Disponible',
              'reservado': 'Reservado',
              'ocupado': 'Ocupado',
              'mantenimiento': 'Mantenimiento'
            }
            patch.estado = estadoMap[data[k]] || data[k]
          } else if (k === 'type') {
            patch.tipo_soporte = data[k]
          } else if (k === 'title') {
            patch.titulo = data[k]
          } else if (k === 'priceMonth') {
            patch.precio_mes = data[k]
          } else if (k === 'widthM') {
            patch.ancho = data[k]
          } else if (k === 'heightM') {
            patch.alto = data[k]
          } else if (k === 'dailyImpressions') {
            patch.impactos_diarios = data[k]
          } else if (k === 'featured') {
            patch.destacado = data[k]
          } else {
            // city, country, owner se mapean directamente
            patch[k] = data[k]
          }
        }
      }
      
      // Actualizar superficie si cambian dimensiones
      if (patch.ancho !== undefined || patch.alto !== undefined) {
        const { data: existing } = await supabaseServer
          .from('soportes')
          .select('ancho, alto')
          .in('id', ids)
          .limit(1)
          .single()
        
        const ancho = patch.ancho ?? existing?.ancho ?? 0
        const alto = patch.alto ?? existing?.alto ?? 0
        patch.superficie = ancho * alto
      }
      
      // Actualizar updated_at
      patch.updated_at = new Date().toISOString()
      
      const { data: result, error } = await supabaseServer
        .from('soportes')
        .update(patch)
        .in('id', ids)
        .select('id')
      
      if (error) {
        console.error('Error updating soportes:', error)
        return withCors(NextResponse.json({ error: error.message }, { status: 500 }))
      }
      
      return withCors(NextResponse.json({ ok: true, count: result?.length || 0 }))
    }

    return withCors(NextResponse.json({ error: 'Acción no válida' }, { status: 400 }))
  } catch (error) {
    console.error("Error in bulk action:", error)
    return withCors(NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    ))
  }
}
