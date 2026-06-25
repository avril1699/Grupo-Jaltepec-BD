import { createClient }
from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl =
'https://yrzkfktsnbsqywnxuvzg.supabase.co';

const supabaseKey =
'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlyemtma3RzbmJzcXl3bnh1dnpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNzgwMDMsImV4cCI6MjA5NDk1NDAwM30.Ohvz8ZtQPXh_m3VP5_H1E0oYwl4bgjoTbni5-new9n8';

export const supabase =
createClient(
  supabaseUrl,
  supabaseKey
);