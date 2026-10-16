-- Restrict the maintenance helper to trusted database roles.
-- This function only needs to be installed/executed by database administrators;
-- it must not be callable through the public PostgREST RPC surface.
DO $migration$
BEGIN
  IF to_regprocedure('public.rls_auto_enable()') IS NOT NULL THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated';
  END IF;
END
$migration$;
