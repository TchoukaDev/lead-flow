# LeadFlow

Interface de gestion et qualification de leads pour PME de services. Concu comme démo portfolio — testable sans création de compte, avec un compte démo pré-rempli qui accede directement a l'interface admin.

## Ce que fait l'application

1. Un prospect remplit un formulaire public (`/formulaire`)
2. Le formulaire envoie les données vers n8n via webhook
3. n8n orchestre l'enrichissement IA (Claude API), le scoring et la génération d'un brouillon d'email
4. n8n insere le lead enrichi en base via `POST /api/leads`
5. L'admin consulte les leads, modifie les statuts et envoie des emails directement depuis la fiche

## Stack

| Couche | Technologie |
|---|---|
| Framework | Next.js 14 App Router |
| Base de données / Auth | Supabase |
| UI | Tailwind CSS v4 + shadcn/ui (dark mode, zinc) |
| Langage | TypeScript strict |
| Orchestration | n8n (webhooks) |
| IA | Claude API |
| Emails | Resend |
| Tour onboarding | Driver.js |
| Déploiement | Vercel |

## Setup local

### Prérequis

- Node.js 18+
- Un projet Supabase avec la table `leads` (voir `supabase/schema.sql`)
- Optionnel : instance n8n, compte Resend

### 1. Cloner et installer les dépendances

```bash
git clone <repo>
cd lead-flow
npm install
```

### 2. Variables d'environnement

Créer un fichier `.env.local` a la racine :

```env
# Supabase — nouvelles clés (format post-juin 2025)
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=<publishable key>
SUPABASE_SECRET_KEY=<secret key>

# n8n — webhook entrant (formulaire public) et secret sortant (API Route)
N8N_WEBHOOK_URL=https://<n8n-instance>/webhook/<uuid>
N8N_API_SECRET=<chaine aleatoire longue>

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@votredomaine.fr
```

`N8N_WEBHOOK_URL` est optionnel en développement : si absent, `submitLead` simule un succès et logue le payload dans la console.

### 3. Initialiser la base de données

```bash
# Dans le dashboard Supabase > SQL Editor
# Executer supabase/schema.sql puis supabase/seed.sql
```

### 4. Lancer le serveur de développement

```bash
npm run dev
```

L'application est disponible sur `http://localhost:3000`.

## Compte démo

Email : `demo@leadflow.fr`
Mot de passe : `demo1234`

Ce compte est créé manuellement dans Supabase Auth. Le bouton "Accéder a la démo" sur la landing page se connecte automatiquement avec ces identifiants.

## Structure des dossiers

```
app/
  page.tsx                    # Landing page publique
  formulaire/page.tsx         # Formulaire public de capture de leads
  admin/
    layout.tsx                # Guard auth — redirect / si non connecté
    page.tsx                  # Redirect vers /admin/leads
    leads/
      page.tsx                # Liste des leads (Server Component)
      [id]/page.tsx           # Fiche lead détaillée (Server Component)
  api/
    leads/route.ts            # POST — réception leads depuis n8n
    send-email/route.ts       # POST — envoi email via Resend

actions/
  auth.ts                     # login(), logout() — Server Actions
  form.ts                     # submitLead() — envoi vers n8n
  leads.ts                    # updateLeadStatus(), updateEmailDraft()

components/
  auth/LoginForm.tsx          # DemoButton
  form/LeadForm.tsx           # Formulaire public
  admin/
    LeadsList.tsx             # Table des leads avec filtrage client
    LeadsFilters.tsx          # Recherche + pills statut
    ScoreBadge.tsx            # Badge score coloré
    StatusBadge.tsx           # Badge statut avec labels FR
    EnrichmentPanel.tsx       # Affichage données d'enrichissement IA
    StatusSelect.tsx          # Select de changement de statut
    EmailDraftEditor.tsx      # Editeur + envoi brouillon email
  tour/TourStarter.tsx        # Démarrage automatique du tour Driver.js

lib/
  supabase/
    client.ts                 # createSupabaseBrowserClient()
    server.ts                 # createSupabaseServerClient(cookieStore)
    service.ts                # getServiceClient() — bypass RLS
  tour.ts                     # tourSteps, TOUR_STORAGE_KEY
  utils.ts

types/
  index.ts                    # Lead, LeadStatus, BudgetRange, Enrichment, LeadWebhookPayload

supabase/
  schema.sql                  # DDL table leads + RLS + trigger updated_at
  seed.sql                    # 9 leads de démonstration
```

## Documentation par feature

- [Auth](.claude/docs/auth.md) — connexion, DemoButton, guard admin
- [Formulaire public](.claude/docs/public-form.md) — capture lead, webhook n8n
- [Liste des leads](.claude/docs/admin-leads-list.md) — table, filtres, tour onboarding
- [Fiche lead](.claude/docs/admin-lead-detail.md) — enrichissement IA, statut, email

## Déploiement

Le projet est déployé sur Vercel. Toutes les variables d'environnement listées ci-dessus doivent être configurées dans les paramètres du projet Vercel (Settings > Environment Variables).

La variable `SUPABASE_SECRET_KEY` est exclusivement serveur — ne jamais la préfixer `NEXT_PUBLIC_`.
