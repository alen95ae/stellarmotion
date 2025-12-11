import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    config: {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
      serviceRoleKeyPreview: process.env.SUPABASE_SERVICE_ROLE_KEY 
        ? `${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(process.env.SUPABASE_SERVICE_ROLE_KEY.length - 10)}`
        : 'NOT SET',
      anonKeyPreview: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length - 10)}`
        : 'NOT SET',
    },
    tests: [] as any[],
  };

  // Test 1: Verificar key decodificada
  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const [, payload] = process.env.SUPABASE_SERVICE_ROLE_KEY.split('.');
      const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
      diagnostics.keyInfo = {
        role: decoded.role,
        iss: decoded.iss,
        aud: decoded.aud,
      };
      diagnostics.tests.push({
        name: 'Key Decode',
        status: decoded.role === 'service_role' ? 'PASS' : 'FAIL',
        message: decoded.role === 'service_role' 
          ? 'Key es service_role correctamente' 
          : `Key es ${decoded.role}, se esperaba service_role`,
      });
    }
  } catch (e: any) {
    diagnostics.tests.push({
      name: 'Key Decode',
      status: 'ERROR',
      message: e.message,
    });
  }

  // Test 2: SELECT de usuarios
  try {
    const { data, error, count } = await supabaseAdmin
      .from('usuarios')
      .select('id, email, nombre', { count: 'exact' })
      .limit(5);

    diagnostics.tests.push({
      name: 'SELECT usuarios',
      status: error ? 'FAIL' : 'PASS',
      message: error 
        ? `Error: ${error.message} (code: ${error.code})` 
        : `Success: ${count || data?.length || 0} usuarios encontrados`,
      error: error ? {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      } : null,
      dataCount: data?.length || 0,
    });
  } catch (e: any) {
    diagnostics.tests.push({
      name: 'SELECT usuarios',
      status: 'ERROR',
      message: e.message,
    });
  }

  // Test 3: SELECT de roles
  try {
    const { data, error, count } = await supabaseAdmin
      .from('roles')
      .select('id, nombre', { count: 'exact' })
      .limit(5);

    diagnostics.tests.push({
      name: 'SELECT roles',
      status: error ? 'FAIL' : 'PASS',
      message: error 
        ? `Error: ${error.message} (code: ${error.code})` 
        : `Success: ${count || data?.length || 0} roles encontrados`,
      error: error ? {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      } : null,
      dataCount: data?.length || 0,
    });
  } catch (e: any) {
    diagnostics.tests.push({
      name: 'SELECT roles',
      status: 'ERROR',
      message: e.message,
    });
  }

  // Test 4: INSERT dummy en usuarios (rollback después)
  try {
    const testEmail = `test_diagnostic_${Date.now()}@test.com`;
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('usuarios')
      .insert({
        email: testEmail,
        nombre: 'Test Diagnostic',
        activo: false,
        fecha_creacion: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (insertError) {
      diagnostics.tests.push({
        name: 'INSERT usuarios',
        status: 'FAIL',
        message: `Error: ${insertError.message} (code: ${insertError.code})`,
        error: {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint,
        },
      });
    } else {
      // Eliminar el registro de prueba
      if (insertData?.id) {
        await supabaseAdmin
          .from('usuarios')
          .delete()
          .eq('id', insertData.id);
      }

      diagnostics.tests.push({
        name: 'INSERT usuarios',
        status: 'PASS',
        message: 'Success: Insert y delete funcionaron correctamente',
        insertedId: insertData?.id,
      });
    }
  } catch (e: any) {
    diagnostics.tests.push({
      name: 'INSERT usuarios',
      status: 'ERROR',
      message: e.message,
    });
  }

  // Test 5: INSERT dummy en roles (rollback después)
  try {
    const testRoleName = `test_role_${Date.now()}`;
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('roles')
      .insert({
        nombre: testRoleName,
        descripcion: 'Test diagnostic role',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (insertError) {
      diagnostics.tests.push({
        name: 'INSERT roles',
        status: 'FAIL',
        message: `Error: ${insertError.message} (code: ${insertError.code})`,
        error: {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint,
        },
      });
    } else {
      // Eliminar el registro de prueba
      if (insertData?.id) {
        await supabaseAdmin
          .from('roles')
          .delete()
          .eq('id', insertData.id);
      }

      diagnostics.tests.push({
        name: 'INSERT roles',
        status: 'PASS',
        message: 'Success: Insert y delete funcionaron correctamente',
        insertedId: insertData?.id,
      });
    }
  } catch (e: any) {
    diagnostics.tests.push({
      name: 'INSERT roles',
      status: 'ERROR',
      message: e.message,
    });
  }

  // Resumen
  const passed = diagnostics.tests.filter((t: any) => t.status === 'PASS').length;
  const failed = diagnostics.tests.filter((t: any) => t.status === 'FAIL').length;
  const errors = diagnostics.tests.filter((t: any) => t.status === 'ERROR').length;

  diagnostics.summary = {
    total: diagnostics.tests.length,
    passed,
    failed,
    errors,
    allPassed: failed === 0 && errors === 0,
  };

  return NextResponse.json(diagnostics, { 
    status: diagnostics.summary.allPassed ? 200 : 500 
  });
}
