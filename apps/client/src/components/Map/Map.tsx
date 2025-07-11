import {FormattedMessage} from 'react-intl';
import {IonLabel} from '@ionic/react';
import {
  getMapStyle,
  Map as FRGMap,
  MapLayerProps,
  MapProvider,
  TimestampedLatLng,
  TimestampedZoom,
} from '@share-meals/frg-ui';
import {Notice} from '@/components/Notice';
import {useGeolocation} from '@/hooks/Geolocation';

interface MapProps {
  center: TimestampedLatLng;
  controls?: React.ReactElement;
  layers?: MapLayerProps[];
  locked?: boolean;
  maxZoom?: number;
  minZoom?: number;
  onFeatureClick?: any;
  zoom?: TimestampedZoom;
}

const NOTIFICATION_WIDTH: number = 30;

const GeolocationError: React.FC = () => (
  <div style={{
    bottom: '1rem',
    position: 'absolute',
    right: `calc(50% - ${NOTIFICATION_WIDTH / 2}rem)`,
    width: `${NOTIFICATION_WIDTH}rem`,
    zIndex: 999,
  }}>
    <Notice color='danger'>
      <IonLabel>
	<FormattedMessage id='errors.geolocation.denied' />
      </IonLabel>
    </Notice>
  </div>
);

export const controlsRightStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  position: 'absolute',
  right: '1rem',
  top: '1rem',
  zIndex: 999,
}

export const Map: React.FC<MapProps> = ({
  center,
  controls,
  layers = [],
  maxZoom = 16,
  minZoom = 10,
  zoom,
  ...props
}) => {
  const {
    permissionState
  } = useGeolocation();
  return <div style={{height: '100%', position: 'relative'}}>
    <MapProvider
      center={{...center}}
      layers={layers}
      maxZoom={maxZoom}
      minZoom={minZoom}
      zoom={zoom}>
      {permissionState === 'denied'
      && <GeolocationError />}
      <FRGMap
	controls={controls}
	protomapsApiKey={import.meta.env.VITE_PROTOMAPS_API_KEY}
	protomapsStyles={getMapStyle({
	  apiKey: import.meta.env.VITE_PROTOMAPS_API_KEY,
	  theme: 'grayscale'
	})}
	{...props}
      />
    </MapProvider>
  </div>;
};
