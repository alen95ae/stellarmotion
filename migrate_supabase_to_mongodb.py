#!/usr/bin/env python3
"""
Script para migrar datos de Supabase a MongoDB
Lee las variables de entorno del sistema sin modificar .env.local
"""

import requests
import os
from pymongo import MongoClient
from typing import List, Dict, Any
import time

# ============================================================================
# CONFIGURACIÓN - Lee variables de entorno del sistema
# ============================================================================
# Primero intenta leer de variables de entorno
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

# Si no están en el sistema, usa los valores del .env.local del proyecto
if not SUPABASE_URL:
    SUPABASE_URL = 'https://bqinfrlxstixpalzomqs.supabase.co'

if not SUPABASE_KEY:
    SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxaW5mcmx4c3RpeHBhbHpvbXFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0MzY1NCwiZXhwIjoyMDczMDE5NjU0fQ.4Tq7j9P3EXGO-_EYb53spsgpxsFchdKrDWClmrqqXiA'

# Configuración de MongoDB
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
MONGODB_DB = os.getenv('MONGODB_DB', 'stellarmotion_db')

# ============================================================================
# VALIDACIÓN DE CONFIGURACIÓN
# ============================================================================
if SUPABASE_URL == 'TU_SUPABASE_URL_AQUI' or SUPABASE_KEY == 'TU_SERVICE_ROLE_KEY_AQUI':
    print("❌ ERROR: Debes configurar SUPABASE_URL y SUPABASE_KEY")
    print("\nOpciones:")
    print("1. Configurar variables de entorno:")
    print("   export NEXT_PUBLIC_SUPABASE_URL='tu_url'")
    print("   export SUPABASE_SERVICE_ROLE_KEY='tu_key'")
    print("\n2. O editar este script y configurar las variables directamente")
    exit(1)

# ============================================================================
# CONFIGURACIÓN DE CLIENTES
# ============================================================================
# Cliente MongoDB
client = MongoClient(MONGODB_URI)
db = client[MONGODB_DB]

# Headers para Supabase REST API
headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

# ============================================================================
# FUNCIONES DE MIGRACIÓN
# ============================================================================

def migrar_tabla(table_name: str, collection_name: str = None, limit: int = 1000, filtros: Dict = None):
    """
    Migra una tabla completa de Supabase a MongoDB con paginación
    
    Args:
        table_name: Nombre de la tabla en Supabase
        collection_name: Nombre de la colección en MongoDB (default: mismo que table_name)
        limit: Número de registros por página
        filtros: Diccionario con filtros adicionales para la query
    """
    if collection_name is None:
        collection_name = table_name
    
    collection = db[collection_name]
    url = f'{SUPABASE_URL}/rest/v1/{table_name}'
    offset = 0
    total_migrados = 0
    
    print(f'\n🔄 Iniciando migración de tabla "{table_name}" -> colección "{collection_name}"...')
    
    while True:
        # Parámetros de paginación
        params = {
            'select': '*',
            'limit': limit,
            'offset': offset
        }
        
        # Agregar filtros si existen
        if filtros:
            params.update(filtros)
        
        try:
            response = requests.get(url, headers=headers, params=params, timeout=30)
            
            if response.status_code == 200:
                datos = response.json()
                
                if not datos or len(datos) == 0:
                    print(f'✅ No hay más datos para migrar')
                    break
                
                # Insertar en MongoDB
                try:
                    result = collection.insert_many(datos)
                    total_migrados += len(result.inserted_ids)
                    print(f'  ✅ Migrados {len(result.inserted_ids)} registros (Total: {total_migrados})')
                    
                    # Si obtuvimos menos registros que el límite, terminamos
                    if len(datos) < limit:
                        break
                    
                    offset += limit
                    time.sleep(0.1)  # Pequeña pausa para no sobrecargar
                    
                except Exception as e:
                    print(f'  ❌ Error insertando en MongoDB: {e}')
                    # Intentar insertar uno por uno para identificar el problema
                    for doc in datos:
                        try:
                            collection.insert_one(doc)
                            total_migrados += 1
                        except Exception as e2:
                            print(f'  ⚠️ Error con documento específico: {e2}')
                    break
                    
            elif response.status_code == 404:
                print(f'  ❌ Tabla "{table_name}" no encontrada en Supabase')
                break
            elif response.status_code == 401:
                print(f'  ❌ Error de autenticación. Verifica SUPABASE_KEY')
                print(f'  Respuesta: {response.text}')
                break
            else:
                print(f'  ❌ Error al obtener datos: {response.status_code}')
                print(f'  Respuesta: {response.text}')
                break
                
        except requests.exceptions.RequestException as e:
            print(f'  ❌ Error de conexión: {e}')
            break
    
    print(f'  🎉 Migración de "{table_name}" completada: {total_migrados} registros migrados\n')
    return total_migrados

def verificar_conexion_supabase():
    """Verifica que la conexión a Supabase funcione"""
    print('🔍 Verificando conexión a Supabase...')
    try:
        # Intentar obtener información de la tabla soportes (o cualquier tabla)
        url = f'{SUPABASE_URL}/rest/v1/soportes'
        params = {'select': 'id', 'limit': 1}
        response = requests.get(url, headers=headers, params=params, timeout=10)
        
        if response.status_code in [200, 206]:  # 206 es Partial Content (normal en Supabase)
            print('✅ Conexión a Supabase exitosa')
            return True
        elif response.status_code == 404:
            print('⚠️ Tabla "soportes" no encontrada, pero la conexión funciona')
            return True
        else:
            print(f'❌ Error de conexión: {response.status_code}')
            print(f'Respuesta: {response.text}')
            return False
    except Exception as e:
        print(f'❌ Error verificando conexión: {e}')
        return False

def verificar_conexion_mongodb():
    """Verifica que la conexión a MongoDB funcione"""
    print('🔍 Verificando conexión a MongoDB...')
    try:
        client.admin.command('ping')
        print(f'✅ Conexión a MongoDB exitosa (Base de datos: {MONGODB_DB})')
        return True
    except Exception as e:
        print(f'❌ Error de conexión a MongoDB: {e}')
        return False

# ============================================================================
# FUNCIÓN PRINCIPAL
# ============================================================================

def main():
    print('=' * 60)
    print('🚀 MIGRACIÓN DE SUPABASE A MONGODB')
    print('=' * 60)
    print(f'📡 Supabase URL: {SUPABASE_URL[:50]}...' if len(SUPABASE_URL) > 50 else f'📡 Supabase URL: {SUPABASE_URL}')
    print(f'💾 MongoDB URI: {MONGODB_URI}')
    print(f'📦 MongoDB DB: {MONGODB_DB}')
    print('=' * 60)
    
    # Verificar conexiones
    if not verificar_conexion_supabase():
        print('\n❌ No se pudo conectar a Supabase. Verifica la configuración.')
        client.close()
        return
    
    if not verificar_conexion_mongodb():
        print('\n❌ No se pudo conectar a MongoDB. Verifica que MongoDB esté corriendo.')
        client.close()
        return
    
    print()
    
    # Tablas a migrar (puedes comentar las que no quieras migrar)
    tablas_a_migrar = [
        ('soportes', 'soportes'),      # Tabla soportes -> colección soportes
        ('categorias', 'categorias'),  # Tabla categorias -> colección categorias
        ('usuarios', 'usuarios'),      # Tabla usuarios -> colección usuarios
        # ('crm_accounts', 'crm_accounts'),
        # ('crm_contacts', 'crm_contacts'),
        # ('crm_leads', 'crm_leads'),
        # ('crm_opportunities', 'crm_opportunities'),
    ]
    
    total_general = 0
    for table_name, collection_name in tablas_a_migrar:
        try:
            total = migrar_tabla(table_name, collection_name)
            total_general += total
        except Exception as e:
            print(f'❌ Error migrando {table_name}: {e}')
            continue
    
    # Cerrar conexión
    client.close()
    
    print('=' * 60)
    print(f'🎉 MIGRACIÓN COMPLETADA')
    print(f'📊 Total de registros migrados: {total_general}')
    print('=' * 60)

if __name__ == '__main__':
    main()

