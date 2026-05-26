// CONFIGURACIÓN DE SUPABASE
// Reemplaza con los valores de tu proyecto: Dashboard > Project Settings > API
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const SUPABASE_URL  = 'https://yrzkfktsnbsqywnxuvzg.supabase.co';
export const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlyemtma3RzbmJzcXl3bnh1dnpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNzgwMDMsImV4cCI6MjA5NDk1NDAwM30.Ohvz8ZtQPXh_m3VP5_H1E0oYwl4bgjoTbni5-new9n8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// Ejecuta SQL crudo vía la función RPC exec_sql.
// Devuelve { data, error } donde data es array (SELECT/RETURNING)
// o { success, rows_affected } para INSERT/UPDATE/DELETE sin RETURNING.
export async function execSQL(query) {
  const { data, error } = await supabase.rpc('exec_sql', { query });
  if (error) {
    console.error('RPC error:', error);
    return { data: null, error: error.message };
  }
  if (data && typeof data === 'object' && !Array.isArray(data) && data.error) {
    console.error('SQL error:', data.error);
    return { data: null, error: data.error };
  }
  return { data, error: null };
}
