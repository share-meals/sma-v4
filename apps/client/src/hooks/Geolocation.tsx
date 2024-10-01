import {Capacitor} from '@capacitor/core';
import {
  createContext,
  useContext,
} from 'react';
import {
  Geolocation,
  GeolocationPosition,
  PermissionStatus
} from '@capacitor/geolocation';
import {
  communitySchema,
  latlngSchema,
} from '@sma-v4/schema';
import {useAlerts} from '@/hooks/Alerts';
import {
  useCallback,
  useState,
} from 'react';
import {useIntl} from 'react-intl';
import {useIonAlert} from '@ionic/react';
import {useProfile} from '@/hooks/Profile';
import {z} from 'zod';

type latlngType = z.infer<typeof latlngSchema>;
type communityType = z.infer<typeof communitySchema>;
type PermissionState = 'prompt' | 'prompt-with-rationale' | 'granted' | 'denied'; // todo: retrieve from @capacitor/geolocation

interface GeolocationState {
  getGeolocation: () => Promise<latlngType>,
  lastGeolocation: latlngType | undefined,
  permissionState: PermissionState,
}

const GeolocationContext = createContext<GeolocationState>({} as GeolocationState);

export const useGeolocation = () => useContext(GeolocationContext);

export const GeolocationProvider: React.FC<React.PropsWithChildren> = ({children}) => {
  const intl = useIntl();
  const {addAlert} = useAlerts();
  const {communities} = useProfile();
  const [presentAlert] = useIonAlert();
  const [lastGeolocation, setLastGeolocation]  = useState<latlngType | undefined>(undefined);
  const [permissionState, setPermissionState] = useState<PermissionState>('prompt'); // assume default is prompt?
  const getBackupGeolocation = useCallback(() => {
    // try to get center from a community
    // @ts-ignore
    // TODO: don't ignore
    const communitiesWithCenter: communityType[] = Object.values(communities).filter((community: communityType) => community.center);
    if(communitiesWithCenter.length > 0
       && communitiesWithCenter[0].center){
      const location: latlngType = {
	lat: communitiesWithCenter[0].center.lat,
	lng: communitiesWithCenter[0].center.lng
      };
      setLastGeolocation(location);
      return location;
    }else{
      const location: latlngType = {
	lat: 40.712778,
	lng: -74.006111
      };
      setLastGeolocation(location);
      return location;
    }
  }, [communities]);
  const getGeolocation = useCallback(async () => {
    const geolocationPermissions: PermissionStatus = await Geolocation.checkPermissions();
    switch(geolocationPermissions.location){
      case 'denied':
	if(permissionState !== 'denied'){
	  setPermissionState('denied');
	  addAlert('geolocation', {message: 'errors.geolocation.denied'});
	}
	return getBackupGeolocation();
	break;
      case 'granted':
	try{
	  const position: GeolocationPosition = await Geolocation.getCurrentPosition();
	  if(permissionState !== 'granted'){
	    setPermissionState('granted');
	  }
	  const location: latlngType = {
	    lat: position.coords.latitude,
	    lng: position.coords.longitude
	  };
	  setLastGeolocation(location);
	  return location;
	}catch(error){
	  // has permission but for whatever reason, cannot get current position
	  return getBackupGeolocation();
	}
	break;
      case 'prompt':
      case 'prompt-with-rationale':
	presentAlert({
	  buttons: [
	    intl.formatMessage({
	      id: 'buttons.label.ok'
	    })
	  ],
	  header: intl.formatMessage({
	    id: 'common.label.attention'
	  }),
	  message: intl.formatMessage({
	    id: 'geolocation.alert.message'
	  }),
	  onDidDismiss: async () => {
	    if(Capacitor.isNativePlatform()){
	      const afterPromptPermissions: any = await Geolocation.requestPermissions({permissions: ['location']});
	      if(afterPromptPermissions.location === 'denied'){
		getBackupGeolocation();
		return;
	      }
	    }
	    // todo: Geolocation.requestPermissions is not implemented on web
	    const position: GeolocationPosition = await Geolocation.getCurrentPosition();
	    setPermissionState('granted');
	    const location: latlngType = {
	      lat: position.coords.latitude,
	      lng: position.coords.longitude
	    };
	    setLastGeolocation(location);
	    return location;
	  }
	});
	break;
      default:
	return getBackupGeolocation();
	break;
    }
    return getBackupGeolocation();
  }, [
    Geolocation,
    getBackupGeolocation,
    setPermissionState,
    setLastGeolocation,
  ]);
  return <GeolocationContext.Provider
  children={children}
	   value={{
	     getGeolocation,
	     lastGeolocation,
	     permissionState,
	   }}
  />
}
