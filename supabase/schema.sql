-- LeadFlow — Schéma v1
-- À exécuter dans Supabase SQL Editor

CREATE TABLE leads (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  -- Champs formulaire
  first_name    text NOT NULL,
  last_name     text NOT NULL,
  email         text NOT NULL,
  company       text NOT NULL,
  sector        text NOT NULL,
  main_need     text NOT NULL,
  budget_range  text NOT NULL,
  source        text,

  -- Enrichissement IA
  score         integer CHECK (score >= 0 AND score <= 100),
  enrichment    jsonb,
  email_draft   text,

  -- Statut
  status        text NOT NULL DEFAULT 'new'
                CHECK (status IN ('new', 'contacted', 'qualified', 'lost')),

  -- Meta
  is_demo       boolean NOT NULL DEFAULT false
);

CREATE INDEX leads_status_idx ON leads(status);
CREATE INDEX leads_created_at_idx ON leads(created_at DESC);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users can read leads"
  ON leads FOR SELECT TO authenticated USING (true);

CREATE POLICY "Auth users can update leads"
  ON leads FOR UPDATE TO authenticated USING (true);

-- INSERT réservé au service_role (via API Route sécurisée)
-- Pas de policy INSERT pour anon/authenticated
