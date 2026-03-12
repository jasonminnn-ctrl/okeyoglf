
CREATE OR REPLACE FUNCTION public.deduct_credit(
  _org_id uuid,
  _amount integer,
  _type ledger_type,
  _reason text,
  _module text DEFAULT NULL::text,
  _result_id uuid DEFAULT NULL::uuid,
  _actor_type text DEFAULT 'user'::text
)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _wallet_id UUID;
  _current_balance INTEGER;
  _new_balance INTEGER;
BEGIN
  IF _amount IS NULL OR _amount <= 0 THEN
    RAISE EXCEPTION 'deduct_credit: _amount must be > 0, got %', _amount;
  END IF;

  SELECT id, balance INTO _wallet_id, _current_balance
  FROM public.credit_wallets
  WHERE org_id = _org_id
  FOR UPDATE;

  IF _wallet_id IS NULL THEN RETURN FALSE; END IF;
  IF _current_balance < _amount THEN RETURN FALSE; END IF;

  _new_balance := _current_balance - _amount;

  UPDATE public.credit_wallets
  SET balance = _new_balance, lifetime_used = lifetime_used + _amount, updated_at = now()
  WHERE id = _wallet_id;

  INSERT INTO public.credit_ledger (wallet_id, org_id, type, amount_delta, balance_after, reason, related_module, related_result_id, actor_type)
  VALUES (_wallet_id, _org_id, _type, -_amount, _new_balance, _reason, _module, _result_id, _actor_type);

  RETURN TRUE;
END;
$function$
