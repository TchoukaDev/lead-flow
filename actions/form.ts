'use server'

export async function submitLead(formData: FormData) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL

  const email = formData.get('email') as string
  const main_need = formData.get('main_need') as string
  const budget_range = formData.get('budget_range') as string

  const VALID_BUDGETS = ['<5k', '5k-15k', '15k-50k', '>50k']
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  if (!emailValid) {
    return { error: 'Adresse email invalide.' }
  }
  if (!VALID_BUDGETS.includes(budget_range)) {
    return { error: 'Budget invalide.' }
  }
  if (main_need.length > 2000) {
    return { error: 'Le champ "besoin principal" ne peut pas dépasser 2000 caractères.' }
  }

  const payload = {
    first_name: formData.get('first_name') as string,
    last_name: formData.get('last_name') as string,
    email,
    company: formData.get('company') as string,
    sector: formData.get('sector') as string,
    main_need,
    budget_range,
    source: (formData.get('source') as string) || null,
  }

  if (!webhookUrl) {
    // N8N_WEBHOOK_URL non configuré — succès simulé en dev
    console.log('[dev] Payload lead:', payload)
    return { success: true }
  }

  const webhookSecret = process.env.N8N_WEBHOOK_SECRET

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(webhookSecret ? { 'x-webhook-secret': webhookSecret } : {}),
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      return { error: 'Une erreur est survenue. Veuillez réessayer.' }
    }

    return { success: true }
  } catch {
    return { error: 'Impossible de contacter le serveur. Veuillez réessayer.' }
  }
}
