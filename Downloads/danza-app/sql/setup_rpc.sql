CREATE OR REPLACE FUNCTION exec_sql(
  query      text,
  p_rol      text DEFAULT 'readonly',
  p_usuario  bigint DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result        jsonb;
  affected      integer;
  q_lower       text;
  q_trimmed     text;
  es_escritura  boolean;
  id_integrante bigint;
BEGIN
  q_trimmed := btrim(query, E' \t\n\r;');
  q_lower   := lower(q_trimmed);

  es_escritura := q_lower LIKE 'insert%'
               OR q_lower LIKE 'update%'
               OR q_lower LIKE 'delete%'
               OR q_lower LIKE 'truncate%'
               OR q_lower LIKE 'drop%'
               OR q_lower LIKE 'alter%'
               OR q_lower LIKE 'create%';

  -- readonly: solo lectura
  IF p_rol = 'readonly' AND es_escritura THEN
    RETURN jsonb_build_object(
      'error', 'Permiso denegado: el rol readonly solo puede consultar datos',
      'sqlstate', '42501'
    );
  END IF;

  -- integrante: solo puede UPDATE en su propio registro de integrante
  IF p_rol = 'integrante' AND es_escritura THEN
    -- Buscar el id_integrante real asociado a este usuario
    SELECT u.id_integrante INTO id_integrante
      FROM usuario u
     WHERE u.id = p_usuario
     LIMIT 1;

    -- Permitir solo UPDATE integrante WHERE id = su propio id
    IF id_integrante IS NULL
      OR q_lower NOT LIKE 'update integrante%'
      OR q_lower NOT LIKE '%where%'
      OR q_lower NOT LIKE '%' || id_integrante::text || '%'
    THEN
      RETURN jsonb_build_object(
        'error', 'Permiso denegado: los integrantes solo pueden editar su propio perfil',
        'sqlstate', '42501'
      );
    END IF;
  END IF;

  -- Ejecutar
  IF q_lower LIKE 'select%' OR q_lower LIKE 'with%' THEN
    EXECUTE 'SELECT COALESCE(jsonb_agg(row_to_json(t)), ''[]''::jsonb) FROM (' || q_trimmed || ') t'
      INTO result;
    RETURN result;
  END IF;

  IF q_lower ~ '\mreturning\M' THEN
    EXECUTE 'WITH __q AS (' || q_trimmed || ') SELECT COALESCE(jsonb_agg(row_to_json(__q)), ''[]''::jsonb) FROM __q'
      INTO result;
    RETURN result;
  END IF;

  EXECUTE q_trimmed;
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN jsonb_build_object('success', true, 'rows_affected', affected);

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM, 'sqlstate', SQLSTATE);
END;
$$;

GRANT EXECUTE ON FUNCTION exec_sql(text, text, bigint) TO anon;
GRANT EXECUTE ON FUNCTION exec_sql(text, text, bigint) TO authenticated;
