import { getAuthToken, isAwsMode } from './amigoAuth'

type CloudMode = 'local-prototype' | 'aws-amplify'

const cloudMode = (import.meta.env.VITE_AMIGO_SYNC_MODE ?? 'local-prototype') as CloudMode
const apiUrl = import.meta.env.VITE_AMIGO_API_URL?.replace(/\/$/, '')

export type CloudPrototypeStatus = {
  title: string
  description: string
}

function loadLocal<T>(key: string, fallback: T): T {
  const savedValue = localStorage.getItem(key)

  if (!savedValue) {
    return fallback
  }

  try {
    return {
      ...fallback,
      ...(JSON.parse(savedValue) as Partial<T>),
    }
  } catch {
    return fallback
  }
}

function saveLocal(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

async function loadRemote<T>(key: string, fallback: T): Promise<T> {
  if (!isAwsMode() || !apiUrl) {
    return loadLocal(key, fallback)
  }

  const token = await getAuthToken()

  if (!token) {
    return loadLocal(key, fallback)
  }

  try {
    const response = await fetch(`${apiUrl}/sync?key=${encodeURIComponent(key)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      return loadLocal(key, fallback)
    }

    const payload = (await response.json()) as { value: Partial<T> | null }

    if (!payload.value) {
      return loadLocal(key, fallback)
    }

    const merged = {
      ...fallback,
      ...payload.value,
    }

    saveLocal(key, merged)
    return merged
  } catch {
    return loadLocal(key, fallback)
  }
}

async function saveRemote(key: string, value: unknown) {
  saveLocal(key, value)

  if (!isAwsMode() || !apiUrl) {
    return
  }

  const token = await getAuthToken()

  if (!token) {
    return
  }

  try {
    await fetch(`${apiUrl}/sync`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key, value }),
    })
  } catch {
    // Keep local copy if cloud sync fails.
  }
}

export const amigoCloud = {
  load<T>(key: string, fallback: T): T {
    return loadLocal(key, fallback)
  },

  async loadAsync<T>(key: string, fallback: T): Promise<T> {
    return loadRemote(key, fallback)
  },

  save(key: string, value: unknown) {
    void saveRemote(key, value)
  },
}

export function getCloudPrototypeStatus(): CloudPrototypeStatus {
  if (cloudMode === 'aws-amplify') {
    if (!apiUrl) {
      return {
        title: 'AWS mode needs API URL',
        description: 'Set VITE_AMIGO_API_URL in Amplify environment variables after deploying infra/template.yaml.',
      }
    }

    return {
      title: 'AWS sync enabled',
      description: 'Progress syncs to DynamoDB through API Gateway and Lambda after Cognito sign-in.',
    }
  }

  return {
    title: 'AWS-ready prototype',
    description: 'Progress is saved locally now. Deploy Amplify + SAM to turn on Cognito and DynamoDB sync.',
  }
}
