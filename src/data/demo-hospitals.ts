export interface DemoHospital {
  id: string
  name: string
  district: string
  address: string
  lat: number
  lng: number
  phone: string
  beds: number
  icu: boolean
}

/** Demo data: 20 hospitals spread across Bangladesh districts. Not live records. */
export const DEMO_HOSPITALS: DemoHospital[] = [
  { id: 'd01', name: 'Dhaka Medical College Hospital', district: 'Dhaka', address: 'Secretariat Rd, Ramna', lat: 23.7259, lng: 90.3977, phone: '+880 2-5550-1001', beds: 2300, icu: true },
  { id: 'd02', name: 'Square Hospital', district: 'Dhaka', address: '18/F Bir Uttam Qazi Nuruzzaman Sarak', lat: 23.7507, lng: 90.3836, phone: '+880 2-5581-0186', beds: 400, icu: true },
  { id: 'd03', name: 'United Hospital', district: 'Dhaka', address: 'Plot 15, Road 71, Gulshan', lat: 23.7925, lng: 90.4153, phone: '+880 2-8836-444', beds: 500, icu: true },
  { id: 'd04', name: 'Evercare Hospital', district: 'Dhaka', address: 'Plot 81, Block E, Bashundhara R/A', lat: 23.8103, lng: 90.4318, phone: '+880 2-8401-1661', beds: 450, icu: true },
  { id: 'd05', name: 'NICVD', district: 'Dhaka', address: 'Sher-e-Bangla Nagar, Agargaon', lat: 23.7771, lng: 90.3687, phone: '+880 2-5550-6001', beds: 700, icu: true },
  { id: 'g01', name: 'Gazipur Sadar Hospital', district: 'Gazipur', address: 'Joydebpur Chowrasta', lat: 23.9999, lng: 90.4203, phone: '+880 2-9261-100', beds: 250, icu: false },
  { id: 'n01', name: 'Narayanganj General Hospital', district: 'Narayanganj', address: 'Chashara, Narayanganj', lat: 23.6238, lng: 90.5, phone: '+880 2-7631-100', beds: 250, icu: true },
  { id: 'c01', name: 'Chattogram Medical College Hospital', district: 'Chattogram', address: 'K.B. Fazlul Kader Rd', lat: 22.3569, lng: 91.8325, phone: '+880 31-630-001', beds: 1313, icu: true },
  { id: 'c02', name: 'Evercare Hospital Chattogram', district: 'Chattogram', address: 'Pahartali, Chattogram', lat: 22.3626, lng: 91.8003, phone: '+880 31-2515-0000', beds: 300, icu: true },
  { id: 'cx1', name: "Cox's Bazar Sadar Hospital", district: "Cox's Bazar", address: 'Hospital Rd, Cox’s Bazar', lat: 21.4272, lng: 91.9703, phone: '+880 341-64-100', beds: 250, icu: false },
  { id: 'r01', name: 'Rajshahi Medical College Hospital', district: 'Rajshahi', address: 'Laxmipur, Rajshahi', lat: 24.3745, lng: 88.6042, phone: '+880 721-772-150', beds: 1200, icu: true },
  { id: 'kh1', name: 'Khulna Medical College Hospital', district: 'Khulna', address: 'Hospital Rd, Khulna', lat: 22.8456, lng: 89.5403, phone: '+880 41-720-001', beds: 900, icu: true },
  { id: 'b01', name: 'Sher-e-Bangla Medical College Hospital', district: 'Barishal', address: 'Band Rd, Barishal', lat: 22.7010, lng: 90.3535, phone: '+880 431-2173-001', beds: 1000, icu: true },
  { id: 's01', name: 'MAG Osmani Medical College Hospital', district: 'Sylhet', address: 'Medical Rd, Sylhet', lat: 24.8949, lng: 91.8687, phone: '+880 821-713-667', beds: 1000, icu: true },
  { id: 'rg1', name: 'Rangpur Medical College Hospital', district: 'Rangpur', address: 'Medical More, Rangpur', lat: 25.7439, lng: 89.2752, phone: '+880 521-62-100', beds: 1000, icu: true },
  { id: 'm01', name: 'Mymensingh Medical College Hospital', district: 'Mymensingh', address: 'Charpara, Mymensingh', lat: 24.7471, lng: 90.4203, phone: '+880 91-66-100', beds: 1000, icu: true },
  { id: 'cm1', name: 'Cumilla Medical College Hospital', district: 'Cumilla', address: 'Kandirpar, Cumilla', lat: 23.4607, lng: 91.1809, phone: '+880 81-65-100', beds: 500, icu: true },
  { id: 'bg1', name: 'Shaheed Ziaur Rahman Medical College Hospital', district: 'Bogura', address: 'Shaheed Ziaur Rahman Rd, Bogura', lat: 24.8465, lng: 89.3773, phone: '+880 51-66-100', beds: 750, icu: true },
  { id: 'jr1', name: 'Jashore General Hospital', district: 'Jashore', address: 'Hospital Rd, Jashore', lat: 23.1634, lng: 89.2182, phone: '+880 421-68-100', beds: 250, icu: false },
  { id: 'dj1', name: 'Dinajpur Medical College Hospital', district: 'Dinajpur', address: 'Medical Rd, Dinajpur', lat: 25.6279, lng: 88.6332, phone: '+880 531-64-100', beds: 750, icu: true },
]
