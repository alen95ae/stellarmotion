#!/usr/bin/env node

/**
 * Script para probar la funcionalidad de carga de imágenes
 * Uso: node scripts/test-upload.js
 */

const fs = require('fs');
const path = require('path');

// Crear una imagen de prueba simple (1x1 pixel PNG)
const createTestImage = () => {
  // PNG de 1x1 pixel transparente
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, // bit depth, color type, etc.
    0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, // IDAT chunk
    0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, // compressed data
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, // checksum
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, // IEND chunk
    0x42, 0x60, 0x82
  ]);
  
  return pngData;
};

const testUpload = async () => {
  try {
    console.log('🧪 Iniciando prueba de carga de imágenes...');
    
    // Verificar variables de entorno
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceKey) {
      console.error('❌ Variables de entorno faltantes:');
      console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
      console.error('   SUPABASE_SERVICE_ROLE_KEY:', serviceKey ? '✅' : '❌');
      console.error('\n💡 Asegúrate de configurar estas variables en tu archivo .env.local');
      process.exit(1);
    }
    
    console.log('✅ Variables de entorno configuradas correctamente');
    
    // Crear imagen de prueba
    const testImage = createTestImage();
    const testFileName = `test-${Date.now()}.png`;
    
    // Crear FormData
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', testImage, {
      filename: testFileName,
      contentType: 'image/png'
    });
    
    console.log('📤 Enviando imagen de prueba...');
    
    // Hacer la petición al endpoint
    const fetch = require('node-fetch');
    const response = await fetch('http://localhost:3000/api/uploads', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Carga exitosa!');
      console.log('📎 URL de la imagen:', result.url);
      console.log('\n🎉 La funcionalidad de carga de imágenes está funcionando correctamente!');
    } else {
      console.error('❌ Error en la carga:');
      console.error('   Status:', response.status);
      console.error('   Error:', result.error);
      
      if (result.error.includes('Configuración de Supabase faltante')) {
        console.error('\n💡 Verifica que las variables de entorno estén configuradas correctamente');
      } else if (result.error.includes('bucket')) {
        console.error('\n💡 Verifica que el bucket "soportes" exista en Supabase Storage');
      }
    }
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Asegúrate de que el servidor de desarrollo esté ejecutándose (npm run dev)');
    }
  }
};

// Ejecutar la prueba
testUpload();
