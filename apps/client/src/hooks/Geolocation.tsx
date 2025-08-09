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
import {getEnumValueOrNull} from '@/utilities/getEnumValueOrNull';
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

interface GeolocationError {
  code: string | number;
  message: string;
}

enum mockGeolocationPermissionValues {
  Granted = 'granted',
  Denied = 'denied',
  Prompt = 'prompt'
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
  const queryParams = new URLSearchParams(window.location.search);
  const mockGeolocationPermission = getEnumValueOrNull(mockGeolocationPermissionValues, queryParams.get('mockGeolocationPermission'));
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
    if(mockGeolocationPermission === 'denied'){
      setPermissionState('denied');
      addAlert('geolocation', {message: 'errors.geolocation.denied'});
      return getBackupGeolocation();
    }
    switch(geolocationPermissions.location){
      case 'denied':
	if(permissionState !== 'denied'){
	  setPermissionState('denied');
	  addAlert('geolocation', {message: 'errors.geolocation.denied'});
	}
	return getBackupGeolocation();
	break;
      case 'granted':
	    setPermissionState('granted');
	try{
	  const position: GeolocationPosition = await Geolocation.getCurrentPosition();
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
	    intl.formatMessage({id: 'buttons.label.ok'})
	  ],
	  header: intl.formatMessage({id: 'common.label.attention'}),
	  message: intl.formatMessage({id: 'geolocation.alert.message'}),
	  onDidDismiss: async () => {
	    if(Capacitor.isNativePlatform()){
	      const afterPromptPermissions: any = await Geolocation.requestPermissions({permissions: ['location']});
	      if(afterPromptPermissions.location === 'denied'){
		getBackupGeolocation();
		return;
	      }
	    }
	    try{
	      // todo: Geolocation.requestPermissions is not implemented on web
	      const position: GeolocationPosition = await Geolocation.getCurrentPosition();
	      setPermissionState('granted');
	      const location: latlngType = {
		lat: position.coords.latitude,
		lng: position.coords.longitude
	      };
	      setLastGeolocation(location);
	      return location;
	    }catch(errorRaw){/////////////
	      const error = errorRaw as GeolocationError;
	      switch(error.code){
		case 1:
		case '1':
		default:
		  setPermissionState('denied');
		  addAlert('geolocation', {message: 'errors.geolocation.denied'});
	      }
	      return lastGeolocation;
	    }
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
    mockGeolocationPermission,
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
