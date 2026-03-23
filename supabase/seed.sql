-- LeadFlow — Seed données démo
-- À exécuter après schema.sql dans Supabase SQL Editor

INSERT INTO leads (
  first_name, last_name, email, company, sector, main_need,
  budget_range, source, score, status, is_demo, enrichment, email_draft,
  created_at
) VALUES

-- 1. Qualifié, score élevé
(
  'Sophie', 'Marchand', 'sophie.marchand@nexvia.fr', 'Nexvia', 'SaaS B2B',
  'Nous cherchons à automatiser notre processus de qualification des leads entrants. Aujourd''hui tout est manuel, on perd beaucoup de temps.',
  '15k-50k', 'LinkedIn', 88, 'qualified', true,
  '{"sector_analysis": "Éditeur SaaS B2B en phase de scale, probablement entre 20 et 80 collaborateurs. Fort enjeu sur la vélocité commerciale.", "probable_needs": ["Automatisation du scoring", "Intégration CRM", "Tableau de bord temps réel"], "maturity_level": "high", "reasoning": "Vocabulaire technique précis, budget confortable, besoin clairement articulé. Cycle de vente probablement court."}',
  'Bonjour Sophie,

Merci pour votre message — votre problématique d''automatisation des leads est exactement ce que nous résolvons chez LeadFlow.

J''ai pris le temps de regarder Nexvia : votre positionnement SaaS B2B avec une équipe commerciale en croissance rend ce type d''outil particulièrement rentable rapidement.

Je vous propose un appel de 30 min cette semaine pour vous montrer comment nos clients similaires ont divisé par 3 leur temps de traitement des leads. Vous seriez disponible jeudi ou vendredi matin ?

Cordialement',
  now() - interval '2 days'
),

-- 2. Contacté, score moyen-haut
(
  'Thomas', 'Lefebvre', 't.lefebvre@groupeabc.com', 'Groupe ABC Conseil', 'Conseil RH',
  'On veut mettre en place un CRM pour suivre nos prospects grands comptes. On n''a rien de structuré pour l''instant.',
  '5k-15k', 'Recommandation', 72, 'contacted', true,
  '{"sector_analysis": "Cabinet de conseil RH, vraisemblablement 10-30 consultants. Cycle de vente long, décision collégiale probable.", "probable_needs": ["Structuration du pipeline", "Suivi des relances", "Reporting direction"], "maturity_level": "medium", "reasoning": "Absence totale d''outil actuel = opportunité claire mais aussi risque de projet long à convaincre. Budget serré pour la taille présumée."}',
  'Bonjour Thomas,

Merci pour votre confiance via la recommandation de votre contact.

La situation que vous décrivez — absence d''outil structuré pour les grands comptes — est un point de douleur que nous entendons souvent dans le conseil. Le risque : des opportunités qui se perdent faute de suivi.

Nous avons accompagné plusieurs cabinets RH dans cette transition. Je vous propose de vous envoyer une démo enregistrée adaptée à votre contexte, puis de faire un point ensemble si cela vous parle.

Bien cordialement',
  now() - interval '5 days'
),

-- 3. Nouveau, score élevé
(
  'Camille', 'Rousseau', 'c.rousseau@clinique-lumiere.fr', 'Clinique Lumière', 'Santé',
  'Gestion des demandes de prise en charge et suivi des dossiers patients en attente. Processus actuellement par email, très chronophage.',
  '15k-50k', 'Google', 79, 'new', true,
  '{"sector_analysis": "Clinique privée, contraintes réglementaires fortes (RGPD santé). Décideur probablement directeur administratif ou médical.", "probable_needs": ["Dématérialisation des dossiers entrants", "Suivi de statut automatisé", "Conformité RGPD"], "maturity_level": "high", "reasoning": "Besoin très concret et chiffrable en temps perdu. Budget adapté au secteur. Vigilance sur la conformité données de santé à mentionner en premier appel."}',
  'Bonjour Camille,

Votre demande est claire et le problème bien identifié : la gestion des prises en charge par email n''est pas scalable et expose à des erreurs.

Nous travaillons avec des établissements de santé et nous sommes parfaitement au fait des exigences RGPD pour les données de santé — c''est une question que je souhaitais aborder dès le départ pour vous rassurer.

Seriez-vous disponible cette semaine pour un échange de 20 minutes ?

Cordialement',
  now() - interval '1 day'
),

-- 4. Perdu, score faible
(
  'Marc', 'Dupont', 'marc.dupont@bricotout.fr', 'BricoTout', 'Retail',
  'On cherche un outil pour gérer les réclamations clients. On a beaucoup de retours produits à gérer.',
  '<5k', 'Publicité en ligne', 18, 'lost', true,
  '{"sector_analysis": "Commerce de détail, probablement TPE. Besoin orienté SAV, pas vraiment dans notre cible.", "probable_needs": ["Ticketing SAV", "Suivi retours"], "maturity_level": "low", "reasoning": "Budget très limité, besoin éloigné de notre cœur de métier (qualification de leads). Mauvais fit produit."}',
  'Bonjour Marc,

Merci pour votre message.

Après analyse de votre demande, je dois être honnête avec vous : notre solution est davantage orientée qualification et gestion de prospects B2B, ce qui ne correspond pas exactement à votre besoin de gestion des réclamations clients.

Je vous recommande plutôt de regarder des outils comme Freshdesk ou Zendesk qui sont très bien adaptés à votre contexte.

Bonne continuation',
  now() - interval '10 days'
),

-- 5. Qualifié, score très élevé
(
  'Isabelle', 'Moreau', 'i.moreau@proptech-immo.com', 'PropTech Immo', 'Immobilier',
  'Nous développons une plateforme de mise en relation acheteurs/vendeurs. Il nous faut un système robuste pour qualifier et scorer les leads entrants automatiquement.',
  '>50k', 'Événement', 92, 'qualified', true,
  '{"sector_analysis": "Startup PropTech en phase de croissance, vraisemblablement levée de fonds récente. Fort enjeu de volume et d''automatisation.", "probable_needs": ["Scoring automatique haute fréquence", "API d''intégration", "Dashboard analytique avancé"], "maturity_level": "high", "reasoning": "Vocabulaire très technique, budget sans contrainte apparente, besoin précis et urgent. Lead idéal. Décision rapide probable."}',
  'Bonjour Isabelle,

Votre projet est exactement dans notre zone d''excellence : qualification automatisée à fort volume pour une plateforme de mise en relation.

J''ai quelques questions techniques sur vos volumes actuels et votre stack existante qui me permettraient de vous préparer une proposition vraiment calibrée.

Pouvez-vous m''indiquer vos disponibilités cette semaine ? Je bloque 45 minutes pour un appel de découverte approfondi.

Très cordialement',
  now() - interval '3 days'
),

-- 6. Nouveau, score moyen
(
  'Antoine', 'Bernard', 'antoine.bernard@restogroup.fr', 'RestoGroup', 'Restauration',
  'On gère 8 restaurants et on cherche à mieux suivre nos partenariats B2B (traiteurs, événements d''entreprise). Beaucoup d''opportunités qui nous échappent.',
  '5k-15k', 'Bouche-à-oreille', 54, 'new', true,
  '{"sector_analysis": "Groupe de restauration multi-sites, développement B2B nascent. Potentiel si le segment événementiel est prioritaire.", "probable_needs": ["Suivi des opportunités B2B", "Relances automatisées", "Pipeline par restaurant"], "maturity_level": "medium", "reasoning": "Besoin réel mais périmètre flou. À clarifier : est-ce que le B2B est stratégique ou secondaire pour eux ? Budget cohérent."}',
  'Bonjour Antoine,

Votre cas est intéressant : 8 établissements, des opportunités B2B qui existent mais ne sont pas capturées — c''est souvent là que se joue la croissance dans la restauration.

Avant de vous proposer quoi que ce soit, j''aurais quelques questions pour bien comprendre votre organisation : qui gère actuellement ces contacts B2B ? Est-ce centralisé ou par restaurant ?

Bien cordialement',
  now() - interval '7 days'
),

-- 7. Contacté, score moyen-bas
(
  'Julie', 'Petit', 'julie.petit@atelierdesign.co', 'Atelier Design Co.', 'Design & Agence créative',
  'Petite agence de 5 personnes, on voudrait mieux suivre nos prospects et ne plus perdre des devis dans les emails.',
  '5k-15k', 'Podcast', 41, 'contacted', true,
  '{"sector_analysis": "Micro-agence créative, budget serré, décision solo probable. Cycle de vente court mais valeur contrat limitée.", "probable_needs": ["Pipeline simple", "Rappels de relance", "Centralisation des devis"], "maturity_level": "low", "reasoning": "Besoin simple et légitime mais risque de sur-engineer la solution. À qualifier sur la valeur average des contrats pour évaluer le ROI."}',
  'Bonjour Julie,

Merci pour votre message — vous avez découvert LeadFlow via le podcast, c''est cool !

Pour une agence de votre taille, l''enjeu c''est d''avoir quelque chose de simple à maintenir, pas un outil usine à gaz. C''est précisément ce qu''on a essayé de construire.

Je vous propose une démo de 20 minutes en visio pour voir si ça correspond à ce que vous cherchez. Quand êtes-vous disponible ?

À bientôt',
  now() - interval '4 days'
),

-- 8. Nouveau, score élevé
(
  'Nicolas', 'Girard', 'n.girard@batipro-construction.fr', 'BatiPro Construction', 'BTP',
  'On répond à beaucoup d''appels d''offres et on n''a aucun outil pour suivre nos chances de succès ou prioriser. On loupe sûrement des opportunités.',
  '15k-50k', 'Google', 67, 'new', true,
  '{"sector_analysis": "PME BTP, 30-100 personnes probable. Les appels d''offres comme source principale de leads est un use case spécifique à valider.", "probable_needs": ["Scoring des AO par probabilité de succès", "Suivi du pipeline commercial", "Alertes et prioritisation"], "maturity_level": "medium", "reasoning": "Problème clair et coûteux. Budget adapté. À explorer : volume d''AO traités par mois pour évaluer la pertinence du scoring automatique."}',
  'Bonjour Nicolas,

Le suivi des appels d''offres sans outil dédié, c''est beaucoup d''énergie dépensée sans visibilité sur ce qui vaut vraiment la peine.

Nous avons quelques clients dans le secteur construction qui utilisent notre scoring pour prioriser leurs réponses. Je serais curieux de comparer votre situation avec la leur.

Avez-vous 30 minutes cette semaine pour qu''on explore ça ensemble ?

Cordialement',
  now() - interval '6 hours'
),

-- 9. Nouveau, score faible
(
  'Élodie', 'Simon', 'elodie.simon@freelance-compta.fr', 'Élodie Simon — Comptabilité', 'Comptabilité & Finance',
  'Je suis auto-entrepreneur et j''aimerais un outil simple pour gérer mes prospects. Je contacte 3-4 clients potentiels par mois.',
  '<5k', 'Réseaux sociaux', 22, 'new', true,
  '{"sector_analysis": "Auto-entrepreneur, volume très faible, budget minimal. Pas dans notre cible idéale.", "probable_needs": ["CRM minimaliste"], "maturity_level": "low", "reasoning": "3-4 prospects par mois ne justifient pas notre solution. Un simple spreadsheet ou Notion suffirait. Mauvais fit."}',
  'Bonjour Élodie,

Merci pour votre message.

Pour 3-4 prospects par mois, je vais être direct : notre outil serait surdimensionné et probablement pas rentable pour vous. Un outil comme Notion ou même un Google Sheet bien structuré répondrait parfaitement à votre besoin pour commencer.

Si votre activité se développe et que les volumes augmentent, n''hésitez pas à revenir vers nous !

Bonne continuation',
  now() - interval '12 days'
);
