import LocationMarkerIcon from '@/assets/svg/locationMarker.svg';

interface generateCurrentLocationLayerArgs {
  defaultLocation: any,
  lastGeolocation: any,
}

export const generateCurrentLocationLayer = ({
  defaultLocation,
  lastGeolocation,
}: generateCurrentLocationLayerArgs): any => ({
  fillColor: '#ffffff',
  icon: LocationMarkerIcon,
  geojson: {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: {
	coordinates: lastGeolocation ? [lastGeolocation.lng, lastGeolocation.lat] : defaultLocation,
	type: 'Point'
      },
      properties: {}
    }]
  },
  name: 'Current Location',
  strokeColor: '#ffffff',
  type: 'vector',
  zIndex: 1
});

export const vectorLayerConstants = {
  featureRadius: 16,
  featureWidth: 16,
  fillColor: 'rgba(11, 167, 100, 0.75)',
strokeColor: 'rgba(255, 255, 255, 0.75)',
type: 'vector',
};
