let isLoading = false;
let isLoaded = false;
let loadPromise: Promise<void> | null = null;

export function loadGoogleMaps(): Promise<void> {
  // If already loaded, return resolved promise
  if (isLoaded && window.google) {
    return Promise.resolve();
  }

  // If currently loading, return existing promise
  if (isLoading && loadPromise) {
    return loadPromise;
  }

  // Start loading
  isLoading = true;
  loadPromise = new Promise((resolve, reject) => {
    try {
      // Create callback name
      const callbackName = 'googleMapsCallback';
      
      // Create the script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry&callback=${callbackName}`;
      script.async = true;
      script.defer = true;

      // Add callback
      window[callbackName] = () => {
        isLoaded = true;
        isLoading = false;
        delete window[callbackName];
        resolve();
      };

      // Handle errors
      script.onerror = (error) => {
        isLoading = false;
        loadPromise = null;
        reject(error);
      };

      // Add script to document
      document.head.appendChild(script);
    } catch (error) {
      isLoading = false;
      loadPromise = null;
      reject(error);
    }
  });

  return loadPromise;
}

// Type declarations
declare global {
  interface Window {
    google: typeof google;
    googleMapsCallback?: () => void;
  }
}