export type Role = 'PATIENT' | 'DRIVER' | 'ADMIN'
export type DriverStatus = 'AVAILABLE' | 'ON_TRIP' | 'OFFLINE'
export type AmbulanceType = 'BASIC' | 'ICU' | 'CARDIAC'
export type AmbulanceStatus = 'AVAILABLE' | 'ON_TRIP' | 'MAINTENANCE'
export type RequestPriority = 'CRITICAL' | 'HIGH' | 'NORMAL'
export type RequestStatus =
  | 'PENDING'
  | 'ASSIGNED'
  | 'EN_ROUTE_PICKUP'
  | 'PICKED_UP'
  | 'EN_ROUTE_HOSPITAL'
  | 'COMPLETED'
  | 'CANCELLED'
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: Role
  isVerified: boolean
  createdAt: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface DriverProfile {
  id: string
  userId: string
  licenseNumber: string
  status: DriverStatus
  currentLat?: number
  currentLng?: number
  ambulanceId?: string
  ambulance?: Ambulance
  user: User
}

export interface Ambulance {
  id: string
  plateNumber: string
  type: AmbulanceType
  status: AmbulanceStatus
  homeHospitalId?: string
  homeHospital?: Hospital
}

// /ambulances/nearby returns each ambulance annotated with haversine distance.
export interface NearbyAmbulance extends Ambulance {
  distanceKm: number
}

export interface Hospital {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  phone: string
}

export interface EmergencyRequest {
  id: string
  patientId: string
  patient?: User
  pickupAddress: string
  pickupLat: number
  pickupLng: number
  priority: RequestPriority
  status: RequestStatus
  ambulanceId?: string
  ambulance?: Ambulance
  driverId?: string
  driver?: User
  destinationHospitalId?: string
  destinationHospital?: Hospital
  cancelReason?: string
  requestedAt: string
  assignedAt?: string
  completedAt?: string
  statusLogs?: RequestStatusLog[]
}

export interface RequestStatusLog {
  id: string
  requestId: string
  fromStatus?: RequestStatus
  toStatus: RequestStatus
  note?: string
  createdAt: string
  actorId: string
}

export interface Payment {
  id: string
  requestId: string
  patientId: string
  amount: number
  currency: string
  status: PaymentStatus
  stripeSessionId?: string
  createdAt: string
  request?: EmergencyRequest
}

export interface Feedback {
  id: string
  requestId: string
  patientId: string
  driverId: string
  rating: number
  comment?: string
  createdAt: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedData<T> {
  items: T[]
  meta: PaginationMeta
}

export interface ApiSuccess<T> {
  success: true
  message: string
  data: T
}

export interface ApiError {
  success: false
  message: string
  errors?: Array<{ field?: string; message: string }>
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

export interface DashboardStats {
  users: { total: number; patients: number; drivers: number }
  ambulances: { total: number; available: number }
  requests: { total: number; pending: number; completed: number; cancelled: number }
  revenue: { paidTotal: number }
}

// Admin resource rows
export interface AdminUser {
  id: string
  name: string
  email: string
  phone?: string | null
  role: Role
  isVerified: boolean
  deletedAt?: string | null
  createdAt: string
}

export interface AuditLog {
  id: string
  requestId: string
  fromStatus?: RequestStatus | null
  toStatus: RequestStatus
  note?: string | null
  createdAt: string
  actor: { id: string; name: string; role: Role }
}
