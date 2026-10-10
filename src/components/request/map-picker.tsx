'use client'

import L from 'leaflet'
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// Default map center: Dhaka.
const DHAKA: [number, number] = [23.8103, 90.4125]

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

const pinIcon = L.divIcon({
  className: 'map-pin',
  html: '<div style="width:16px;height:16px;border-radius:9999px;background:var(--brand);border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

interface MapPickerProps {
  lat: number | null
  lng: number | null
  onPick: (lat: number, lng: number) => void
}

export default function MapPicker({ lat, lng, onPick }: MapPickerProps) {
  const center: [number, number] = lat != null && lng != null ? [lat, lng] : DHAKA

  return (
    <div className="relative z-0 h-72 w-full overflow-hidden rounded-2xl border border-hairline">
      <MapContainer center={center} zoom={13} className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <ClickHandler onPick={onPick} />
        {lat != null && lng != null && (
          <Marker position={[lat, lng]} icon={pinIcon} />
        )}
      </MapContainer>
    </div>
  )
}
