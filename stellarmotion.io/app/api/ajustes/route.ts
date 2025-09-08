import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get('key');

    if (key) {
      // Obtener una configuración específica
      const setting = await prisma.setting.findUnique({
        where: { key }
      });

      if (!setting) {
        return NextResponse.json(
          { error: 'Configuración no encontrada' },
          { status: 404 }
        );
      }

      return NextResponse.json(setting);
    }

    // Obtener todas las configuraciones
    const settings = await prisma.setting.findMany({
      orderBy: {
        key: 'asc'
      }
    });

    // Convertir a objeto para facilitar el uso
    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json(settingsObject);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Error al obtener la configuración' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const settings = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Datos de configuración inválidos' },
        { status: 400 }
      );
    }

    // Actualizar o crear configuraciones
    const updatedSettings = [];

    for (const [key, value] of Object.entries(settings)) {
      if (typeof value !== 'string') {
        continue; // Saltar valores que no sean string
      }

      const setting = await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      });

      updatedSettings.push(setting);
    }

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la configuración' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Clave y valor son requeridos' },
        { status: 400 }
      );
    }

    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) }
    });

    return NextResponse.json(setting);
  } catch (error) {
    console.error('Error updating setting:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la configuración' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: 'Clave requerida' },
        { status: 400 }
      );
    }

    // Verificar que la configuración existe
    const existingSetting = await prisma.setting.findUnique({
      where: { key }
    });

    if (!existingSetting) {
      return NextResponse.json(
        { error: 'Configuración no encontrada' },
        { status: 404 }
      );
    }

    await prisma.setting.delete({
      where: { key }
    });

    return NextResponse.json({ message: 'Configuración eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting setting:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la configuración' },
      { status: 500 }
    );
  }
}
