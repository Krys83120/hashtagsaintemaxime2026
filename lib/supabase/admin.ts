import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase "admin" utilisant la clé service_role.
 * Contourne le Row Level Security : à utiliser UNIQUEMENT dans des
 * routes serveur (app/api/**) après vérification de la session admin.
 * Ne jamais importer ce fichier dans un composant "use client".
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
