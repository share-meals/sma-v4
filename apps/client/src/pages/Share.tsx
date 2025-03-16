import {
  Input,
  Select,
  StateButton,
} from '@share-meals/frg-ui';
import {
  getFunctions,
  httpsCallable,
} from 'firebase/functions';
import {getTimezoneOffsetString} from '@/utilities';
import {
  FormattedMessage,
  useIntl,
} from 'react-intl';
import {
  IonButton,
  IonLabel,
  IonListHeader,
  useIonViewWillEnter,
} from '@ionic/react';
import {toast} from 'react-toastify';
import {WhenPicker} from '@/components/WhenPicker';
import {WherePicker} from '@/components/WherePicker';
import {Notice} from '@/components/Notice';
import {
  useMemo,
  useState,
  useRef
} from 'react';
import {useFormContext} from 'react-hook-form';
import {useHistory} from 'react-router-dom';
import {useProfile} from '@/hooks/Profile';
import {useShareForm} from '@/hooks/ShareForm';


export const Share: React.FC = () => {
  const formRef = useRef<null | HTMLFormElement>(null);
  const [wherePickerRerenderTrigger, setWherePickerRerenderTrigger] = useState<Date | null>(null);
  const history = useHistory();
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {
    isWherePickerReady,
    resetWhenPickerToNow
  } = useShareForm();
  const {
    control,
    formState,
    handleSubmit,
    reset
  } = useFormContext();
  const {communities, features} = useProfile();
  const communityOptions = useMemo(
    () => features.canShare.map((id: string) => ({
      value: id,
      label: communities[id].name
    })
    ), [communities, features]);
  const functions = getFunctions();
  const shareFunction = httpsCallable(functions, 'share-create');
  useIonViewWillEnter(() => {
    if(features.canShare.length === 0){
      history.replace('/map');
      return;
    }
    if(Object.keys(formState.dirtyFields).length === 0){
      reset();
    }
  }, [formState]);
  const onSubmit = handleSubmit((data) => {
    setIsLoading(true);
    shareFunction({
      ...data,
      starts: data.starts + getTimezoneOffsetString(),
      ends: data.ends + getTimezoneOffsetString()
    }).then((response) => {
      reset();
      setWherePickerRerenderTrigger(new Date());
      formRef.current!.scrollIntoView(true);
      toast.success(intl.formatMessage({id: 'pages.share.success'}));
      history.push('/map');
    }).catch((error) => {
      console.log(error);
    }).finally(() => {
      setIsLoading(false);
    });
  }, (error) => {
    console.log(error);
  });

  
  return <>
    <form
      id='share-form'
      noValidate
      onSubmit={onSubmit}
      ref={formRef} />
    <IonListHeader color='dark'>
      <FormattedMessage id='common.label.communities' />
    </IonListHeader>
    <div className='ion-padding'>
      <Select
	cancelText={intl.formatMessage({id: 'buttons.label.cancel'})}
	control={control}
	disabled={isLoading}
	fill='outline'
	form='post-form'
	label={intl.formatMessage({id: 'common.label.communities'})}
	labelPlacement='floating'
	multiple={true}
	name='communities'
	okText={intl.formatMessage({id: 'buttons.label.ok'})}
	options={communityOptions}
	required={true}
      />
    </div>
    <IonListHeader color='dark'>
      <FormattedMessage id='pages.share.howMany' />
    </IonListHeader>
    <div className='ion-padding'>
      <Input
	control={control}
	disabled={isLoading}
	fill='outline'
	form='share-form'
	helperText={intl.formatMessage({id: 'pages.share.swipesHelperText'})}
	label={intl.formatMessage({id: 'common.label.swipes'})}
	labelPlacement='floating'
	name='swipes'
	required={true}
	type='number'
      />
    </div>
    <IonListHeader color='dark'>
      <div className='ion-align-items-center ion-justify-content-between' style={{display: 'flex', width: '100%'}}>
	<FormattedMessage id='pages.share.when' />
	<IonButton
	  className='pr-1'
	  color='light'
	  disabled={isLoading}
	  fill='outline'
	  onClick={resetWhenPickerToNow}>
	  <FormattedMessage id='components.whenPicker.now' />
	</IonButton>
      </div>
    </IonListHeader>
    <div className='ion-padding'>
      <WhenPicker isLoading={isLoading} />
    </div>
    <IonListHeader color='dark'>
      <FormattedMessage id='pages.share.where' />
    </IonListHeader>
    <div className='ion-padding'>
      <WherePicker isLoading={isLoading} rerenderTrigger={wherePickerRerenderTrigger} />
    </div>
    <div className='pt-3 ion-text-center'>
      <StateButton
	form='share-form'
	isLoading={isLoading/* || !isWherePickerReady*/}
	size='large'
	type='submit'>
	<FormattedMessage id='pages.share.share' />
      </StateButton>
      {formState.isSubmitted
      && Object.keys(formState.errors).length > 0
      && <Notice color='danger' className='ion-margin'>
	<IonLabel>
	  <FormattedMessage id='common.label.formHasErrors' />
	</IonLabel>
      </Notice>}
    </div>
    <div className='pv-1 ion-text-right'>
      <IonButton
	disabled={isLoading}
	fill='clear'
	onClick={() => {
	     reset();
	     setWherePickerRerenderTrigger(new Date());
	     formRef.current!.scrollIntoView(true);
	}}>
	<FormattedMessage id='common.label.reset' />
      </IonButton>
    </div>

  </>;
};
