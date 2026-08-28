import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

let isOptionsSet = false;
let loadPromise: Promise<typeof google> | null = null;

export const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export function isGoogleMapsConfigured(): boolean {
  return (
    typeof GOOGLE_MAPS_API_KEY === 'string' &&
    GOOGLE_MAPS_API_KEY.trim().length > 0 &&
    !GOOGLE_MAPS_API_KEY.includes('your_') &&
    !GOOGLE_MAPS_API_KEY.includes('placeholder')
  );
}

export async function loadGoogleMaps(): Promise<typeof google> {
  if (!isGoogleMapsConfigured()) {
    throw new Error('MISSING_API_KEY');
  }

  if (typeof window !== 'undefined' && window.google?.maps?.Map) {
    return window.google;
  }

  if (!isOptionsSet) {
    setOptions({
      key: GOOGLE_MAPS_API_KEY,
      v: 'weekly',
    });
    isOptionsSet = true;
  }

  if (!loadPromise) {
    loadPromise = (async () => {
      const mapsLib = await importLibrary('maps');
      await Promise.all([
        importLibrary('geometry'),
      ]);

      if (typeof window !== 'undefined' && window.google?.maps) {
        if (!window.google.maps.Map && mapsLib?.Map) {
          (window.google.maps as any).Map = mapsLib.Map;
        }
        return window.google;
      }
      throw new Error('GOOGLE_MAPS_INIT_FAILED');
    })();
  }

  return loadPromise;
}
