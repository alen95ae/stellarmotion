import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"
import { SupabaseService } from "@/lib/supabase-service"

// Forzar runtime Node.js (no edge) para asegurar carga correcta de variables de entorno
export const runtime = "nodejs"

function withCors(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
  return response
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }))
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const soporteId = formData.get("soporteId") as string | null

    if (!file || !soporteId) {
      return withCors(NextResponse.json(
        { error: "Missing file or soporteId" },
        { status: 400 }
      ))
    }

    // Validar que el soporte existe
    const soporteExists = await SupabaseService.getSoporteById(soporteId)
    if (!soporteExists) {
      return withCors(NextResponse.json(
        { error: "Soporte no encontrado" },
        { status: 404 }
      ))
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const fileName = `${timestamp}_${Math.random().toString(36).substring(7)}.${fileExtension}`
    const filePath = `soportes_imagenes/${soporteId}/${fileName}`

    console.log(`📤 Subiendo imagen: ${filePath} (${file.size} bytes)`)

    // Convertir File a ArrayBuffer para Supabase
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Subir archivo a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseServer.storage
      .from("soportes")
      .upload(filePath, uint8Array, {
        contentType: file.type,
        upsert: false // No sobrescribir si existe
      })

    if (uploadError) {
      console.error('❌ Error subiendo archivo:', uploadError)
      return withCors(NextResponse.json(
        { error: uploadError.message, details: uploadError },
        { status: 500 }
      ))
    }

    console.log('✅ Archivo subido exitosamente:', uploadData.path)

    // Obtener las imágenes actuales del soporte usando el patrón seguro
    const { data: soporte, error: fetchError } = await supabaseServer
      .from('soportes')
      .select('imagenes')
      .eq('id', soporteId)
      .single()

    if (fetchError) {
      console.error('❌ Error obteniendo soporte:', fetchError)
      return withCors(NextResponse.json(
        { error: "db_update_failed" },
        { status: 500 }
      ))
    }

    // Convertir null a array vacío y asegurar que sea un array
    const current = Array.isArray(soporte?.imagenes) ? soporte.imagenes : []
    
    // Agregar el nuevo path (evitar duplicados)
    const updated = current.includes(filePath) ? current : [...current, filePath]

    console.log('🔍 [upload] current:', JSON.stringify(current))
    console.log('🔍 [upload] updated:', JSON.stringify(updated))

    // Actualizar el campo imagenes en la base de datos
    console.log('🔍 [upload] Intentando actualizar con:', JSON.stringify({ imagenes: updated }))
    console.log('🔍 [upload] updated type:', typeof updated, 'isArray:', Array.isArray(updated))
    
    // Intentar actualizar directamente con el array
    let updateResult: any = null
    let updateError: any = null
    
    const updateResponse = await supabaseServer
      .from('soportes')
      .update({ imagenes: updated })
      .eq('id', soporteId)
      .select('imagenes')
    
    updateResult = updateResponse.data
    updateError = updateResponse.error
    
    // Si falla, intentar con función RPC si está disponible
    if (updateError) {
      console.warn('⚠️ [upload] Update directo falló, intentando con RPC...')
      console.warn('⚠️ [upload] Error original:', updateError.message, updateError.code)
      
      try {
        // Intentar usar función RPC append_image_json si existe
        const rpcResponse = await supabaseServer.rpc('append_image_json', {
          soporte_id: soporteId,
          image_path: filePath
        })
        
        if (rpcResponse.error) {
          console.error('❌ RPC también falló:', rpcResponse.error)
          // Continuar con el error original
        } else {
          console.log('✅ RPC exitoso')
          updateError = null
          updateResult = [{ imagenes: rpcResponse.data }]
        }
      } catch (rpcError) {
        console.warn('⚠️ RPC no disponible o falló:', rpcError)
        // Continuar con el error original del update
      }
    }

    if (updateError) {
      console.error('❌ Error actualizando imagenes en DB:', updateError)
      console.error('❌ Error code:', updateError.code)
      console.error('❌ Error message:', updateError.message)
      console.error('❌ Error details:', updateError.details)
      console.error('❌ Error hint:', updateError.hint)
      console.error('❌ updated array:', JSON.stringify(updated))
      console.error('❌ soporteId:', soporteId)
      return withCors(NextResponse.json(
        { 
          error: "db_update_failed",
          dbError: updateError.message,
          dbErrorCode: updateError.code,
          dbErrorDetails: updateError.details,
          dbErrorHint: updateError.hint
        },
        { status: 500 }
      ))
    }
    
    console.log('✅ [upload] Update result:', JSON.stringify(updateResult))
    
    console.log('✅ Campo imagenes actualizado correctamente')

    console.log('✅ Imagen agregada al soporte exitosamente')

    // Obtener URL pública de la imagen
    const { data: urlData } = supabaseServer.storage
      .from('soportes')
      .getPublicUrl(filePath)

    return withCors(NextResponse.json({
      success: true,
      path: filePath,
      publicUrl: urlData.publicUrl,
      message: "Imagen subida exitosamente"
    }))

  } catch (error: any) {
    console.error('❌ Error en upload:', error)
    return withCors(NextResponse.json(
      { error: "db_update_failed" },
      { status: 500 }
    ))
  }
}

// Endpoint para eliminar una imagen
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const soporteId = searchParams.get("soporteId")
    const imagePath = searchParams.get("path")

    if (!soporteId || !imagePath) {
      return withCors(NextResponse.json(
        { error: "Missing soporteId or path" },
        { status: 400 }
      ))
    }

    console.log(`🗑️ Eliminando imagen: ${imagePath}`)

    // Eliminar archivo de Storage
    const { error: deleteError } = await supabaseServer.storage
      .from("soportes")
      .remove([imagePath])

    if (deleteError) {
      console.error('❌ Error eliminando archivo:', deleteError)
      return withCors(NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      ))
    }

    // Obtener imágenes actuales usando el patrón seguro
    const { data: soporte, error: fetchError } = await supabaseServer
      .from('soportes')
      .select('imagenes')
      .eq('id', soporteId)
      .single()

    if (fetchError) {
      console.error('❌ Error obteniendo soporte:', fetchError)
      return withCors(NextResponse.json(
        { error: "db_update_failed" },
        { status: 500 }
      ))
    }

    // Convertir null a array vacío y asegurar que sea un array
    const current = Array.isArray(soporte?.imagenes) ? soporte.imagenes : []
    
    // Filtrar el path del array
    const updated = current.filter((img: string) => img !== imagePath)

    console.log('🔍 [delete] current:', JSON.stringify(current))
    console.log('🔍 [delete] updated:', JSON.stringify(updated))

    // Actualizar el campo imagenes
    const { error: updateError } = await supabaseServer
      .from('soportes')
      .update({ imagenes: updated })
      .eq('id', soporteId)

    if (updateError) {
      console.error('❌ Error actualizando DB:', updateError)
      return withCors(NextResponse.json(
        { error: "db_update_failed" },
        { status: 500 }
      ))
    }

    return withCors(NextResponse.json({
      success: true,
      message: "Imagen eliminada exitosamente"
    }))

  } catch (error: any) {
    console.error('❌ Error eliminando imagen:', error)
    return withCors(NextResponse.json(
      { error: "db_update_failed" },
      { status: 500 }
    ))
  }
}

