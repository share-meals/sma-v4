import {Capacitor} from '@capacitor/core';
import {
  createContext,
  useContext,
  useState,
} from 'react';
import {
  Geolocation,
  GeolocationPosition,
  PermissionStatus
} from '@capacitor/geolocation';
import {latlngSchema} from '@sma-v4/schema';
import {
  useIntl
} from 'react-intl';
import {
  useIonAlert
} from '@ionic/react';
import {z} from 'zod';

type latlng = z.infer<typeof latlngSchema>;
type PermissionState = 'prompt' | 'prompt-with-rationale' | 'granted' | 'denied'; // todo: retrieve from @capacitor/geolocation

export interface GeolocationState {
  getGeolocation: () => Promise<void>,
  lastGeolocation: latlng | undefined,
  permissionState: PermissionState,
};

const GeolocationContext = createContext<GeolocationState>({
  getGeolocation: () => {}
} as GeolocationState);

export const useGeolocation = () => useContext(GeolocationContext);

export const GeolocationProvider: React.FC<React.PropsWithChildren> = ({
  children
}) => {
  const [presentAlert] = useIonAlert();
  const [lastGeolocation, setLastGeolocation]  = useState<latlng | undefined>(undefined);
  const [permissionState, setPermissionState] = useState<PermissionState>('prompt'); // assume default is prompt?
  const intl = useIntl();
  const getGeolocation = async () => {
    const geolocationPermissions: PermissionStatus = await Geolocation.checkPermissions();
    switch(geolocationPermissions.location){
      case 'denied':
	if(permissionState !== 'denied'){
	  setPermissionState('denied');
	}
	break;
      case 'granted':
	const position: GeolocationPosition = await Geolocation.getCurrentPosition();
	if(permissionState !== 'granted'){
	  setPermissionState('granted');
	}
	setLastGeolocation({
	  lat: position.coords.latitude,
	  lng: position.coords.longitude
	});
	break;
      case 'prompt':
      case 'prompt-with-rationale':
	presentAlert({
	  buttons: [
	    intl.formatMessage({
	      id: 'buttons.ok',
	      defaultMessage: 'OK',
	      description: 'Button label for OK'
	    })
	  ],
	  header: intl.formatMessage({
	    id: 'common.attention',
	    defaultMessage: 'Attention',
	    description: 'Title for informational alert'
	  }),
	  message: intl.formatMessage({
	    id: 'geolocation.alert.message',
	    defaultMessage: 'To be able to provide the best experience for seeing and creating posts near you, we would like to use your geolocation periodically. A popup will appear asking for permission. Please allow the app access.',
	    description: 'Message for alert before prompting for Geolocation permissions'
	  }),
	  onDidDismiss: async () => {
	    if(Capacitor.isNativePlatform()){
	      //Geolocation.requestPermissions({permissions: ['location']});
	    }else{
	      // Geolocation.requestPermissions is not implemented on web
	      const position: GeolocationPosition = await Geolocation.getCurrentPosition();
	      setLastGeolocation({
		lat: position.coords.latitude,
		lng: position.coords.longitude
	      });
	    }
	  }
	});
	break;
    }
  };

  return <GeolocationContext.Provider
  value={{
    getGeolocation,
    lastGeolocation,
    permissionState
  }}>
    {children}
  </GeolocationContext.Provider>
}
