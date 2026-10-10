/**
 * CONFIGURACIÓN DE ZONAS DE ENVÍO
 * ================================
 * Cada zona tiene:
 * - id: identificador único (string)
 * - name: nombre visible para el cliente
 * - price: costo de envío en ARS (number)
 * - color: color hex para el mapa (ej: '#ff0000')
 * - type: 'circle' | 'polygon'
 *   - si type === 'circle': center: [lat, lng], radiusKm: number
 *   - si type === 'polygon': points: [[lat, lng], ...] (array de coordenadas)
 *
 * IMPORTANTE: El orden importa. La primera zona que coincida gana.
 * Coordenadas: [latitud, longitud]
 */

export const DELIVERY_ZONES = [
  {
    id: 'cerca',
    name: 'Zona cercana',
    price: 1500,
    color: '#27ae60',
    type: 'polygon',
    points: [
      [-34.93771157778208, -57.96009779259837],// CAMBIAR: esquina 1 (arriba izquierda)
      [-34.91336496451522, -57.93331727609488],// CAMBIAR: esquina 2 (arriba derecha)
      [-34.936340, -57.901758],// CAMBIAR: esquina 3 (abajo derecha)
      [-34.961669, -57.929998],// CAMBIAR: esquina 4 (abajo izquierda)
    ],
  },
  {
    id: 'zona-sur',
    name: 'Zona intermedia',
    price: 2500,
    color: '#e9da0e',
    type: 'polygon',
    points: [
      [-34.93314368890874, -57.97994186353122],// CAMBIAR: esquina 1 (arriba izquierda)
      [-34.90511346332225, -57.94914701078947],// CAMBIAR: esquina 2 (arriba derecha)
      [-34.915101912384586, -57.93542860554715],// CAMBIAR: esquina 3 (abajo derecha)
      [-34.94336149599546, -57.96628139104253],// CAMBIAR: esquina 4 (abajo izquierda)
    ],
  },
  {
    id: 'lejos',
    name: 'Zona extendida',
    price: 3500,
    color: '#de1005',
    type: 'polygon',
    points: [
      [-34.92311753839354, -57.993396162632030],
      [-34.89486783402422, -57.962641748567734],
      [-34.90514734766601, -57.94911701081123],
      [-34.93318540969998, -57.97994750149197],
    ],
  },
];

/**
 * Calcula distancia haversine entre dos puntos [lat, lng] en km
 */
export function haversineKm([lat1, lng1], [lat2, lng2]) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * Point-in-polygon (ray casting)
 * point: [lat, lng], polygon: [[lat, lng], ...]
 */
export function pointInPolygon(point, polygon) {
  const [lat, lng] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [latI, lngI] = polygon[i];
    const [latJ, lngJ] = polygon[j];
    const intersect =
      lngI > lng !== lngJ > lng &&
      lat < ((latJ - latI) * (lng - lngI)) / (lngJ - lngI) + latI;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Detecta en qué zona cae un punto. Retorna la zona o null.
 * La primera zona que coincida (orden del array) gana.
 */
export function detectDeliveryZone(point) {
  for (const zone of DELIVERY_ZONES) {
    if (zone.type === 'circle') {
      const dist = haversineKm(point, zone.center);
      if (dist <= zone.radiusKm) return zone;
    } else if (zone.type === 'polygon') {
      if (pointInPolygon(point, zone.points)) return zone;
    }
  }
  return null;
}