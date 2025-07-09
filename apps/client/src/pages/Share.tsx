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
import {StateButtonLoadingIndicator} from '@/components/StateButtonLoadingIndicator';
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
    resetWhenPickerToNow,
    setIsWherePickerReady,
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
    }).then(() => {
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

  
  return <div
	 data-testid='pages.share'>
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
	data-testid='pages.share.communities.select'
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
	<FormattedMessage id='common.label.when' />
	<IonButton
	  aria-label={intl.formatMessage({id: 'components.whenPicker.happeningNow.button.ariaLabel'})}
	  className='pr-1'
	  color='light'
	  disabled={isLoading}
	  fill='outline'
	  onClick={resetWhenPickerToNow}>
	  <FormattedMessage id='components.whenPicker.happeningNow.button.text' />
	</IonButton>
      </div>
    </IonListHeader>
    <div className='ion-padding'>
      <WhenPicker isLoading={isLoading} name='share' />
    </div>
    <IonListHeader color='dark'>
      <FormattedMessage id='common.label.where' />
    </IonListHeader>
    <div className='ion-padding'>
      <WherePicker
	defaultMethod='commonList'
	isLoading={isLoading}
	isWherePickerReady={isWherePickerReady}
	rerenderTrigger={wherePickerRerenderTrigger}
	setIsWherePickerReady={setIsWherePickerReady}
      />
    </div>
    <div className='pt-3 ion-text-center'>
      <StateButton
	form='share-form'
	isLoading={isLoading/* || !isWherePickerReady*/}
	size='large'
	loadingIndicator={<StateButtonLoadingIndicator />}
	type='submit'>
	<FormattedMessage id='common.label.share' />
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
  </div>;
};
