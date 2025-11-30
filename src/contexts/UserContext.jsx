import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as authService from '../services/authService'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Charger l'utilisateur au démarrage
  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
    setIsLoading(false)
  }, [])

  // Inscription
  const register = useCallback((pseudo, password) => {
    const result = authService.register(pseudo, password)
    if (result.success) {
      setUser(result.user)
    }
    return result
  }, [])

  // Connexion
  const login = useCallback((pseudo, password) => {
    const result = authService.login(pseudo, password)
    if (result.success) {
      setUser(result.user)
    }
    return result
  }, [])

  // Déconnexion
  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
  }, [])

  // Mettre à jour les données utilisateur (sauvegarde en live)
  const updateUser = useCallback((updates) => {
    const updated = authService.updateUserData(updates)
    if (updated) {
      setUser(updated)
    }
    return updated
  }, [])

  // Mettre à jour un module spécifique
  const updateModule = useCallback((moduleName, data) => {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) return null

    const moduleData = { ...currentUser[moduleName], ...data }
    const updated = authService.updateModuleData(moduleName, moduleData)
    if (updated) {
      setUser(updated)
    }
    return updated
  }, [])

  // Mettre à jour les settings
  const updateSettings = useCallback((newSettings) => {
    if (user) {
      const mergedSettings = { ...user.settings, ...newSettings }
      const updated = authService.updateSettings(mergedSettings)
      if (updated) {
        setUser(updated)
      }
      return updated
    } else {
      // Mode invité
      const currentSettings = authService.getSettings()
      const mergedSettings = { ...currentSettings, ...newSettings }
      authService.saveSettings(mergedSettings)
      return mergedSettings
    }
  }, [user])

  // Obtenir les settings (connecté ou invité)
  const getSettings = useCallback(() => {
    return authService.getSettings()
  }, [])

  // Obtenir les données d'un module
  const getModuleData = useCallback((moduleName) => {
    if (!user) return null
    return user[moduleName] || null
  }, [user])

  const value = {
    user,
    isLoading,
    isLoggedIn: !!user,
    register,
    login,
    logout,
    updateUser,
    updateModule,
    updateSettings,
    getSettings,
    getModuleData,
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export default UserContext
