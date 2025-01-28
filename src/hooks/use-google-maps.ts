import { useState, useEffect } from "react"

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        const script = document.createElement("script")
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDrfUenb2mg3cvQdeYW8KDL3EUVYTJPQBE&libraries=places,geometry`
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
