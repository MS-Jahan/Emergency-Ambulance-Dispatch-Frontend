import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { api } from './api'
import { useAuth } from './store'
import type {
  DashboardStats,
  DriverProfile,
  EmergencyRequest,
  Feedback,
  Hospital,
  NearbyAmbulance,
  Payment,
  PaginatedData,
  RequestStatus,
  Role,
  User,
} from '@/types/api'

// Auth queries
export function roleHome(role: Role): string {
  if (role === 'DRIVER') return '/driver'
  if (role === 'ADMIN') return '/admin'
  return '/dashboard'
}

export function useLogin() {
  const setUser = useAuth((s) => s.setUser)
  const router = useRouter()

  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.authPost<{ user: User }>('/login', data),
    onSuccess: (data) => {
      setUser(data.user)
      router.push(roleHome(data.user.role))
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
    }) => api.authPost<{ user: User }>('/register', data),
    onSuccess: (data) => {
      setUser(data.user)
      router.push(roleHome(data.user.role))
    },
  })
}

export function useDemoLogin() {
  const setUser = useAuth((s) => s.setUser)
  const router = useRouter()

  return useMutation({
    mutationFn: (role: 'PATIENT' | 'DRIVER' | 'ADMIN') =>
      api.authPost<{ user: User }>('/demo', { role }),
    onSuccess: (data) => {
      setUser(data.user)
      router.push(roleHome(data.user.role))
    },
  })
}

export function useLogout() {
  const logout = useAuth((s) => s.logout)
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => api.authPost('/logout'),
    onSuccess: () => {
      logout()
      queryClient.clear()
      router.push('/login')
    },
  })
}

export function useMe(opts?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => api.get<{ user: User }>('/users/me').then((d) => d.user),
    retry: false,
    enabled: opts?.enabled ?? true,
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

export function useRequestDetail(
  id: string,
  opts?: {
    refetchInterval?: number | false | ((query: { state: { data?: EmergencyRequest } }) => number | false | undefined)
  },
) {
  return useQuery({
    queryKey: ['requests', id],
    queryFn: () =>
      api.get<{ data: EmergencyRequest }>(`/requests/${id}`).then((d) => d.data),
    enabled: !!id,
    refetchInterval: opts?.refetchInterval as never,
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

export function useMyAssignedRequests(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['requests', 'assigned', page, limit],
    queryFn: () =>
      api.get<PaginatedData<EmergencyRequest>>(
        `/requests/my-assigned?page=${page}&limit=${limit}`,
      ),
    refetchInterval: 5000,
  })
}

export function useUpdateRequestStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RequestStatus }) =>
      api.patch(`/requests/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
    },
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
  opts?: {
    refetchInterval?:
      | number
      | false
      | ((query: { state: { data?: PaginatedData<EmergencyRequest> } }) => number | false | undefined)
  },
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
    refetchInterval: opts?.refetchInterval as never,
  })
}

export function useNearbyAmbulances(
  coords: { lat: number; lng: number; radiusKm?: number },
  opts?: { enabled?: boolean },
) {
  const params = new URLSearchParams({
    lat: String(coords.lat),
    lng: String(coords.lng),
    ...(coords.radiusKm && { radiusKm: String(coords.radiusKm) }),
  })
  return useQuery({
    queryKey: ['ambulances', 'nearby', coords.lat, coords.lng, coords.radiusKm ?? 10],
    queryFn: () =>
      api.get<{ items: NearbyAmbulance[] }>(`/ambulances/nearby?${params.toString()}`).then((d) => d.items),
    enabled: opts?.enabled ?? true,
  })
}

export function useAssignAmbulance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ requestId, ambulanceId }: { requestId: string; ambulanceId: string }) =>
      api.post<EmergencyRequest>(`/requests/${requestId}/assign`, { ambulanceId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'requests'] })
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      queryClient.invalidateQueries({ queryKey: ['ambulances'] })
    },
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

// Profile
export function useUpdateProfile() {
  const setUser = useAuth((s) => s.setUser)

  return useMutation({
    mutationFn: (data: { name?: string; phone?: string }) =>
      api.patch<{ user: User }>('/users/me', data).then((d) => d.user),
    onSuccess: (user) => setUser(user),
  })
}

// Feedback
export function useRequestFeedback(requestId: string) {
  return useQuery({
    queryKey: ['feedback', requestId],
    queryFn: () => api.get<Feedback[]>(`/feedback/request/${requestId}`),
    enabled: !!requestId,
  })
}

export function useSubmitFeedback() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { requestId: string; rating: number; comment?: string }) =>
      api.post<Feedback>('/feedback', data),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['feedback', vars.requestId] })
    },
  })
}
