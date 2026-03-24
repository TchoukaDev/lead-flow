# Formulaire public — Capture lead et webhook n8n

## Objectif

Permettre a n'importe quel visiteur (prospect ou démonstrateur) de soumettre un lead sans authentification. Le formulaire envoie les données brutes vers n8n, qui se charge de l'enrichissement, du scoring et de l'insertion en base.

## Fichiers clés

| Fichier | Rôle |
|---|---|
| `app/formulaire/page.tsx` | Page publique, sans guard auth |
| `components/form/LeadForm.tsx` | Formulaire React contrôlé |
| `actions/form.ts` | Server Action `submitLead()` |
| `app/api/leads/route.ts` | Route Handler — réception du lead enrichi depuis n8n |

## Flux de données

### Soumission formulaire → n8n

```
LeadForm (client)
  → onSubmit : construit FormData depuis le formulaire HTML natif
  → appelle submitLead(formData) (Server Action)
    → si N8N_WEBHOOK_URL absent : logue en console, retourne { success: true }
    → sinon : POST JSON vers N8N_WEBHOOK_URL
      → succès (2xx) : retourne { success: true }
      → échec réseau ou HTTP : retourne { error: string }
  → si succès : bascule sur l'écran de confirmation inline
  → si erreur : affiche le message dans le formulaire
```

### n8n → base de données (via API Route)

```
n8n (après enrichissement IA)
  → POST /api/leads
    → Header : x-api-secret: <N8N_API_SECRET>
    → Body : LeadWebhookPayload (JSON)
  → app/api/leads/route.ts
    → vérifie le secret via timingSafeEqual
    → insere en base avec getServiceClient() (bypass RLS)
    → retourne 201 { ok: true }
```

## Payload webhook sortant (formulaire → n8n)

```typescript
{
  first_name: string
  last_name: string
  email: string
  company: string
  sector: string        // l'une des 10 valeurs du select
  main_need: string     // texte libre
  budget_range: string  // '<5k' | '5k-15k' | '15k-50k' | '>50k'
  source: string | null // optionnel
}
```

## Payload webhook entrant (n8n → /api/leads)

```typescript
// Type : LeadWebhookPayload (types/index.ts)
{
  first_name: string
  last_name: string
  email: string
  company: string
  sector: string
  main_need: string
  budget_range: BudgetRange
  source: string | null
  score: number           // ajouté par n8n
  enrichment: Enrichment  // objet IA (voir types/index.ts)
  email_draft: string     // brouillon généré par IA
}
```

## Sécurité de l'API Route

La route `POST /api/leads` est appelée par n8n, pas par le navigateur. Elle est protégée par un secret partagé (`N8N_API_SECRET`) transmis dans le header `x-api-secret`.

La comparaison utilise `crypto.timingSafeEqual` (Node.js natif) plutôt qu'une égalité `===`, ce qui prévient les attaques par analyse de timing : une comparaison string classique peut retourner plus vite si les premiers caractères ne correspondent pas, ce qui permet de deviner le secret caractere par caractere. `timingSafeEqual` garantit un temps constant.

Le client Supabase utilisé pour l'insertion est le client service (`SUPABASE_SECRET_KEY`) pour bypasser les politiques RLS — les inserts depuis n8n ne sont pas authentifiés au sens Supabase Auth.

## Décisions techniques notables

**Graceful degradation en développement.** Si `N8N_WEBHOOK_URL` n'est pas défini, `submitLead` simule un succès et logue le payload. Cela permet de travailler sur le formulaire et l'UI de confirmation sans avoir n8n configuré.

**Confirmation inline, pas de redirect.** Apres soumission réussie, `LeadForm` bascule sur un écran de confirmation dans le même composant (`setSubmitted(true)`), sans changer de page. Cela évite un round-trip et garde l'utilisateur sur `/formulaire`.

**FormData natif.** Le formulaire utilise `new FormData(e.currentTarget)` plutôt qu'un état React pour chaque champ. Moins de code, et compatible avec les Server Actions sans adaptation.

**Séparation des responsabilités formulaire / enrichissement.** Le formulaire envoie uniquement les données brutes saisies par l'utilisateur. Tout ce qui est IA (score, enrichment, email_draft) est produit par n8n et injecté lors du callback sur `/api/leads`. Le formulaire n'attend pas le résultat de l'IA.
