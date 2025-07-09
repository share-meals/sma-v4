import {IonIcon} from '@ionic/react';
import {latlngSchema} from '@sma-v4/schema';
import {StateButton} from '@share-meals/frg-ui';
import {StateButtonLoadingIndicator} from '@/components/StateButtonLoadingIndicator';
import {
  useCallback,
  useState,
} from 'react';
import {useGeolocation} from '@/hooks/Geolocation';
import {useIntl} from 'react-intl';
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
  const intl = useIntl();
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
      .catch((error: any) => {
	console.log(error);
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
	   aria-label={intl.formatMessage({id: 'components.locateMeControl.button.ariaLabel'})}
	   className='square'
	   disabled={permissionState === 'denied'}
	   isLoading={isLoading}
	   loadingIndicator={<StateButtonLoadingIndicator />}
	   onClick={locateMe}>
    <IonIcon
      aria-hidden='true'
      slot='icon-only'
      src={MyLocationIcon}
    />
  </StateButton>;
}
