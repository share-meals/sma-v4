import {
  fromAddress,
  OutputFormat,
  setDefaults,
  setLocationType,
} from 'react-geocode';
import {
  Input
} from '@share-meals/frg-ui';
import {
  IonButton,
  IonIcon,
} from '@ionic/react';
import {useEffect} from 'react';
import {useForm} from 'react-hook-form';
import {useFormContext} from 'react-hook-form';
import {useIntl} from 'react-intl';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';

import SearchIcon from '@material-symbols/svg-400/rounded/search.svg';

export interface ManualAddressPicker {
}

const internalForm = z.object({
  address: z.string().min(3)
});

export const ManualAddressPicker: React.FC<ManualAddressPicker> = () => {
  const intl = useIntl();
  const {
    setValue
  } = useFormContext();
  const {
    control,
    handleSubmit,
    setError: setInternalError,
    setValue: setInternalValue,
  } = useForm<z.infer<typeof internalForm>>({
    resolver: zodResolver(internalForm)
  });

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

  const onSubmit = handleSubmit(async (response) => {
    try{
      const {results} = await fromAddress(response.address);
      console.log(results);
      switch(results.length){
	case 0:

	  break;
	case 1:
	  setInternalValue('address', results[0].formatted_address);
	  setValue('location.address', results[0].formatted_address);
	  setValue('location.lat', results[0].geometry.location.lat);
	  setValue('location.lng', results[0].geometry.location.lng);
	  break;
	default:

	  break;
      }
    }catch(error: unknown){
      if(error instanceof Error){
	if(error.message.includes('ZERO_RESULTS')){
	  setInternalError('address', {message: 'no results found', type: 'zero_results'});
	}else{
	  // TODO: something
	}
      }else{
	// TODO: something
      }
    }
  });
  return <div className='margin-between-form-components'>
    <form id='manual-address-form' onSubmit={onSubmit}/>
      <Input
	control={control}
	fill='outline'
	form='manual-address-form'
	label={intl.formatMessage({id: 'components.manualAddressPicker.address'})}
	labelPlacement='floating'
	name='address'
	onBlur={onSubmit}
      >
	<IonButton
	  fill='clear'
	  slot='end'
	  type='submit'
	  onClick={onSubmit}>
	  <IonIcon icon={SearchIcon} slot='icon-only' />
	</IonButton>
      </Input>
  </div>;
}
