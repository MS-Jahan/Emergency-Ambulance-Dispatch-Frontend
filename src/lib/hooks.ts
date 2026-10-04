import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { api } from './api'
import { useAuth } from './store'
import type {
  AuthResponse,
  DashboardStats,
  DriverProfile,
  EmergencyRequest,
  Hospital,
  Payment,
  PaginatedData,
  User,
} from '@/types/api'

// Auth queries
export function useLogin() {
  const setUser = useAuth((s) => s.setUser)
  const router = useRouter()

  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.post<AuthResponse>('/auth/login', data),
    onSuccess: (data) => {
      setUser(data.user)
      router.push('/dashboard')
    },
  })
}

export function useRegister() {
  const setUser = useAuth((s) => s.setUser)
  const router = useRouter()

  return useMutation({
    mutationFn: (data: {
      name: string
      email: string
      password: string
      phone?: string
    }) => api.post<AuthResponse>('/auth/register', data),
    onSuccess: (data) => {
      setUser(data.user)
      router.push('/dashboard')
    },
  })
}

export function useDemoLogin() {
  const setUser = useAuth((s) => s.setUser)
  const router = useRouter()

  return useMutation({
    mutationFn: (role: 'PATIENT' | 'DRIVER' | 'ADMIN') =>
      api.post<AuthResponse>('/auth/demo', { role }),
    onSuccess: (data) => {
      setUser(data.user)
      router.push(
        data.user.role === 'PATIENT'
          ? '/dashboard'
          : data.user.role === 'DRIVER'
            ? '/driver'
            : '/admin',
      )
    },
  })
}

export function useLogout() {
  const logout = useAuth((s) => s.logout)
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (refreshToken?: string) =>
      api.post('/auth/logout', { refreshToken }),
    onSuccess: () => {
      logout()
      queryClient.clear()
      router.push('/login')
    },
  })
}

export function useMe() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => api.get<{ user: User }>('/users/me').then((d) => d.user),
    retry: false,
  })
}

// Patient queries
export function useCreateRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      pickupAddress: string
      pickupLat: number
      pickupLng: number
      priority?: string
      destinationHospitalId?: string
    }) => api.post<EmergencyRequest>('/requests', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
    },
  })
}

export function useMyRequests(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['requests', 'my', page, limit],
    queryFn: () =>
      api.get<PaginatedData<EmergencyRequest>>(
        `/requests?page=${page}&limit=${limit}`,
      ),
  })
}

export function useRequestDetail(id: string) {
  return useQuery({
    queryKey: ['requests', id],
    queryFn: () =>
      api.get<{ data: EmergencyRequest }>(`/requests/${id}`).then((d) => d.data),
    enabled: !!id,
  })
}

export function useCancelRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post(`/requests/${id}/cancel`, { cancelReason: reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
    },
  })
}

export function useMyPayments(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['payments', 'my', page, limit],
    queryFn: () =>
      api.get<PaginatedData<Payment>>(`/payments/my?page=${page}&limit=${limit}`),
  })
}

export function useInitiatePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (requestId: string) =>
      api.post<{ payment: Payment; checkoutUrl: string }>('/payments/initiate', {
        requestId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
    },
  })
}

// Driver queries
export function useMyDriverProfile() {
  return useQuery({
    queryKey: ['driver', 'me'],
    queryFn: () =>
      api.get<{ data: DriverProfile }>('/driver/me').then((d) => d.data),
  })
}

export function useUpdateDriverStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (status: string) =>
      api.patch('/driver/status', { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver', 'me'] })
    },
  })
}

export function useUpdateDriverLocation() {
  return useMutation({
    mutationFn: ({ lat, lng }: { lat: number; lng: number }) =>
      api.patch('/driver/location', { lat, lng }),
  })
}

// Admin queries
export function useDashboardStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.get<DashboardStats>('/admin/dashboard-stats'),
  })
}

export function useAdminRequests(
  page = 1,
  limit = 10,
  filters?: { status?: string; priority?: string },
) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(filters?.status && { status: filters.status }),
    ...(filters?.priority && { priority: filters.priority }),
  })

  return useQuery({
    queryKey: ['admin', 'requests', page, limit, filters],
    queryFn: () =>
      api.get<PaginatedData<EmergencyRequest>>(
        `/requests?${params.toString()}`,
      ),
  })
}

// Public queries
export function useHospitals() {
  return useQuery({
    queryKey: ['hospitals'],
    queryFn: () =>
      api.get<PaginatedData<Hospital>>('/hospitals?limit=100').catch(() => ({
        items: [],
        meta: { page: 1, limit: 100, total: 0, totalPages: 0 },
      })),
  })
}
