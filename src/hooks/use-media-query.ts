import { useState, useEffect } from "react"

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    
    // Set initial value
    setMatches(media.matches)

    // Set up listener
    const listener = () => setMatches(media.matches)
    media.addEventListener("change", listener)
    
    // Clean up
    return () => media.removeEventListener("change", listener)
  }, [query])

  return matches
}
