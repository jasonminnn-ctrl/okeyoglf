
-- Drop the old 6-parameter overload of deduct_credit (the one that hardcodes actor_type = 'user')
DROP FUNCTION IF EXISTS public.deduct_credit(uuid, integer, ledger_type, text, text, uuid);
