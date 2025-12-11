import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUserByEmail, signSession, updateUserLastAccess } from "@/lib/auth";
import { setSessionCookie } from "@/lib/auth/cookies";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  try {
    const { email, password, rememberMe } = await req.json();
    console.log('🔐 [Login ERP] Intento de login para:', email, "rememberMe:", rememberMe);
    
    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son obligatorios" }, { status: 400 });
    }

    const user = await findUserByEmail(email);
    console.log('👤 [Login ERP] Usuario encontrado:', user ? 'Sí' : 'No');
    console.log('🔑 [Login ERP] Tiene password hash:', user?.fields?.PasswordHash ? 'Sí' : 'No');
    
    if (!user?.fields?.PasswordHash) {
      console.log('❌ [Login ERP] Credenciales inválidas: usuario no encontrado o sin password');
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.fields.PasswordHash);
    console.log('🔐 [Login ERP] Comparación de contraseña:', ok ? 'Correcta' : 'Incorrecta');
    if (!ok) {
      console.log('❌ [Login ERP] Credenciales inválidas: contraseña incorrecta');
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    // Actualizar último acceso
    try {
      await updateUserLastAccess(user.id);
    } catch (error) {
      console.error("Error updating last access:", error);
    }

    // Obtener el nombre del rol desde la tabla roles usando rol_id
    let roleName = user.fields.Rol || "client";
    if (user.fields.RolId) {
      try {
        const { data: roleData } = await supabaseAdmin
          .from('roles')
          .select('nombre')
          .eq('id', user.fields.RolId)
          .single();
        
        if (roleData?.nombre) {
          roleName = roleData.nombre;
        }
      } catch (error) {
        console.error("Error obteniendo nombre del rol:", error);
      }
    }

    // El desarrollador siempre tiene acceso de admin
    const isDeveloper = user.fields.Email?.toLowerCase() === "alen95ae@gmail.com";
    if (isDeveloper) {
      roleName = "admin";
    }

    const token = await signSession({ id: user.id, email: user.fields.Email, role: roleName, name: user.fields.Nombre });
    
    const role = roleName;
    
    // Determinar redirect según rol
    let redirect = "/panel/inicio";
    if (role === "admin") {
      redirect = "/panel/inicio";
    } else if (role === "owner") {
      redirect = "/panel/inicio";
    } else if (role === "client") {
      redirect = "/panel/inicio";
    }

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.fields.Email, name: user.fields.Nombre, role: role },
      redirect
    });
    
    setSessionCookie(response, token);
    
    // Verificar que la cookie se estableció correctamente
    const setCookieHeader = response.headers.get('Set-Cookie');
    if (setCookieHeader) {
      console.log('✅ [Login ERP] Cookie establecida en respuesta:', setCookieHeader.substring(0, 80) + '...');
    } else {
      console.error('❌ [Login ERP] ERROR: Cookie NO se estableció en la respuesta');
    }
    
    return response;
  } catch (e: any) {
    console.error("login error:", e);
    return NextResponse.json({ error: "Error en login" }, { status: 500 });
  }
}

