import {
  IonButton,
  IonIcon,
} from '@ionic/react';
import {latlngSchema} from '@sma-v4/schema';
import {
  StateButton
} from '@share-meals/frg-ui';
import {
  useCallback,
  useState,
} from 'react';
import {useGeolocation} from '@/hooks/Geolocation';
import {z} from 'zod';

import MyLocationIcon from '@material-symbols/svg-400/rounded/my_location-fill.svg';

type latlngType = z.infer<typeof latlngSchema>;

interface LocateMeControlProps {
  setCurrentLocation: (args: latlngType) => void
}

const JIGGLE = 0.0001; // hackzorz needed since MapContext has difficulty recentering on the exact same position


export const LocateMeControl: React.FC<LocateMeControlProps> = ({
  setCurrentLocation
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {getGeolocation, permissionState}  = useGeolocation();
  const locateMe = useCallback(() => {
    setIsLoading(true);
    getGeolocation()
      .then((location) => {
	setCurrentLocation({
	  lat: location.lat + JIGGLE * Math.random(),
	  lng: location.lng + JIGGLE * Math.random()
	});
      })
      .catch((error: unknown) => {
	// TODO: error handling
      })
      .finally(() => {
	setIsLoading(false);
      });    
  }, [
    getGeolocation,
    permissionState,
    setCurrentLocation,
    setIsLoading,
  ]);
  return <StateButton
	   className='square'
	   disabled={permissionState === 'denied'}
	   isLoading={isLoading}
	   onClick={locateMe}>
    <IonIcon slot='icon-only' src={MyLocationIcon} />
  </StateButton>;
}
