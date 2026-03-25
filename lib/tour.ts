import type { DriveStep } from 'driver.js'

export const TOUR_STORAGE_KEY = 'leadflow_tour_done'

export const tourSteps: DriveStep[] = [
  {
    element: '#leads-table',
    popover: {
      title: 'Votre pipeline de leads',
      description:
        "Des leads ont été automatiquement capturés, enrichis et scorés par l'IA. Ils apparaissent ici",
    },
  },
  {
    element: '#score-badge',
    popover: {
      title: 'Score de qualification IA',
      description:
        'Chaque lead reçoit un score de 0 à 100 selon son potentiel de conversion.',
    },
  },
  {
    element: '#status-badge',
    popover: {
      title: 'Statut commercial',
      description:
        'Suivez chaque opportunité : Nouveau → Contacté → Qualifié → Perdu.',
    },
  },
  {
    element: '#lead-row-first',
    popover: {
      title: 'Fiche lead détaillée',
      description:
        "Cliquez sur un lead pour voir l'analyse complète et le brouillon d'email prêt à envoyer.",
      side: 'top',
    },
  },
  {
    element: '#create-lead-btn',
    popover: {
      title: 'Testez avec vos vraies infos',
      description:
        'Soumettez votre propre lead et voyez-le apparaître ici en temps réel après enrichissement IA.',
      side: 'bottom',
    },
  },
]
