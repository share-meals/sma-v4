import {FormattedMessage} from 'react-intl';
import {IonLabel} from '@ionic/react';
import {
  Map as FRGMap,
  MapProvider,
} from '@share-meals/frg-ui';
import type {
  MapLayer
} from '@share-meals/frg-ui';
import {latlngSchema} from '@sma-v4/schema';
import {LoadingIndicator} from '@/components/LoadingIndicator';
import {Notice} from '@/components/Notice';
import styles from './styles.json';
import {useGeolocation} from '@/hooks/Geolocation';
import {z} from 'zod';

type latlngType = z.infer<typeof latlngSchema>;

interface MapProps {
  center: latlngType;
  controls?: React.ReactElement;
  layers?: MapLayer[];
  locked?: boolean;
  maxZoom?: number;
  minZoom?: number;
  onFeatureClick?: any;
  zoom?: number;
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

export const Map: React.FC<MapProps> = ({
  center,
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
      center={center}
      layers={layers}
      maxZoom={maxZoom}
      minZoom={minZoom}
      zoom={zoom}>
      {permissionState === 'denied'
      && <GeolocationError />}
      <FRGMap
	protomapsApiKey={import.meta.env.VITE_PROTOMAPS_API_KEY}
	protomapsStyles={styles}
	{...props}
      />
    </MapProvider>
  </div>;
};
