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
  zoom?: number;
}

const GeolocationError: React.FC = () => (
  <div style={{position: 'absolute', zIndex: 999, width: '100%', bottom: '1rem'}}>
    <Notice color='danger'>
      <IonLabel>
	<FormattedMessage id='errors.geolocation.denied' />
      </IonLabel>
    </Notice>
  </div>
);

export const Map: React.FC<MapProps> = ({
  center,
  controls,
  layers = [],
  locked,
  maxZoom = 20,
  minZoom = 10,
  zoom
}) => {
  const {
    permissionState
  } = useGeolocation();
  //console.log(layers[0].geojson.features[0].geometry.coordinates);
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
	controls={controls}
	locked={locked}
      />
    </MapProvider>
  </div>;
};
