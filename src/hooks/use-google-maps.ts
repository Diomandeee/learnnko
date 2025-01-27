import { useState, useEffect } from "react"

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        const script = document.createElement("script")
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`
        script.async = true
        script.onload = () => setIsLoaded(true)
        script.onerror = () => setLoadError(new Error("Failed to load Google Maps"))
        document.body.appendChild(script)
      } catch (error) {
        setLoadError(error)
      }
    }

    loadGoogleMaps()
  }, [])

  return { isLoaded, loadError }
}
