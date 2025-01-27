export interface Location {
  latitude: number
  longitude: number
}

export interface RouteOptions {
  mode: "DRIVING" | "WALKING"
  optimizeWaypoints: boolean
  avoidTolls?: boolean
  avoidHighways?: boolean
}

export interface RouteStats {
  distance: number
  duration: number
  stops: number
}
