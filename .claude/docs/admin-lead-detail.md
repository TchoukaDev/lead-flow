# Fiche lead — Enrichissement IA, statut, brouillon email

## Objectif

Afficher toutes les informations d'un lead sur une page dédiée : données brutes du formulaire, résultat de l'enrichissement IA, et outils d'action (changement de statut, envoi d'email).

## Fichiers clés

| Fichier | Rôle |
|---|---|
| `app/admin/leads/[id]/page.tsx` | Server Component — fetch + layout de la fiche |
| `components/admin/EnrichmentPanel.tsx` | Affichage des données d'enrichissement IA |
| `components/admin/StatusSelect.tsx` | Select de changement de statut |
| `components/admin/EmailDraftEditor.tsx` | Editeur de brouillon + envoi via Resend |
| `actions/leads.ts` | Server Actions `updateLeadStatus()`, `updateEmailDraft()` |
| `app/api/send-email/route.ts` | Route Handler — envoi email et mise a jour statut |

## Flux de données

### Chargement de la fiche

```
app/admin/leads/[id]/page.tsx (Server Component)
  → await params pour récupérer id (params est une Promise en Next.js 14+)
  → supabase.from('leads').select('*').eq('id', id).single()
  → si error ou !data : notFound()
  → cast explicite de data.enrichment en Enrichment | null
  → passe les données aux composants enfants
```

### Changement de statut

```
StatusSelect (Client Component)
  → onChange sur le <select>
  → appelle updateLeadStatus(leadId, newStatus) (Server Action)
    → supabase.from('leads').update({ status }).eq('id', id)
    → revalidatePath('/admin/leads') + revalidatePath('/admin/leads/' + id)
    → retourne { ok: true } | { error: string }
  → affiche l'erreur inline si échec
```

### Sauvegarde du brouillon

```
EmailDraftEditor (Client Component)
  → état local : draft (string), initialisé depuis initialDraft ?? ''
  → bouton "Sauvegarder"
    → appelle updateEmailDraft(leadId, draft) (Server Action)
      → supabase.from('leads').update({ email_draft: draft }).eq('id', id)
      → revalidatePath('/admin/leads/' + id)
      → retourne { ok: true } | { error: string }
    → affiche "Brouillon sauvegardé" ou l'erreur
```

### Envoi de l'email

```
EmailDraftEditor (Client Component)
  → bouton "Envoyer"
    → POST /api/send-email
      → Body : { leadId, to: leadEmail, subject: 'Suite à votre demande', body: draft }
    → app/api/send-email/route.ts
      → vérifie la session Supabase (user authentifié requis)
      → resend.emails.send({ from, to, subject, text: body })
      → si succès : getServiceClient().from('leads').update({ status: 'contacted' })
      → revalidatePath('/admin/leads') + revalidatePath('/admin/leads/' + id)
      → retourne { ok: true }
    → affiche "Email envoyé — statut mis a jour"
```

## Structure de l'objet Enrichment

```typescript
interface Enrichment {
  sector_analysis: string   // analyse du secteur d'activité
  probable_needs: string[]  // liste de besoins probables (liste a puces)
  maturity_level: 'low' | 'medium' | 'high'  // maturité du prospect
  reasoning: string         // raisonnement IA sur le scoring
}
```

Cet objet est stocké en colonne JSON dans Supabase et casté explicitement lors du fetch (`data.enrichment as Enrichment | null`).

## EnrichmentPanel

Composant serveur (pas de `'use client'`) qui affiche les 4 blocs de l'enrichissement :

- Analyse sectorielle (texte)
- Besoins probables (liste)
- Maturité avec badge coloré (low/medium/high → rouge/jaune/vert)
- Raisonnement (texte)

Si `lead.enrichment === null`, la page affiche un placeholder "En attente d'enrichissement…" sans monter le composant.

## Sécurité de /api/send-email

Contrairement a `/api/leads` (protégée par secret n8n), `/api/send-email` est protégée par session Supabase. La route appelle `supabase.auth.getUser()` avec le client server (cookie-based) — seul un utilisateur authentifié peut déclencher un envoi d'email.

L'insertion finale du statut `contacted` utilise le client service (`SUPABASE_SECRET_KEY`) pour bypasser RLS, car le Route Handler a besoin d'écrire sans passer par les politiques de l'utilisateur.

## Décisions techniques notables

**`params` est une Promise en Next.js 14 App Router.** La page utilise `await params` pour récupérer `id`. C'est le pattern requis quand `params` est typé comme `Promise<{ id: string }>` — une valeur synchrone provoquerait un warning.

**Deux clients Supabase dans `/api/send-email`.** Le Route Handler utilise le client server (avec cookies) pour vérifier l'authentification, puis le client service pour écrire le statut. La vérification auth doit utiliser le client lié a la session ; l'écriture utilise le client service pour garantir le bypass RLS indépendamment des droits de l'utilisateur.

**L'envoi d'email met automatiquement le statut a `contacted`.** C'est un effet de bord intentionnel : si on envoie un email, le lead est par définition contacté. L'admin n'a pas besoin de faire deux actions.

**`revalidatePath` sur les deux routes après chaque mutation.** `updateLeadStatus` et `updateEmailDraft` invalident a la fois `/admin/leads` (liste) et `/admin/leads/[id]` (fiche). Sans ca, la liste afficherait un statut périmé apres navigation.

**Brouillon email : texte brut uniquement pour l'instant.** La route `/api/send-email` utilise le champ `text` de Resend. Un TODO dans le code indique qu'un template React (`react: <LeadContactEmail />`) remplacera le texte brut quand le composant email sera créé.
