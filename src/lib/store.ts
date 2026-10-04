import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types/api'

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  logout: () => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,
      setUser: (user) => set({ user, error: null }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      logout: () => set({ user: null, error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    },
  ),
)

interface UIState {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
}

export const useUI = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ui-storage',
    },
  ),
)

interface WizardState {
  pickupAddress: string
  pickupLat: number | null
  pickupLng: number | null
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL'
  hospitalId: string | null
  step: 1 | 2 | 3
  setPickupAddress: (address: string) => void
  setPickupLocation: (lat: number, lng: number) => void
  setPriority: (priority: 'CRITICAL' | 'HIGH' | 'NORMAL') => void
  setHospitalId: (id: string | null) => void
  setStep: (step: 1 | 2 | 3) => void
  reset: () => void
}

export const useRequestWizard = create<WizardState>()(
  persist(
    (set) => ({
      pickupAddress: '',
      pickupLat: null,
      pickupLng: null,
      priority: 'NORMAL',
      hospitalId: null,
      step: 1,
      setPickupAddress: (pickupAddress) => set({ pickupAddress }),
      setPickupLocation: (pickupLat, pickupLng) => set({ pickupLat, pickupLng }),
      setPriority: (priority) => set({ priority }),
      setHospitalId: (hospitalId) => set({ hospitalId }),
      setStep: (step) => set({ step }),
      reset: () =>
        set({
          pickupAddress: '',
          pickupLat: null,
          pickupLng: null,
          priority: 'NORMAL',
          hospitalId: null,
          step: 1,
        }),
    }),
    {
      name: 'wizard-storage',
    },
  ),
)
