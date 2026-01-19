#!/bin/bash
cd /Users/alen_ae/Documents/Proyectos/Programacion/stellarmotion

# Eliminar archivos/carpetas del índice de git
git rm -r --cached "Copia de publicidadvialimagen.erp" 2>/dev/null || true
git rm --cached "requirements.txt" 2>/dev/null || true
git rm --cached "migrate_supabase_to_mongodb.py" 2>/dev/null || true
git rm --cached ".cursor/debug.log" 2>/dev/null || true

# Añadir .gitignore actualizado
git add .gitignore

# Mostrar estado
echo "=== Estado de git ==="
git status --short

# Hacer commit
git commit -m "chore: Eliminar archivos temporales y proyecto legacy del repositorio

- Eliminado 'Copia de publicidadvialimagen.erp' (proyecto legacy)
- Eliminado 'requirements.txt' (archivo temporal)
- Eliminado 'migrate_supabase_to_mongodb.py' (script temporal)
- Eliminado '.cursor/debug.log' (log de debug)
- Añadidos al .gitignore para evitar que se vuelvan a subir"

# Push
git push origin main

echo "=== Completado ==="
