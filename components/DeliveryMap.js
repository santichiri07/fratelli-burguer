"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const STORE_LOCATION = {
  lat: -34.9195,
  lng: -57.9562,
  label: "Fratelli Burger",
  address: "Diagonal 77 N° 809 e/ 11 y 12, La Plata",
};

const DEFAULT_CENTER = [STORE_LOCATION.lat, STORE_LOCATION.lng];
const DEFAULT_ZOOM = 15;

function StoreMarker() {
  const storeIcon = L.icon({
    iconUrl: "https://cdn.jsdelivr.net/npm/@mapbox/maki@6.2.0/icons/restaurant-15.svg",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
    className: "store-marker-icon",
  });

  return (
    <Marker position={[STORE_LOCATION.lat, STORE_LOCATION.lng]} icon={storeIcon}>
      <Popup>
        <strong>{STORE_LOCATION.label}</strong>
        <br />
        <small>{STORE_LOCATION.address}</small>
      </Popup>
    </Marker>
  );
}

function DeliveryPin({ position, onDragEnd }) {
  // Usamos un DivIcon con emoji: no depende de CDN y siempre se ve
  const pinIcon = L.divIcon({
    className: "delivery-pin-div",
    html: '<div class="pin-emoji">📍</div>',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

  return (
    <Marker position={position} icon={pinIcon} draggable onDragEnd={onDragEnd}>
      <Popup>Tu ubicación de entrega</Popup>
    </Marker>
  );
}

function MapInteractions({ onMapClick, onLocationFound, onLocationError }) {
  const map = useMapEvents({
    click: (e) => onMapClick(e.latlng),
  });

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => onLocationFound({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => onLocationError(err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [onLocationFound, onLocationError]);

  return null;
}

function MapCenterer({ centerOn }) {
  const map = useMapEvents({});
  useEffect(() => {
    if (centerOn) {
      map.setView([centerOn.lat, centerOn.lng], 17);
    }
  }, [centerOn, map]);
  return null;
}

export default function DeliveryMap({
  initialPosition,
  onPositionChange,
  onUseCurrentLocation,
  disabled = false,
}) {
  const [position, setPosition] = useState(initialPosition || null);
  const [mapReady, setMapReady] = useState(false);
  const [centerOn, setCenterOn] = useState(null);

  useEffect(() => {
    if (initialPosition && !position) {
      setPosition(initialPosition);
    }
  }, [initialPosition, position]);

  const handleMapClick = (latlng) => {
    if (disabled) return;
    const newPos = { lat: latlng.lat, lng: latlng.lng };
    setPosition(newPos);
    onPositionChange?.(newPos);
  };

  const handleDragEnd = (e) => {
    if (disabled) return;
    const newPos = { lat: e.target.getLatLng().lat, lng: e.target.getLatLng().lng };
    setPosition(newPos);
    onPositionChange?.(newPos);
  };

  const handleUseCurrentLocation = () => {
    if (disabled) return;
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(newPos);
        onPositionChange?.(newPos);
        onUseCurrentLocation?.(newPos);
        setCenterOn(newPos);
      },
      (err) => {
        let msg = "No se pudo obtener tu ubicación.";
        if (err.code === err.PERMISSION_DENIED) {
          msg = "Permiso denegado. Habilitá la ubicación en tu navegador o marcá el punto manualmente en el mapa.";
        } else if (err.code === err.TIMEOUT) {
          msg = "Tiempo agotado. Intentá de nuevo o marcá el punto manualmente.";
        }
        alert(msg);
        onUseCurrentLocation?.(null, err);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleMapReady = (map) => {
    setMapReady(true);
    if (position) {
      map.setView([position.lat, position.lng], 17);
    }
  };

  return (
    <div className="delivery-map-wrapper">
      <div className="delivery-map-controls">
        <button
          type="button"
          className="btn-location"
          onClick={handleUseCurrentLocation}
          disabled={disabled}
          aria-label="Usar mi ubicación actual"
        >
          📍 Usar mi ubicación actual
        </button>
        {position && (
          <span className="map-coords">
            Lat: {position.lat.toFixed(6)}, Lng: {position.lng.toFixed(6)}
          </span>
        )}
      </div>

      <div className="delivery-map-container-inner">
        {!mapReady && (
          <div className="delivery-map-loading">
            <div className="map-spinner" />
            <p>Cargando mapa...</p>
          </div>
        )}
        <MapContainer
          center={position ? [position.lat, position.lng] : DEFAULT_CENTER}
          zoom={position ? 17 : DEFAULT_ZOOM}
          scrollWheelZoom={!disabled}
          whenReady={handleMapReady}
          className="delivery-map"
          style={{ height: "350px", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <StoreMarker />
          {position && <DeliveryPin position={[position.lat, position.lng]} onDragEnd={handleDragEnd} />}
          <MapInteractions
            onMapClick={handleMapClick}
            onLocationFound={() => {}}
            onLocationError={() => {}}
          />
          <MapCenterer centerOn={centerOn} />
        </MapContainer>
      </div>

      <p className="map-hint">
        {position
          ? "Arrastrá el pin o hacé clic en otro lugar para mover la ubicación."
          : "Hacé clic en el mapa para marcar tu dirección de entrega, o usá el botón de arriba."}
      </p>
    </div>
  );
}