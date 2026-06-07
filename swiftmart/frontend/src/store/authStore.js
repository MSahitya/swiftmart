import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken }),

      clearAuth: () =>
        set({ user: null, accessToken: null, refreshToken: null }),

      updateUser: (user) => set({ user }),
      updateTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      isAuthenticated: () => !!get().accessToken,
      isAdmin: () => get().user?.role === 'admin',
    }),
    {
      name: 'swiftmart-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
)
