@AGENTS.md

# LeadFlow — Contexte projet

## Ce qu'est LeadFlow

Interface de gestion et qualification de leads pour PME de services.
Démo portfolio testable sans compte par des prospects.

## Stack

- Next.js 14 App Router
- Supabase (auth, database) — nouveau système de clés depuis juin 2025 : `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` (ex-anon) et `SUPABASE_SECRET_KEY` (ex-service_role), format JWT legacy supprimé le 1er nov. 2025
- Tailwind CSS v4 + shadcn/ui (dark mode, zinc)
- TypeScript strict
- n8n (orchestration webhooks) — accès via Route Handler sécurisé par `N8N_API_SECRET`, jamais accès direct Supabase
- Claude API (enrichissement IA, scoring, brouillons email)
- Resend (envoi emails)
- Driver.js (tour onboarding)
- Vercel (déploiement)

## Variables d'environnement

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
SUPABASE_SECRET_KEY
N8N_WEBHOOK_URL
N8N_API_SECRET
RESEND_API_KEY
RESEND_FROM_EMAIL
```

## Périmètre v1 — état d'avancement

### Implémenté

1. Setup : shadcn/ui, types (`Lead`, `LeadStatus`, `BudgetRange`, `Enrichment`, `LeadWebhookPayload`), variables d'env
2. Supabase : table `leads` avec RLS + trigger `updated_at`, 9 leads démo, clients browser/server/service
3. Auth : Server Actions `login`/`logout`, page `/login` avec `DemoButton` (compte démo `demo@leadflow.fr`), guard `/admin`
4. Formulaire public : `submitLead` → POST n8n (succès simulé si URL absente), confirmation inline dans `LeadForm`, page `/formulaire`
5. Landing page `/` : headline, pills features, `DemoButton` — plus de redirect automatique
6. Tour onboarding : Driver.js, 5 étapes dans `lib/tour.ts`, auto-démarrage unique via `TourStarter`
7. Interface admin — liste des leads :
   - `app/admin/leads/page.tsx` — Server Component, fetch leads Supabase triés par date, header avec compteur + lien "Tester avec vos infos" vers `/formulaire`
   - `components/admin/LeadsList.tsx` — Client Component, filtrage local par statut et recherche texte, table avec ids tour (`#leads-table`, `#lead-row-first`), navigation par `Link` Next.js (pas `router.push`)
   - `components/admin/LeadsFilters.tsx` — Input recherche + pills statut avec `statusCounts: Record<LeadStatus | 'all', number>`. Les counts reflètent la recherche active (calculés sur `searchFiltered` avant filtre statut)
   - `components/admin/ScoreBadge.tsx` — Badge score coloré : vert > 70, orange >= 40, rouge < 40, gris si null. Prop `id` pour ancre tour
   - `components/admin/StatusBadge.tsx` — Badge statut avec labels FR (Nouveau/Contacté/Qualifié/Perdu). Prop `id` pour ancre tour
   - `app/api/leads/route.ts` — Comparaison secret via `crypto.timingSafeEqual` (protection timing attack)
8. Interface admin — fiche lead :
   - `app/admin/leads/[id]/page.tsx` — Server Component, fetch lead par id, sections : infos, enrichissement IA, brouillon email
   - `components/admin/StatusSelect.tsx` — Select statut inline, appelle `updateLeadStatus` (Server Action), optimistic via `defaultValue`
   - `components/admin/EmailDraftEditor.tsx` — Textarea + boutons Sauvegarder / Envoyer. Sauvegarder → `updateEmailDraft`. Envoyer → POST `/api/send-email` → Resend + statut → contacted
   - `components/admin/EnrichmentPanel.tsx` — Affichage lecture seule des données `Enrichment` (résumé, points forts, risques)
   - `app/api/send-email/route.ts` — Auth Supabase, envoi Resend (text pour l'instant, TODO react-email), update statut → contacted via service client, `revalidatePath` sur liste + fiche
   - `actions/leads.ts` — `updateLeadStatus(id, status)` + `updateEmailDraft(id, draft)`, revalidatePath après chaque mutation
9. Tests : Vitest + Testing Library, 83 tests unitaires dans `__tests__/`
10. Docs : README.md + `.claude/docs/` (auth, public-form, admin-leads-list, admin-lead-detail)

### Restant

- Flux n8n : enrichissement IA + scoring + accusé de réception auto

## Conventions

- App Router uniquement, pas de Pages Router
- Server Actions pour les mutations
- Composants serveur par défaut, client uniquement si nécessaire
- Pas de any TypeScript
- Variables d'environnement dans .env.local, jamais en dur
- Commits uniquement sur demande explicite

## Structure des dossiers

```
app/          ← pages et layouts (racine, pas dans src/)
  page.tsx          ← landing page
  login/page.tsx    ← page démo (DemoButton uniquement)
  formulaire/page.tsx ← formulaire public, sans guard
  admin/            ← guard auth → redirect /login
    layout.tsx
    page.tsx        ← redirect /admin/leads
    leads/          ← implémenté (page.tsx)
components/
  ui/           ← shadcn/ui
  auth/         ← LoginForm, DemoButton
  form/         ← LeadForm
  tour/         ← TourStarter
  admin/        ← LeadsList, LeadsFilters, ScoreBadge, StatusBadge, StatusSelect, EmailDraftEditor, EnrichmentPanel
lib/
  supabase/
    client.ts   ← createSupabaseBrowserClient()
    server.ts   ← createSupabaseServerClient(cookieStore)
    service.ts  ← getServiceClient()
  tour.ts       ← tourSteps, TOUR_STORAGE_KEY (seul fichier à modifier pour le tour)
  utils.ts
types/
  index.ts      ← Lead, LeadStatus, BudgetRange, Enrichment, LeadWebhookPayload
actions/
  auth.ts       ← login(formData), logout()
  form.ts       ← submitLead(formData)
  leads.ts      ← updateLeadStatus(id, status), updateEmailDraft(id, draft)
__tests__/      ← Vitest, miroir de la structure source
  actions/leads.test.ts
  components/admin/*.test.tsx
supabase/
  schema.sql
  seed.sql
```
