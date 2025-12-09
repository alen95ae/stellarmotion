-- Función SQL para agregar imágenes al array JSONB imagenes en la tabla soportes
-- Esta función debe ejecutarse en Supabase SQL Editor

-- Función para agregar una imagen al array JSONB
CREATE OR REPLACE FUNCTION append_image_json(soporte_id uuid, image_path text)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  current_images jsonb;
BEGIN
  -- Obtener el array actual de imágenes
  SELECT imagenes INTO current_images 
  FROM soportes 
  WHERE id = soporte_id;
  
  -- Si no existe, inicializar como array vacío
  current_images := COALESCE(current_images, '[]'::jsonb);
  
  -- Agregar el nuevo path al array (solo si no existe ya)
  IF NOT (current_images @> to_jsonb(image_path)) THEN
    current_images := current_images || to_jsonb(image_path);
  END IF;
  
  -- Actualizar el campo imagenes en la tabla
  UPDATE soportes 
  SET imagenes = current_images,
      updated_at = NOW()
  WHERE id = soporte_id;
  
  -- Retornar el array actualizado
  RETURN current_images;
END;
$$;

-- Función para eliminar una imagen del array JSONB
CREATE OR REPLACE FUNCTION remove_image_json(soporte_id uuid, image_path text)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  current_images jsonb;
  updated_images jsonb;
BEGIN
  -- Obtener el array actual de imágenes
  SELECT imagenes INTO current_images 
  FROM soportes 
  WHERE id = soporte_id;
  
  -- Si no existe, retornar array vacío
  IF current_images IS NULL THEN
    RETURN '[]'::jsonb;
  END IF;
  
  -- Filtrar el path del array
  SELECT jsonb_agg(elem)
  INTO updated_images
  FROM jsonb_array_elements(current_images) elem
  WHERE elem::text != to_jsonb(image_path)::text;
  
  -- Si el resultado es NULL (array vacío), usar array vacío
  updated_images := COALESCE(updated_images, '[]'::jsonb);
  
  -- Actualizar el campo imagenes en la tabla
  UPDATE soportes 
  SET imagenes = updated_images,
      updated_at = NOW()
  WHERE id = soporte_id;
  
  -- Retornar el array actualizado
  RETURN updated_images;
END;
$$;

-- Nota: Estas funciones son opcionales ya que el endpoint /api/soportes/upload
-- maneja la actualización del array directamente en el código.
-- Sin embargo, pueden ser útiles para operaciones más complejas o triggers.

