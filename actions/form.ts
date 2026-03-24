'use server'

export async function submitLead(formData: FormData) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL

  const payload = {
    first_name: formData.get('first_name') as string,
    last_name: formData.get('last_name') as string,
    email: formData.get('email') as string,
    company: formData.get('company') as string,
    sector: formData.get('sector') as string,
    main_need: formData.get('main_need') as string,
    budget_range: formData.get('budget_range') as string,
    source: (formData.get('source') as string) || null,
  }

  if (!webhookUrl) {
    // N8N_WEBHOOK_URL non configuré — succès simulé en dev
    console.log('[dev] Payload lead:', payload)
    return { success: true }
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const body = await response.text().catch(() => '(unreadable)')
      console.error('[submitLead] n8n error', { status: response.status, body })
      return { error: 'Une erreur est survenue. Veuillez réessayer.' }
    }

    return { success: true }
  } catch {
    return { error: 'Impossible de contacter le serveur. Veuillez réessayer.' }
  }
}
