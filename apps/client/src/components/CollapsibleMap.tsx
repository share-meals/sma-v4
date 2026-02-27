import {
  FormattedMessage,
  useIntl
} from 'react-intl';
import {
  generateCurrentLocationLayer,
  vectorLayerConstants
} from '@/utilities/map';
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
  ZoomControls
} from '@share-meals/frg-ui';
import {
  useCallback,
  useState,
  useMemo,
} from 'react';
import {useGeolocation} from '@/hooks/Geolocation';

import '@/components/Map/ZoomControls.css';

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

  const currentLocationLayer = useMemo(() => {
    return generateCurrentLocationLayer({
      defaultLocation,
      lastGeolocation
    });
  }, [defaultLocation, lastGeolocation]);
  const layer: MapLayerProps = useMemo(() => ({
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
    ...vectorLayerConstants
  }), [lat, lng]);

  const controls = <>
    <div style={{
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
    </div>
    <ZoomControls increment={1}
		  zoomOutControlProps={{
		    className: 'square',
		  }}
		  zoomInControlProps={{
		    className: 'square'
		  }}
    />
  </>;
  console.log(name);
  return <>
    <p>
      {name
      && <>
	{name}<br />
      </>}
      {room
      && <>
	<FormattedMessage id='common.label.room' /> {room}<br />
      </>}
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
