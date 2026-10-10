export interface Coords {
  lat: number
  lng: number
}

export const DHAKA: Coords = { lat: 23.8103, lng: 90.4125 }

export function distanceKm(a: Coords, b: Coords): number {
  const rad = (d: number) => (d * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(h))
}

export function nearest<T extends Coords>(items: T[], from: Coords, limit: number) {
  return items
    .map((item) => ({ item, km: distanceKm(from, item) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, limit)
}
