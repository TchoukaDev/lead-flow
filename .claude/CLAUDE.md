@AGENTS.md

# LeadFlow — Contexte projet

## Ce qu'est LeadFlow

Interface de gestion et qualification de leads pour PME de services.
Démo portfolio testable sans compte par des prospects.

## Stack

- Next.js 14 App Router
- Supabase (auth, database, storage)
- Tailwind CSS
- TypeScript strict
- n8n (orchestration webhooks)
- Claude API (enrichissement IA, scoring, brouillons email)
- Resend (envoi emails)
- Vercel (déploiement)

## Périmètre v1

1. Formulaire public React → webhook n8n
2. n8n → enrichissement IA + scoring + accusé de réception auto
3. Interface admin : liste leads, fiche enrichie, statuts, brouillon email éditable
4. Accès démo sans login (credentials pré-remplis)
5. Base pré-remplie avec 10 leads fictifs réalistes

## Conventions

- App Router uniquement, pas de Pages Router
- Server Actions pour les mutations
- Composants serveur par défaut, client uniquement si nécessaire
- Pas de any TypeScript
- Variables d'environnement dans .env.local, jamais en dur
- Commits uniquement sur demande explicite

## Structure des dossiers

src/
app/ ← pages et layouts
components/ ← composants réutilisables
lib/ ← utilitaires, clients Supabase, helpers
types/ ← types TypeScript globaux
actions/ ← server actions
