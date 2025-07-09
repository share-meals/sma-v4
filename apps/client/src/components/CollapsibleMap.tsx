import {
  FormattedMessage,
  useIntl
} from 'react-intl';
import {
  IonButton,
  IonIcon,
} from '@ionic/react';

import {
  LocateMeControl,
  Map,
} from '@/components/Map';
import type {Location} from '@sma-v4/schema';
import {
  MapLayerProps,
  TimestampedLatLng,
} from '@share-meals/frg-ui';
import {
  useCallback,
  useState,
  useMemo,
} from 'react';
import {useGeolocation} from '@/hooks/Geolocation';

import LocationMarkerIcon from '@/assets/svg/locationMarker.svg';
import PostLocationIcon from '@material-symbols/svg-400/rounded/location_on-fill.svg';


const defaultLocation: TimestampedLatLng = {lat: 40.78016900410382, lng: -73.96877450706982}; // Delacorte Theater

export const CollapsibleMap: React.FC<Location> = ({
  address,
  lat,
  lng,
  name,
  room
}) => {
  const intl = useIntl();
  const [showMap, setShowMap] = useState<boolean>(false);
  const {lastGeolocation} = useGeolocation();
  const postCenter: TimestampedLatLng = {
    lat: lat,
    lng: lng
  };
  const [center, setCenter] = useState<TimestampedLatLng>(postCenter);
  const changeCenter = useCallback((location: TimestampedLatLng) => {
    setCenter({
      ...location,
      timestamp: new Date()
    });
  }, [setCenter]);

  const currentLocationLayer = {
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
  };
  const layer: MapLayerProps = useMemo(() => ({
    featureRadius: 20,
    featureWidth: 20,
    fillColor: 'rgba(11, 167, 100, 0.5)',
    geojson: {
      type: 'FeatureCollection',
      features: [
	{
	  type: 'Feature',
	  geometry: {
	    type: 'Point',
	    coordinates: [
	      lng,
	      lat
	    ]
	  }
	}
      ]
    },
    name: 'marker',
    strokeColor: 'rgba(255, 255, 255, 0.5)',
    type: 'vector'
  }), [lat, lng]);

  const controls = <div style={{
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    right: '1rem',
    top: '1rem',
    zIndex: 999
  }}>
    <LocateMeControl setCurrentLocation={changeCenter} />
    <IonButton
      aria-label={intl.formatMessage({id: 'components.collapsibleMap.centerOnPost.button.ariaLabel'})}
      className='square' onClick={() => {changeCenter(postCenter);}}>
      <IonIcon aria-hidden='true' slot='icon-only' src={PostLocationIcon} />
    </IonButton>
  </div>;
  ////////////////////////
  // TODO: add room to address
  return <>
      <p>
	{name} {room}
	{address}
	<br />
	<a
	  className='text-button'
	  data-testid='components.collapsibleMap.showMap.link'
	  onClick={() => {setShowMap(!showMap);}}>
	  {showMap
	  ? <FormattedMessage id='pages.viewPost.hideMap' />
	  : <FormattedMessage id='pages.viewPost.showMap' />}
	</a>
      </p>
      {showMap && <div
	data-testid='components.collapsibleMap.map'
		    style={{height: '20rem'}}>
	<Map
	  center={center}
	  controls={controls}
	  layers={[
	    currentLocationLayer,
	    layer,
	  ]}
	  zoom={{level: 14}}
	/>
      </div>}

  </>
};
