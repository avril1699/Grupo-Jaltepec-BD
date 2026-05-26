-- ============================================================
--  CONFIGURACIÓN ÚNICA EN SUPABASE
--  Ejecutar UNA VEZ en el SQL Editor de Supabase.
--  Permite ejecutar SQL crudo desde el navegador.
--  ADVERTENCIA: solo para laboratorio.
-- ============================================================

CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  affected integer;
  q_lower text;
  q_trimmed text;
BEGIN
  q_trimmed := rtrim(ltrim(query), '; ' || chr(10) || chr(13));
  q_lower := lower(q_trimmed);

  -- SELECT plano → envolver en subquery y agregar a JSON
  IF q_lower LIKE 'select%' OR q_lower LIKE 'with%' THEN
    EXECUTE 'SELECT COALESCE(jsonb_agg(row_to_json(t)), ''[]''::jsonb) FROM (' || q_trimmed || ') t'
      INTO result;
    RETURN result;
  END IF;

  -- INSERT/UPDATE/DELETE con RETURNING → envolver en CTE
  -- Postgres no permite SELECT FROM (INSERT...), solo WITH x AS (INSERT...) SELECT FROM x
  IF q_lower ~ '\mreturning\M' THEN
    EXECUTE 'WITH __q AS (' || q_trimmed || ') SELECT COALESCE(jsonb_agg(row_to_json(__q)), ''[]''::jsonb) FROM __q'
      INTO result;
    RETURN result;
  END IF;

  -- INSERT/UPDATE/DELETE/DDL sin RETURNING
  EXECUTE q_trimmed;
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN jsonb_build_object('success', true, 'rows_affected', affected);

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM, 'sqlstate', SQLSTATE);
END;
$$;

GRANT EXECUTE ON FUNCTION exec_sql(text) TO anon;
GRANT EXECUTE ON FUNCTION exec_sql(text) TO authenticated;
