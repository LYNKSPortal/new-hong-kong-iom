-- Adds per-card running balance (for partial redemptions) and a redemption ledger.
ALTER TABLE gift_cards ALTER COLUMN value TYPE NUMERIC(10,2);
ALTER TABLE gift_cards ADD COLUMN IF NOT EXISTS balance NUMERIC(10,2);

UPDATE gift_cards
SET balance = CASE WHEN status = 'redeemed' THEN 0 ELSE value END
WHERE balance IS NULL;

ALTER TABLE gift_cards ALTER COLUMN balance SET NOT NULL;

CREATE TABLE IF NOT EXISTS gift_card_redemptions (
  id UUID PRIMARY KEY,
  gift_card_id UUID NOT NULL REFERENCES gift_cards(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  note TEXT,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
