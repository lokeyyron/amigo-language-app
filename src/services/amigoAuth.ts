import { Amplify } from 'aws-amplify'
import {
  fetchAuthSession,
  getCurrentUser,
  signIn,
  signOut,
  signUp,
} from 'aws-amplify/auth'

export function isAwsMode() {
  return (import.meta.env.VITE_AMIGO_SYNC_MODE ?? 'local-prototype') === 'aws-amplify'
}

export function configureAmigoAuth() {
  if (!isAwsMode()) {
    return
  }

  const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID
  const userPoolClientId = import.meta.env.VITE_COGNITO_CLIENT_ID

  if (!userPoolId || !userPoolClientId) {
    console.warn('AWS mode is enabled but Cognito env vars are missing.')
    return
  }

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId,
      },
    },
  })
}

export async function checkLoggedIn() {
  if (!isAwsMode()) {
    return false
  }

  try {
    await getCurrentUser()
    return true
  } catch {
    return false
  }
}

export async function loginWithEmail(email: string, password: string) {
  const result = await signIn({
    username: email.trim(),
    password,
  })

  return result
}

export async function registerWithEmail(email: string, password: string) {
  const result = await signUp({
    username: email.trim(),
    password,
    options: {
      userAttributes: {
        email: email.trim(),
      },
    },
  })

  return result
}

export async function logoutFromAmigo() {
  if (!isAwsMode()) {
    return
  }

  await signOut()
}

export async function getAuthToken() {
  if (!isAwsMode()) {
    return null
  }

  const session = await fetchAuthSession()
  return session.tokens?.idToken?.toString() ?? null
}
