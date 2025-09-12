// prisma/migrate-to-supabase.ts
import 'dotenv/config'
import { PrismaClient, Prisma } from '@prisma/client'
import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'

async function main() {
  const pgUrl = process.env.DATABASE_URL
  if (!pgUrl) {
    console.error('DATABASE_URL no está definido en .env')
    process.exit(1)
  }

  // SQLite local (dev.db)
  // Localizar archivo SQLite existente (ERP o IO)
  const candidatePaths = [
    path.resolve(process.cwd(), 'prisma/dev.db'),
    path.resolve(process.cwd(), 'prisma/dev.db.backup'),
    path.resolve(process.cwd(), 'prisma/dev.db.backup.20250907_034624'),
    path.resolve(process.cwd(), '../stellarmotion.io/prisma/dev.db'),
    path.resolve(process.cwd(), '../stellarmotion.io/prisma/dev.db.backup'),
    path.resolve(process.cwd(), '../stellarmotion.io/prisma/dev.db.backup.20250907_034629'),
  ]
  const envSqlite = process.env.SQLITE_PATH
  const foundSqlite = envSqlite && fs.existsSync(envSqlite) ? envSqlite : candidatePaths.find(p => fs.existsSync(p))
  if (!foundSqlite) {
    console.error('No se encontró un archivo SQLite (dev.db). Verifica rutas en ERP o en IO.')
    process.exit(1)
  }
  console.log('Usando SQLite en:', foundSqlite)
  const sqliteDb = new Database(foundSqlite, { readonly: true })

  // Supabase (Postgres)
  const pg = new PrismaClient({
    datasources: { db: { url: pgUrl } },
  })

  let total = 0, ok = 0, fail = 0
  try {
    console.log('Leyendo soportes desde SQLite...')
    // Detectar nombre de tabla: Support o soportes
    const tables = sqliteDb
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all() as Array<{ name: string }>
    const tableNamesArr = tables.map((t) => t.name)
    const tableNames = new Set(tableNamesArr)
    console.log('Tablas en SQLite:', tableNamesArr.join(', '))
    const supportTable = tableNames.has('Support') ? 'Support' : (tableNames.has('soportes') ? 'soportes' : null)
    if (!supportTable) {
      console.error('No se encontró la tabla Support ni soportes en SQLite')
      process.exit(1)
    }
    const soportes: any[] = sqliteDb
      .prepare(`SELECT * FROM "${supportTable}"`)
      .all()
    total = soportes.length
    console.log(`Encontrados ${total} soportes en SQLite.`)

    for (const s of soportes) {
      try {
        const { id, createdAt, ...restForUpdate } = s
        const createData: Prisma.SupportUncheckedCreateInput = { ...s }

        await pg.support.upsert({
          where: { id },
          update: { ...restForUpdate },
          create: createData,
        })

        ok++
        console.log(`Migrado soporte ${s.code || s.id}`)
      } catch (e: any) {
        fail++
        console.error(`Error migrando soporte ${s.code || s.id}:`, e?.message || e)
      }
    }
  } catch (e: any) {
    console.error('Fallo general:', e?.message || e)
  } finally {
    console.log(`Finalizado. Total: ${total}, OK: ${ok}, Fallidos: ${fail}`)
    try { sqliteDb.close() } catch {}
    await Promise.allSettled([pg.$disconnect()])
  }
}

main().catch((e) => {
  console.error('Error no capturado:', e)
  process.exit(1)
})