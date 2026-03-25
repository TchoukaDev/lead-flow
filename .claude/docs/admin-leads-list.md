# Liste des leads — Table, filtres et tour onboarding

## Objectif

Donner a l'admin une vue d'ensemble de tous les leads, avec filtrage instantané par statut et recherche texte libre. C'est aussi le point d'entrée du tour onboarding Driver.js.

## Fichiers clés

| Fichier | Rôle |
|---|---|
| `app/admin/leads/page.tsx` | Server Component — fetch Supabase + layout |
| `components/admin/LeadsList.tsx` | Client Component — table + état filtres |
| `components/admin/LeadsFilters.tsx` | Client Component — input recherche + pills statut |
| `components/admin/ScoreBadge.tsx` | Affichage du score IA |
| `components/admin/StatusBadge.tsx` | Affichage du statut commercial |
| `components/tour/TourStarter.tsx` | Déclenchement automatique du tour |
| `lib/tour.ts` | Définition des étapes du tour |

## Flux de données

```
app/admin/leads/page.tsx (Server Component)
  → supabase.from('leads').select('*').order('created_at', { ascending: false })
  → passe leads[] en prop a LeadsList
  → monte TourStarter (rend null, effet de bord seulement)

LeadsList (Client Component)
  → état local : search (string), statusFilter (LeadStatus | 'all')
  → filtre leads[] en mémoire (pas d'appel réseau)
  → délègue le rendu des filtres a LeadsFilters
  → rend la table avec Link vers /admin/leads/[id]

LeadsFilters
  → reçoit les handlers du parent (onSearchChange, onStatusFilterChange)
  → pas d'état propre — état centralisé dans LeadsList
```

## Filtrage

Le filtrage est entièrement client-side sur le tableau recu depuis le serveur. Deux critères combinés :

- **Statut** : correspondance exacte sur `lead.status` (ou `'all'` pour désactiver le filtre)
- **Recherche texte** : recherche insensible a la casse sur `prénom + nom`, `company`, `email`

Les deux filtres sont combinés en `AND`. L'ensemble des leads reste en mémoire — aucune requête n'est refaite lors du filtrage.

## ScoreBadge

Affiche le score IA (0-100) avec un code couleur :

| Score | Couleur |
|---|---|
| > 70 | Vert |
| 40 – 70 | Orange |
| < 40 | Rouge |
| `null` | Gris (en attente d'enrichissement) |

Le composant accepte une prop `id` optionnelle pour servir d'ancre au tour onboarding (utilisé sur la premiere ligne : `id="score-badge"`).

## StatusBadge

Affiche le statut commercial avec label en français et code couleur :

| Statut | Label | Couleur |
|---|---|---|
| `new` | Nouveau | Bleu |
| `contacted` | Contacté | Jaune |
| `qualified` | Qualifié | Vert |
| `lost` | Perdu | Rouge |

Même prop `id` optionnelle que ScoreBadge pour le tour (`id="status-badge"`).

## Tour onboarding Driver.js

### Déclenchement

`TourStarter` est un Client Component qui rend `null` et utilise uniquement `useEffect`. Il démarre le tour si `localStorage.getItem('leadflow_tour_done')` est falsy. A la fin du tour, il écrit `'1'` dans localStorage via le callback `onDestroyStarted`.

Configuration Driver.js notable :
- `allowClose: false` — l'utilisateur ne peut pas fermer le tour manuellement (bouton ×) ; il doit le compléter
- `disableActiveInteraction: true` — les éléments mis en surbrillance ne sont pas cliquables pendant le tour (évite les navigations accidentelles)

Le tour ne se déclenche donc qu'une seule fois par navigateur, a la premiere visite de `/admin/leads`.

### Étapes du tour

Définies dans `lib/tour.ts` — c'est le seul fichier a modifier pour changer le contenu du tour.

| Étape | Ancre DOM | Contenu |
|---|---|---|
| 1 | `#leads-table` | Présentation du pipeline |
| 2 | `#score-badge` | Explication du score IA |
| 3 | `#status-badge` | Explication des statuts |
| 4 | `#lead-row-first` | Invitation a cliquer sur une fiche |
| 5 | `#create-lead-btn` | Invitation a tester avec ses propres infos |

Les ancres `#score-badge`, `#status-badge` et `#lead-row-first` sont attachées a la premiere ligne du tableau uniquement.

## Décisions techniques notables

**Server Component pour le fetch, Client Component pour les filtres.** Le fetch Supabase se fait cote serveur (pas de round-trip client, pas d'état de chargement). Le filtrage doit etre réactif — il est délégué a un Client Component qui recoit les données déja chargées.

**Pas de `router.push` pour la navigation vers la fiche.** Chaque cellule de la table est enveloppée dans un `<Link>` Next.js. Cela produit une navigation standard avec prefetching, et évite d'envelopper la `<tr>` entiere dans un lien (invalide en HTML).

**Filtrage en mémoire plutôt que par requête.** Le nombre de leads par compte reste faible (démo portfolio). Refaire une requête Supabase a chaque frappe serait sur-engineeré et introduirait de la latence inutile.

**Ancres tour via prop `id`.** Les composants `ScoreBadge` et `StatusBadge` exposent une prop `id` optionnelle, non une prop spécifique au tour. Cela évite de coupler la logique du tour dans les composants métier.
