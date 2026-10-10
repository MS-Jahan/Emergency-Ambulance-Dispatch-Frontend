import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { api, ApiError } from './api'
import { useAuth } from './store'
import type {
  AdminFeedbackItem,
  AdminUser,
  DriverStats,
  PublicStats,
  ReportSummary,
  Ambulance,
  AmbulanceType,
  AuditLog,
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
      requestedAmbulanceType?: AmbulanceType
      patientName?: string
      patientAge?: number
      notes?: string
      callbackPhone?: string
    }) =>
      api
        .post<{ request: EmergencyRequest }>('/requests', data)
        .then((d) => d.request),
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
      api.get<{ request: EmergencyRequest }>(`/requests/${id}`).then((d) => d.request),
    enabled: !!id,
    refetchInterval: opts?.refetchInterval as never,
    retry: (failureCount, error) => {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403 || error.status === 404)
      ) {
        return false
      }
      return failureCount < 1
    },
  })
}

export function useCancelRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post(`/requests/${id}/cancel`, { cancelReason: reason }),
    onMutate: async ({ id, reason }) => {
      await queryClient.cancelQueries({ queryKey: ['requests', id] })
      const prevDetail = queryClient.getQueryData(['requests', id])
      queryClient.setQueryData(['requests', id], (old: EmergencyRequest | undefined) =>
        old ? { ...old, status: 'CANCELLED' as RequestStatus, cancelReason: reason } : old,
      )
      return { prevDetail }
    },
    onError: (_err, { id }, context) => {
      if (context?.prevDetail) {
        queryClient.setQueryData(['requests', id], context.prevDetail)
      }
    },
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      queryClient.invalidateQueries({ queryKey: ['requests', id] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'requests'] })
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
      api.get<{ profile: DriverProfile }>('/driver/me').then((d) => d.profile),
  })
}

export function useUpdateDriverStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (status: string) =>
      api.patch('/driver/status', { status }),
    onMutate: async (status: string) => {
      await queryClient.cancelQueries({ queryKey: ['driver', 'me'] })
      const prevProfile = queryClient.getQueryData<DriverProfile>(['driver', 'me'])
      queryClient.setQueryData(['driver', 'me'], (old: DriverProfile | undefined) =>
        old ? { ...old, status: status as DriverProfile['status'] } : old,
      )
      return { prevProfile }
    },
    onError: (_err, _vars, context) => {
      if (context?.prevProfile) {
        queryClient.setQueryData(['driver', 'me'], context.prevProfile)
      }
    },
    onSettled: () => {
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

export function useMyAssignedRequests(
  page = 1,
  limit = 20,
  filters: { status?: string; q?: string; from?: string; to?: string } = {},
) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  for (const [k, v] of Object.entries(filters)) if (v) params.set(k, v)
  return useQuery({
    queryKey: ['requests', 'assigned', page, limit, filters],
    queryFn: () =>
      api.get<PaginatedData<EmergencyRequest>>(`/requests/my-assigned?${params.toString()}`),
    refetchInterval: 5000,
  })
}

export function useDriverStats() {
  return useQuery({
    queryKey: ['driver', 'stats'],
    queryFn: () => api.get<{ stats: DriverStats }>('/driver/me/stats').then((d) => d.stats),
  })
}

export function usePublicStats() {
  return useQuery({
    queryKey: ['public', 'stats'],
    queryFn: () => api.get<{ stats: PublicStats }>('/public/stats').then((d) => d.stats),
    staleTime: 60_000,
    retry: false,
  })
}

export function useReportSummary(from?: string, to?: string) {
  const params = new URLSearchParams()
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  return useQuery({
    queryKey: ['admin', 'report-summary', from, to],
    queryFn: () =>
      api
        .get<{ summary: ReportSummary }>(`/admin/reports/summary?${params.toString()}`)
        .then((d) => d.summary),
  })
}

export function useAdminFeedback(page = 1, limit = 5) {
  return useQuery({
    queryKey: ['admin', 'feedback', page, limit],
    queryFn: () =>
      api.get<PaginatedData<AdminFeedbackItem>>(`/admin/feedback?page=${page}&limit=${limit}`),
  })
}

export function useUpdateRequestStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RequestStatus }) =>
      api.patch(`/requests/${id}/status`, { status }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['requests', id] })
      await queryClient.cancelQueries({ queryKey: ['requests', 'assigned'] })
      const prevDetail = queryClient.getQueryData(['requests', id])
      queryClient.setQueryData(['requests', id], (old: EmergencyRequest | undefined) =>
        old ? { ...old, status } : old,
      )
      return { prevDetail }
    },
    onError: (_err, { id }, context) => {
      if (context?.prevDetail) {
        queryClient.setQueryData(['requests', id], context.prevDetail)
      }
    },
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      queryClient.invalidateQueries({ queryKey: ['requests', id] })
      queryClient.invalidateQueries({ queryKey: ['requests', 'assigned'] })
    },
  })
}

// Admin queries
export function useDashboardStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () =>
      api
        .get<{ stats: DashboardStats }>('/admin/dashboard-stats')
        .then((d) => ({
          ...d.stats,
          // backend serialises the revenue sum as a string
          revenue: { paidTotal: Number(d.stats.revenue.paidTotal) },
        })),
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
  coords: { lat: number; lng: number; radiusKm?: number; type?: AmbulanceType },
  opts?: { enabled?: boolean },
) {
  const params = new URLSearchParams({
    lat: String(coords.lat),
    lng: String(coords.lng),
    ...(coords.radiusKm && { radiusKm: String(coords.radiusKm) }),
    ...(coords.type && { type: coords.type }),
  })
  return useQuery({
    queryKey: ['ambulances', 'nearby', coords.lat, coords.lng, coords.radiusKm ?? 10, coords.type],
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

export function useAdminAmbulances(page = 1, limit = 50) {
  return useQuery({
    queryKey: ['ambulances', 'admin', page, limit],
    queryFn: () =>
      api.get<PaginatedData<Ambulance>>(`/ambulances?page=${page}&limit=${limit}`),
  })
}

export function useCreateAmbulance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      plateNumber: string
      type: string
      homeHospitalId?: string
    }) => api.post<Ambulance>('/ambulances', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ambulances'] })
    },
  })
}

export function useUpdateAmbulance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string
      type?: string
      status?: string
      homeHospitalId?: string | null
    }) => api.patch<Ambulance>(`/ambulances/${id}`, data),
    onMutate: async ({ id, ...data }) => {
      await queryClient.cancelQueries({ queryKey: ['ambulances'] })
      const prevAmbulances = queryClient.getQueriesData({ queryKey: ['ambulances'] })
      queryClient.setQueriesData(
        { queryKey: ['ambulances'] },
        (old: PaginatedData<Ambulance> | undefined) => {
          if (!old?.items) return old
          return {
            ...old,
            items: old.items.map((item) =>
              item.id === id ? { ...item, ...data } : item,
            ),
          }
        },
      )
      return { prevAmbulances }
    },
    onError: (_err, _vars, context) => {
      if (context?.prevAmbulances) {
        for (const [key, val] of context.prevAmbulances) {
          queryClient.setQueryData(key, val)
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['ambulances'] })
    },
  })
}

export function useDeleteAmbulance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete(`/ambulances/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ambulances'] })
    },
  })
}

export function useCreateHospital() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      name: string
      address: string
      lat: number
      lng: number
      phone: string
    }) => api.post<Hospital>('/hospitals', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospitals'] })
    },
  })
}

export function useDeleteHospital() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete(`/hospitals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospitals'] })
    },
  })
}

export function useAdminUsers(
  page = 1,
  filters?: { role?: string; q?: string },
) {
  const params = new URLSearchParams({
    page: String(page),
    limit: '50',
    ...(filters?.role && { role: filters.role }),
    ...(filters?.q && { q: filters.q }),
  })
  return useQuery({
    queryKey: ['admin', 'users', page, filters],
    queryFn: () => api.get<PaginatedData<AdminUser>>(`/admin/users?${params.toString()}`),
  })
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) =>
      api.patch<{ user: AdminUser }>(`/admin/users/${id}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export function useCreateDriver() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      name: string
      email: string
      password: string
      phone: string
      licenseNumber: string
    }) => api.post('/admin/drivers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export function useAuditLogs(page = 1, requestId?: string) {
  const params = new URLSearchParams({
    page: String(page),
    limit: '50',
    ...(requestId && { requestId }),
  })
  return useQuery({
    queryKey: ['admin', 'audit-logs', page, requestId],
    queryFn: () =>
      api.get<PaginatedData<AuditLog>>(`/admin/audit-logs?${params.toString()}`),
  })
}

// Stripe redirects back to /payment/* with the checkout session id; the
// callback endpoints resolve the payment behind it. No auth required.
// 'cancel' also expires the stripe session so the link can't be reused.
export function usePaymentBySession(
  sessionId?: string,
  endpoint: 'success' | 'cancel' = 'success',
) {
  return useQuery({
    queryKey: ['payments', 'session', endpoint, sessionId],
    queryFn: () =>
      api
        .get<{ payment: Payment }>(
          `/payments/callback/${endpoint}?sessionId=${sessionId}`,
        )
        .then((d) => d.payment),
    enabled: !!sessionId,
    retry: false,
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
