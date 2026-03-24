# Auth — Connexion, DemoButton, guard admin

## Objectif

Permettre l'accès a l'interface admin via Supabase Auth, sans exposer de formulaire de login classique. L'entrée principale est un bouton unique "Accéder a la démo" qui connecte automatiquement avec des identifiants pré-remplis.

## Fichiers clés

| Fichier | Rôle |
|---|---|
| `actions/auth.ts` | Server Actions `login()` et `logout()` |
| `components/auth/LoginForm.tsx` | Composant `DemoButton` |
| `app/admin/layout.tsx` | Guard auth — couvre tout le segment `/admin` |
| `app/page.tsx` | Landing page — point d'entrée public |

## Flux de données

### Connexion via DemoButton

```
DemoButton (client)
  → construit un FormData avec email/password codés en dur
  → appelle login() (Server Action)
    → supabase.auth.signInWithPassword()
    → succès : redirect('/admin/leads')
    → échec : retourne { error: string }
  → si erreur : affiche le message inline
```

### Guard admin

`app/admin/layout.tsx` est un Server Component async. A chaque requête sous `/admin`, il :

1. Récupère le cookie store via `cookies()`
2. Crée un client Supabase serveur
3. Appelle `supabase.auth.getUser()`
4. Si pas d'utilisateur : `redirect('/')` — la landing page, pas `/login`

Le guard couvre automatiquement toutes les routes enfants (`/admin/leads`, `/admin/leads/[id]`, etc.) sans répétition.

### Déconnexion

`logout()` est une Server Action appelée depuis un bouton (non encore implémenté dans l'UI). Elle appelle `supabase.auth.signOut()` puis redirige vers `/`.

## Clients Supabase

Trois clients distincts selon le contexte :

| Client | Fichier | Clé utilisée | Usage |
|---|---|---|---|
| Browser | `lib/supabase/client.ts` | `PUBLISHABLE_DEFAULT_KEY` | Composants client |
| Server | `lib/supabase/server.ts` | `PUBLISHABLE_DEFAULT_KEY` | Server Components, Server Actions, Route Handlers authentifiés |
| Service | `lib/supabase/service.ts` | `SUPABASE_SECRET_KEY` | API Routes qui doivent bypasser RLS |

Le client service est un singleton (pattern `let _client`) pour éviter de multiplier les connexions dans les Route Handlers.

## Décisions techniques notables

**Pas de page `/login` dédiée.** La démo étant destinée a des prospects, une page de login standard ajouterait de la friction et demanderait de mémoriser des identifiants. Le `DemoButton` élimine cette étape.

**Redirect vers `/` en cas d'accès non autorisé, pas vers `/login`.** Le guard dans `layout.tsx` redirige vers la landing page plutôt que vers une page de login. Cohérent avec l'absence de formulaire de login.

**Nomenclature des clés Supabase.** Depuis juin 2025, Supabase a renommé ses clés : `PUBLISHABLE_DEFAULT_KEY` remplace `anon key`, et `SUPABASE_SECRET_KEY` remplace `service_role key`. Le projet utilise la nouvelle nomenclature.

**Server Actions pour les mutations auth.** `login()` et `logout()` sont des Server Actions (directive `'use server'`), ce qui permet d'appeler `redirect()` directement depuis la fonction sans passer par une réponse HTTP intermédiaire.
