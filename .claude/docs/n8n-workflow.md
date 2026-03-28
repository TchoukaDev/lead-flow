# Workflow n8n — LeadFlow

**ID workflow** : `A8McEUiDdIuvKfHO`
**Nom** : `workflow leadflow`

---

## Vue d'ensemble

```
[Formulaire /formulaire]
        │ POST + x-webhook-secret
        ▼
┌─────────────────┐
│  1. Webhook     │  Reçoit les données du lead
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│  2. Claude          │  Analyse commerciale → JSON
│     Enrichment      │  (score + enrichment + email_draft)
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  3. Parse & Merge   │  Parse le JSON de Claude
│     (Code node)     │  + fusionne avec données webhook
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  4. Save Lead       │  POST /api/leads → Supabase
│  (HTTP Request)     │  Authentifié par x-api-secret
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  5. Send Ack Email  │  Email accusé de réception
│     (Resend node)   │  au lead via Resend
└─────────────────────┘
```

---

## Nœud 1 — Webhook

**Type** : `n8n-nodes-base.webhook` v2.1
**Path** : `leadflow-submit`
**Méthode** : POST
**Authentification** : Header Auth (credential n8n : "Header Auth account")

Le webhook valide le header `x-webhook-secret` via le credential n8n de type HTTP Header Auth. Si le secret ne correspond pas, n8n rejette la requête avec 401 avant d'exécuter le reste du workflow.

**Payload reçu** (body du POST depuis `actions/form.ts`) :

```json
{
  "first_name": "Jean",
  "last_name": "Dupont",
  "email": "jean@acme.fr",
  "company": "Acme",
  "sector": "E-commerce",
  "main_need": "Refonte site vitrine",
  "budget_range": "5k-15k",
  "source": null
}
```

**Accès dans les nœuds suivants** :

- `$json.body.first_name` — les données sont sous `.body` dans le nœud Webhook v2.1
- `$('Webhook').first().json.body` — pour y accéder depuis un nœud non-adjacent

---

## Nœud 2 — Claude Enrichment

**Type** : `@n8n/n8n-nodes-langchain.anthropic` v1
**Modèle** : `claude-sonnet-4-5-20250929`
**Credential** : `anthropicApi` ("Anthropic account")
**Options** : `simplify: true`, `includeMergedResponse: true`, `maxTokens: 2000`

### User message (prompt)

Expression n8n qui construit le message utilisateur dynamiquement :

```
Lead à qualifier :
- Prénom : {{ $json.body.first_name }}
- Nom : {{ $json.body.last_name }}
- Email : {{ $json.body.email }}
- Entreprise : {{ $json.body.company }}
- Secteur d'activité : {{ $json.body.sector }}
- Besoin principal : {{ $json.body.main_need }}
- Budget envisagé : {{ $json.body.budget_range }}
- Source : {{ $json.body.source ?? 'non renseignée' }}
```

### System message

Instructions permanentes envoyées à Claude à chaque exécution :

```
Tu es un expert en qualification commerciale.

Ton role est d'analyser les leads entrants et de produire une qualification
structuree, quel que soit le secteur ou le type de prestation concerne.

CRITERES DE SCORING (total 100 pts) :
- Budget (>50k=25pts, 15k-50k=20pts, 5k-15k=13pts, <5k=5pts)
- Clarte et precision du besoin (tres precis=25pts, precis=18pts, vague=10pts, tres vague=5pts)
- Profil et solidite de l'entreprise (PME etablie=20pts, startup financee=15pts, TPE serieuse=10pts, particulier=5pts)
- Signaux d'urgence et de maturite (projet imminent=20pts, dans 3 mois=14pts, dans 6 mois=8pts, exploratoire=3pts)
- Potentiel de la relation commerciale (recurrent/long terme=10pts, one-shot significatif=7pts, ponctuel/limite=3pts)

MATURITY_LEVEL :
- "high" : besoin precis + budget significatif + decideur identifiable => a contacter en priorite aujourd'hui
- "medium" : besoin identifie mais budget flou ou besoin a affiner => suivi sous 48h
- "low" : besoin vague, budget insuffisant ou projet non defini => faible probabilite de conversion a court terme

EMAIL_DRAFT (brouillon de premier contact) :
- En francais, professionnel et chaleureux, jamais generique
- Accroche personnalisee sur le secteur ou le besoin specifique mentionne
- 3-4 paragraphes : accroche / comprehension du besoin / valeur apportee / appel a l'action
- Proposer un echange de 30 min pour en discuter
- Signe : "Romain Wirth"
- Ne jamais mentionner le score, l'analyse ou le processus interne

REGLE ABSOLUE : retourner UNIQUEMENT l'objet JSON ci-dessous,
sans texte avant ni apres, sans bloc markdown.

{
  "score": <entier 0-100>,
  "enrichment": {
    "sector_analysis": "<analyse du secteur>",
    "probable_needs": ["<besoin 1>", "<besoin 2>", "<besoin 3>"],
    "maturity_level": "<low|medium|high>",
    "reasoning": "<raisonnement detaille>"
  },
  "email_draft": "<email complet de prise de contact>"
}
```

### Ce que retourne le nœud (`includeMergedResponse: true`)

L'API Anthropic renvoie nativement :

```json
{
  "content": [{ "type": "text", "text": "{ \"score\": 75, ... }" }]
}
```

Avec `simplify: true` + `includeMergedResponse: true`, n8n ajoute un champ `response` qui concatène tous les blocs texte en une seule chaîne :

```json
{
  "response": "{ \"score\": 75, \"enrichment\": { ... }, \"email_draft\": \"...\" }"
}
```

`$json.response` est donc une **string** contenant du JSON — pas encore un objet utilisable. C'est le rôle du nœud suivant.

---

## Nœud 3 — Parse & Merge (Code node)

**Type** : `n8n-nodes-base.code` v2
**Mode** : `runOnceForAllItems`

### Code complet annoté

````js
const json = $input.first().json;
// → reçoit { response: '{ "score": 75, ... }' } du nœud Claude

// Extraction du texte brut avec fallbacks défensifs :
// - json.response    : cas normal (includeMergedResponse: true)
// - json.text        : fallback si le nœud retourne autrement
// - json.content[..] : fallback sur le tableau de contenu brut
const rawText =
  json.response ??
  json.text ??
  (Array.isArray(json.content)
    ? json.content
        .filter((c) => c.type === "text")
        .map((c) => c.text)
        .join("")
    : JSON.stringify(json));

// Nettoyage : Claude peut entourer le JSON de balises markdown
// malgré la consigne, notamment sur les longues réponses.
// Ex: ```json\n{ ... }\n``` → on retire les délimiteurs
const cleaned = rawText
  .replace(/```json\s*/gi, "")
  .replace(/```\s*/g, "")
  .trim();

// Parsing : transforme la string en objet JavaScript
let parsed;
try {
  parsed = JSON.parse(cleaned);
} catch (e) {
  // Si Claude n'a pas respecté le format JSON, on échoue explicitement
  throw new Error("JSON invalide depuis Claude : " + rawText.substring(0, 300));
}

// Récupération des données brutes du formulaire
// (les données du webhook ne transitent pas automatiquement,
//  il faut les récupérer depuis le nœud source)
const body = $("Webhook").first().json.body;

// Fusion : on assemble le LeadWebhookPayload complet
// qui correspond exactement au type attendu par /api/leads
return [
  {
    json: {
      // Données du formulaire
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      company: body.company,
      sector: body.sector,
      main_need: body.main_need,
      budget_range: body.budget_range,
      source: body.source ?? null,
      // Données enrichies par Claude
      score: parsed.score, // number (0-100)
      enrichment: parsed.enrichment, // { sector_analysis, probable_needs, maturity_level, reasoning }
      email_draft: parsed.email_draft, // string (texte brut avec \n)
    },
  },
];
````

**Sortie** : un objet correspondant au type `LeadWebhookPayload` (`types/index.ts`).

---

## Nœud 4 — Save Lead (HTTP Request)

**Type** : `n8n-nodes-base.httpRequest` v4.4
**Méthode** : POST
**URL** : `https://lead-flow-tau.vercel.app/api/leads`
**Header** : `x-api-secret: <N8N_API_SECRET>`
**Body** : `JSON.stringify($json)` — le payload complet du nœud précédent

Le endpoint `/api/leads` (`app/api/leads/route.ts`) :

1. Valide le header `x-api-secret` via `crypto.timingSafeEqual`
2. Insère le lead dans Supabase (table `leads`) via le service client
3. Retourne `{ ok: true }` — **le $json suivant ne contient donc plus les données du lead**

> ⚠️ Le nœud suivant ne peut pas utiliser `$json` pour accéder aux données du lead — il doit utiliser `$('Parse & Merge').first().json`.

---

## Nœud 5 — Send Ack Email (Resend)

**Type** : `n8n-nodes-resend.resend` v1
**Credential** : `resendApi`

| Champ     | Valeur                                         |
| --------- | ---------------------------------------------- |
| `from`    | `contact@romainwirth.fr`                       |
| `to`      | `={{ $('Parse & Merge').first().json.email }}` |
| `subject` | `Votre demande a bien été reçue`               |
| `html`    | HTML dynamique (voir ci-dessous)               |

**Pourquoi référencer "Parse & Merge" et pas `$json`** : le nœud précédent (Save Lead) retourne `{ ok: true }`, donc `$json.email` serait `undefined`. On remonte directement au nœud qui détient les données complètes.

**Template HTML** :

```html
<p>Bonjour {{ first_name }},</p>
<p>
  Nous avons bien recu votre demande concernant :
  <strong>{{ main_need }}</strong>.
</p>
<p>Nous reviendrons vers vous dans les plus brefs delais.</p>
<p>Cordialement,<br />Romain Wirth</p>
```

---

## Variables d'environnement liées

| Variable             | Usage                                                |
| -------------------- | ---------------------------------------------------- |
| `N8N_WEBHOOK_URL`    | URL complète du webhook (dans `actions/form.ts`)     |
| `N8N_WEBHOOK_SECRET` | Validé par le credential Header Auth du nœud Webhook |
| `N8N_API_SECRET`     | Validé par `/api/leads` via `x-api-secret` header    |

---

## email_draft dans l'interface admin

Le champ `email_draft` généré par Claude est distinct de l'email d'accusé de réception envoyé automatiquement par n8n.

```
Claude → email_draft (string texte brut)
  → stocké en base Supabase (table leads)
  → affiché dans <EmailDraftEditor> (textarea éditable)
  → envoyé manuellement par l'admin via /api/send-email → Resend
```

C'est le brouillon de **prise de contact personnalisée** que l'admin lit, modifie si besoin, puis envoie depuis la fiche lead.
