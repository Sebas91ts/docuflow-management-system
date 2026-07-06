import { createContext, useCallback, useEffect, useMemo, useState } from 'react'

import { getCurrentUser, loginUser } from '../api/authApi'
import { deleteCookie, getCookie, setCookie } from '../utils/cookies'
import { clearStoredUser, getStoredUser, storeUser } from '../utils/sessionStorage'

const ACCESS_TOKEN_COOKIE = 'docuflow_access_token'
const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 2

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser())
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  const clearSession = useCallback(() => {
    deleteCookie(ACCESS_TOKEN_COOKIE)
    clearStoredUser()
    setCurrentUser(null)
  }, [])

  const refreshCurrentUser = useCallback(async () => {
    const token = getCookie(ACCESS_TOKEN_COOKIE)

    if (!token) {
      clearSession()
      return null
    }

    try {
      const user = await getCurrentUser()
      storeUser(user)
      setCurrentUser(user)
      return user
    } catch {
      clearSession()
      return null
    }
  }, [clearSession])

  const login = useCallback(async (credentials) => {
    const session = await loginUser(credentials)
    setCookie(ACCESS_TOKEN_COOKIE, session.access_token, ACCESS_TOKEN_MAX_AGE_SECONDS)
    storeUser(session.user)
    setCurrentUser(session.user)
    return session.user
  }, [])

  const logout = useCallback(() => {
    clearSession()
  }, [clearSession])

  useEffect(() => {
    refreshCurrentUser().finally(() => setIsBootstrapping(false))
  }, [refreshCurrentUser])

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      isBootstrapping,
      login,
      logout,
      refreshCurrentUser,
    }),
    [currentUser, isBootstrapping, login, logout, refreshCurrentUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
