import { NextResponse } from "next/server";
import { createUserWithRole, findUserByEmail, signSession } from "@/lib/auth";
import { setSessionCookie } from "@/lib/auth/cookies";

export async function POST(req: Request) {
  try {
    const { email, password, nombre, role } = await req.json();
    if (!email || !password || !nombre) {
      return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 409 });
    }

    const assignedRole = role || "client";

    // Crear usuario con el rol asignado
    const user = await createUserWithRole(email, password, nombre, assignedRole);
    console.log("User created:", user);

    const token = await signSession({ 
      id: user.id, 
      email: user.fields.Email, 
      role: assignedRole, 
      name: user.fields.Nombre 
    });

    // Redirección por rol
    let redirect = "/panel/inicio";
    if (assignedRole === "admin") {
      redirect = "/panel/inicio";
    } else if (assignedRole === "owner") {
      redirect = "/panel/inicio";
    } else if (assignedRole === "client") {
      redirect = "/panel/inicio";
    }

    const response = NextResponse.json({ 
      success: true, 
      user: { 
        id: user.id, 
        email: user.fields.Email, 
        name: user.fields.Nombre, 
        role: assignedRole 
      }, 
      redirect 
    });

    setSessionCookie(response, token);
    return response;
  } catch (e: any) {
    console.error("register error:", e);
    return NextResponse.json({ error: "Error en registro" }, { status: 500 });
  }
}

