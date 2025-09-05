import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Community,
  locationSchema,
} from '@sma-v4/schema';
import {
  controlsRightStyle,
  Map
} from '@/components/Map';
import {
  fromLatLng,
  OutputFormat,
  setDefaults,
  setLocationType,
} from 'react-geocode';
import {
  Input,
  MapLayerProps,
  Select,
  SelectOption,
} from '@share-meals/frg-ui';
import {
  IonButton,
  IonIcon,
  IonInput,
} from '@ionic/react';
import {LoadingIndicator} from '@/components/LoadingIndicator';
import {ManualAddressPicker} from '@/components/ManualAddressPicker';
import {Network} from '@capacitor/network';
import {useForm} from 'react-hook-form';
import {useGeolocation} from '@/hooks/Geolocation';
import {useIntl} from 'react-intl';
import {useFormContext} from 'react-hook-form';
import {useProfile} from '@/hooks/Profile';
import {vectorLayerConstants} from '@/utilities/map';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';

import LockIcon from '@material-symbols/svg-400/rounded/lock-fill.svg';
import RefreshIcon from '@material-symbols/svg-400/rounded/refresh.svg';
import UnlockIcon from '@material-symbols/svg-400/rounded/lock_open-fill.svg';

type locationType = z.infer<typeof locationSchema>;
const methodSchema = z.enum([
  'currentLocation',
  'commonList',
  'manualAddress',
  'virtual'
])

type method = z.infer<typeof methodSchema>;

const internalForm = z.object({
  commonBuilding: z.string(),
  method: methodSchema,
  room: z.string().optional()
});

export interface WherePickerProps {
  defaultMethod?: method;
  isLoading: boolean;
  isWherePickerReady: boolean;
  rerenderTrigger: Date | null;
  setIsWherePickerReady: Dispatch<SetStateAction<boolean>>;
}

const setValueCleanOptions = {
  shouldDirty: false,
  shouldTouch: false,
  shouldValidate: false
};

const setValueOptions = {
  shouldDirty: true,
  shouldTouch: true,
  shouldValidate: true
};

export const WherePicker: React.FC<WherePickerProps> = ({
  defaultMethod = 'currentLocation',
  isLoading,
  isWherePickerReady,
  rerenderTrigger,
  setIsWherePickerReady
}) => {
  const intl = useIntl();
  const {communities, features} = useProfile();
  const {
    formState,
    setValue,
    watch
  } = useFormContext();
  const [address] = watch(['location.address']);
  // todo: Object is of type 'unknown'
  // @ts-ignore
  const locations: SelectOption[] = useMemo(() => {
    // todo: better typing
    let payload: {[key: string]: any} = {};
    Object.values(communities).forEach((community: Community) => {
      if(features.canPost.includes(community.id)){
	community.locations?.forEach((location: locationType) => {
	  if(payload[location.name!] === undefined){
	    payload[location.name! ] = location;
	  }
	});
      }
    });
    return Object.values(payload)
    // @ts-ignore
		 .sort((a: locationType, b: locationType) => a.name < b.name ? -1 : 1)
    // @ts-ignore
		 .map((l: locationType) => ({
		   label: l.name,
		   value: JSON.stringify(l)
		 }));
  }, [communities]);
  const [isLocked, setIsLocked] = useState(true);
  const {
    getGeolocation,
    lastGeolocation,
    permissionState
  } = useGeolocation();
  const handleGetGeolocationError = useCallback(() => {
    // todo: handle error
  }, []);
  const [internalLat, setInternalLat] = useState<number>();
  const [internalLng, setInternalLng] = useState<number>();
  const {
    clearErrors: clearInternalErrors,
    control: internalControl,
    formState: internalFormState,
    resetField: resetInternalField,
    setError: setInternalError,
    setValue: setInternalValue,
    watch: internalWatch,
    handleSubmit: handleInternalSubmit
  } = useForm<z.infer<typeof internalForm>>({
    defaultValues: {
      method: defaultMethod,
      room: undefined
    },
    resolver: zodResolver(internalForm)
  });
  const internalSubmit = handleInternalSubmit(() => {}); // to trigger error state if needed
  useEffect(() => {
    if(formState.isSubmitted
       && formState.errors.location){
      internalSubmit();
      setInternalError('commonBuilding', {message: 'Required', type: 'invalid_type'});
    }else{
      clearInternalErrors('commonBuilding');
    }
  }, [formState]);
  const [method] = internalWatch(['method']);
  
  useEffect(() => {
    setDefaults({
      key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      // todo: set language and region based on user
      language: 'en',
      outputFormat: OutputFormat.JSON,
      region: 'en'
    });
    setLocationType('ROOFTOP');
  }, []);

  useEffect(() => {
    if(defaultMethod === 'commonList'
       || defaultMethod === 'manualAddress'){
      getGeolocation()
	.then((location) => {
	  setInternalLat(location.lat);
	  setInternalLng(location.lng);
	})
	.catch(handleGetGeolocationError);
    }
  }, [defaultMethod]);

  useEffect(() => {
    if(method === 'currentLocation'){
      (async () => {
	if(lastGeolocation === undefined){
	  getGeolocation()
	    .catch(handleGetGeolocationError);
	}else{
	  const {connected} = await Network.getStatus();
	  if(import.meta.env.VITE_ENVIRONMENT === 'emulator'
	     && connected === false){
	    // sometimes developing with emulator, I'm on the subway with no or limited internet connectivity
	    // and WherePicker hangs waiting for react-geocode
	    // so bypass react-geocode
	    setValue('location.address', `(${lastGeolocation!.lat}, ${lastGeolocation!.lng})`);
	    setValue('location.lat', lastGeolocation!.lat, setValueCleanOptions);
	    setValue('location.lng', lastGeolocation!.lng, setValueCleanOptions);
	    setInternalLat(lastGeolocation!.lat);
	    setInternalLng(lastGeolocation!.lng);
	  }else{
	    // todo: need to check if address === undefined is necessary
	    try{
	      const response = await fromLatLng(lastGeolocation!.lat, lastGeolocation!.lng);
	      // todo: handle more statuses
	      switch(response.status){
		case 'OK':
		  if(response.results.length > 0){
		    setValue('location.address', response.results[0].formatted_address, setValueCleanOptions);
		    setValue('location.lat', lastGeolocation!.lat, setValueCleanOptions);
		    setValue('location.lng', lastGeolocation!.lng, setValueCleanOptions);
		    setInternalLat(lastGeolocation!.lat);
		    setInternalLng(lastGeolocation!.lng);
		  }else{
		    // todo: handle
		  }
		  break;
		default:
		  // todo: something
		  break;
	      }
	    }catch(error: unknown){
	      // TODO: more error checking
	      // typically no results from geocode?
	      setValue('location.address', `(${lastGeolocation!.lat}, ${lastGeolocation!.lng})`);
	      setValue('location.lat', lastGeolocation!.lat, setValueCleanOptions);
	      setValue('location.lng', lastGeolocation!.lng, setValueCleanOptions);
	      setInternalLat(lastGeolocation!.lat);
	      setInternalLng(lastGeolocation!.lng);
	    };
	  }
	}
      })();
    }
  }, [
    address,
    lastGeolocation,
    method
  ]);

  useEffect(() => {
    if(rerenderTrigger !== null){
      // reset form
//      setInternalValue('method', defaultMethod);
      // @ts-ignore
      resetInternalField('commonBuilding');
      resetInternalField('room');
      setValue('location.address', undefined, setValueOptions);
      setValue('location.lat', undefined, setValueOptions);
      setValue('location.lng', undefined, setValueOptions);
      setValue('location.room', undefined, setValueOptions);
      setIsLocked(true);
    }
  }, [rerenderTrigger]);

  const controls = <div style={controlsRightStyle}>
    <IonButton
      aria-label={intl.formatMessage({id: 'components.wherePicker.lock.button.ariaLabel'})}
      data-testid='components.wherePicker.lock.button'
      className='square'
      onClick={() => {setIsLocked(!isLocked);}}>
      <IonIcon
	aria-hidden='true'
	slot='icon-only'
	src={isLocked ? UnlockIcon : LockIcon} />
    </IonButton>
  </div>;

  useEffect(() => {
    if(
      permissionState !== 'prompt'
      && permissionState !== 'prompt-with-rationale'
      && !(
	permissionState === 'denied'
	&& lastGeolocation === undefined
      )
      && isWherePickerReady === false
    ){
      setIsWherePickerReady(true);
    }
  }, [permissionState, lastGeolocation, isWherePickerReady, setIsWherePickerReady]);

  const layer: MapLayerProps = useMemo(() => ({
    geojson: {
      type: 'FeatureCollection',
      features: [
	{
	  type: 'Feature',
	  geometry: {
	    type: 'Point',
	    coordinates: [
	      internalLng,
	      internalLat
	    ]
	  }
	}
      ]
    },
    name: 'marker',
    ...vectorLayerConstants
  }), [internalLat, internalLng]);

  if(
    permissionState === 'prompt'
    || permissionState === 'prompt-with-rationale'
    || (
      permissionState === 'denied'
      && lastGeolocation === undefined
    )
  ){
    return <div style={{height: '10rem'}}>
      <LoadingIndicator />
    </div>;
  }

  return <>
    <Select
      cancelText={intl.formatMessage({id: 'buttons.label.cancel'})}
      control={internalControl}
      data-testid='components.wherePicker.method.button'
      disabled={isLoading}
      fill='outline'
      label={intl.formatMessage({id: 'common.label.method'})}
      labelPlacement='floating'
      name='method'
      okText={intl.formatMessage({id: 'buttons.label.ok'})}
      onIonChange={(selection) => {
	setInternalValue('method', selection.detail.value);
	// @ts-ignore
	if(method !== 'commonList' && internalFormState.dirtyFields.commonBuilding){
	  resetInternalField('commonBuilding');
	}
	setValue('location.address', '', setValueOptions);
      }}
      options={[
	{
	  label: intl.formatMessage({id: 'components.wherePicker.currentLocation'}),
	  value: 'currentLocation',
	},
	{
	  label: intl.formatMessage({id: 'components.wherePicker.commonList'}),
	  value: 'commonList',
	},
	{
	  label: intl.formatMessage({id: 'components.wherePicker.manualAddress'}),
	  value: 'manualAddress',
	},
	/*
	   // todo: implement virtual checking
	   {
	   label: intl.formatMessage({id: 'components.wherePicker.virtual'}),
	   value: 'virtual',
	   },
	 */
      ]}
    />

    {method === 'commonList' &&
     <Select
       control={internalControl}
       disabled={isLoading}
       fill='outline'
       label={intl.formatMessage({id: 'common.label.building'})}
       labelPlacement='floating'
       name='commonBuilding'
       onIonChange={(selectionRaw) => {
	 const selection = JSON.parse(selectionRaw.detail.value);
	 setValue('location.address', selection.address, setValueOptions);
	 setValue('location.lat', selection.lat, setValueOptions);
	 setValue('location.lng', selection.lng, setValueOptions);
	 setValue('location.name', selection.name, setValueOptions);
	 setInternalValue('commonBuilding', selectionRaw.detail.value, setValueOptions);
	 setInternalLat(selection.lat);
	 setInternalLng(selection.lng);
       }}
       options={locations}
     />
    }

    {method === 'currentLocation' &&
     <IonInput
       disabled={isLoading}
       fill='outline'
       label={intl.formatMessage({id: 'common.label.address'})}
       labelPlacement='floating'
       readonly={true}
       value={address}>
       <IonButton
	 aria-label={intl.formatMessage({id: 'components.wherePicker.refreshCurrentLocation.button.ariaLabel'})}
	 disabled={isLoading}
	 fill='clear'
	 slot='end'
	 onClick={() => {
	   getGeolocation()
	     .catch(handleGetGeolocationError);
	 }}>
	 <IonIcon aria-hidden='true' icon={RefreshIcon} slot='icon-only' />
       </IonButton>
     </IonInput>
    }
    
    {method === 'manualAddress' &&
     <ManualAddressPicker />
    }

    <Input
      className='margin-between-form-components'
      control={internalControl}
      data-testid='input-room'
      disabled={isLoading}
      fill='outline'
      helperText={intl.formatMessage({id: 'common.label.optional'})}
      label={intl.formatMessage({id: 'common.label.room'})}
      labelPlacement='floating'
      name='room'
      onIonChange={(event) => {
	setValue('location.room', event.detail.value, setValueCleanOptions)
      }}
      required={false}
      type='text'
    />

    <div className='mt-2 a' style={{height: '20rem'}}>
      {(internalLat === undefined
      || internalLng === undefined)
      && <LoadingIndicator
	   data-testid='components.wherePicker.loadingIndicator'
      />
      }
      {(internalLat != undefined
      && internalLng != undefined) &&
       <Map
	 center={{lat: internalLat, lng: internalLng, timestamp: new Date()}}
	 controls={controls}
	 layers={[layer]}
	 locked={isLocked}
	 minZoom={14}
       />
      }
    </div>
  </>;
};
