const WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n-n8n.2t5itn.easypanel.host/webhook/semaphore-alert'

export type NotifyEvent =
  | 'claimed'
  | 'released'
  | 'waitlist_joined'
  | 'waitlist_left'
  | 'auto_claimed'

function buildMessage(event: NotifyEvent, userName: string, envName: string, waitlist?: string[]): string {
  switch (event) {
    case 'claimed':
      return `🟡 ${userName} está usando ${envName}`
    case 'released':
      return `🟢 ${userName} liberó ${envName}`
    case 'waitlist_joined':
      return `⏳ ${userName} está esperando para usar ${envName}`
    case 'waitlist_left':
      return `👋 ${userName} dejó la espera de ${envName}`
    case 'auto_claimed':
      return `🔄 ${userName} tomó ${envName} automáticamente desde la waitlist`
  }
}

export async function notifyTeams(event: NotifyEvent, userName: string, envName: string, waitlist?: string[]) {
  const message = buildMessage(event, userName, envName, waitlist)

  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    })
  } catch (error) {
    console.error('Failed to send Teams notification:', error)
  }
}
