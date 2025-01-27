// src/lib/utils/geo.ts
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const startLat = toRad(lat1);
  const startLong = toRad(lon1);
  const endLat = toRad(lat2);
  const endLong = toRad(lon2);

  let dLong = endLong - startLong;

  const dPhi = Math.log(
    Math.tan(endLat / 2.0 + Math.PI / 4.0) / Math.tan(startLat / 2.0 + Math.PI / 4.0)
  );

  if (Math.abs(dLong) > Math.PI) {
    dLong = dLong > 0 ? -(2 * Math.PI - dLong) : 2 * Math.PI + dLong;
  }

  return (toDeg(Math.atan2(dLong, dPhi)) + 360) % 360;
}

function toDeg(rad: number): number {
  return rad * (180 / Math.PI);
}