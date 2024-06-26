import {FirebaseError} from '@firebase/util';
import {
  FormattedMessage,
  useIntl,
} from 'react-intl';
import {
  getFunctions,
  httpsCallable,
} from 'firebase/functions';
import {
  IonButton,
  IonCol,
  IonGrid,
  IonLabel,
  IonListHeader,
  IonRow,
  IonText,
  useIonViewWillEnter,
} from '@ionic/react';
import {
  Input,
  Select,
  StateButton,
  Textarea
} from '@share-meals/frg-ui';
import {toast} from 'react-toastify';
import {WhenPicker} from '@/components/WhenPicker';
import {WherePicker} from '@/components/WherePicker';
import {Notice} from '@/components/Notice';
import {
  useEffect,
  useMemo,
  useState,
  useRef
} from 'react';
import {useFormContext} from 'react-hook-form';
import {useHistory} from 'react-router-dom';
import {usePostForm} from '@/hooks/PostForm';
import {useProfile} from '@/hooks/Profile';

const getTimezoneOffsetString: () => string = () => {
    const offsetMinutes = new Date().getTimezoneOffset();
    
    // Convert offset to hours and minutes
    const hours = Math.floor(Math.abs(offsetMinutes) / 60);
    const minutes = Math.abs(offsetMinutes) % 60;
    
    // Construct the UTC offset string
    const offsetString = (offsetMinutes >= 0 ? '-' : '+') +
        ('0' + hours).slice(-2) + ':' +
        ('0' + minutes).slice(-2);
    return offsetString;
}

export const Post: React.FC = () => {
  const formRef = useRef<null | HTMLFormElement>(null);
  const [wherePickerRerenderTrigger, setWherePickerRerenderTrigger] = useState<Date | null>(null);
  const history = useHistory();
  const intl = useIntl();
  const {
    isWherePickerReady,
    resetWhenPickerToNow
  } = usePostForm();
  const {
    control,
    formState,
    handleSubmit,
    watch,
    reset
  } = useFormContext();
  const {communities, features} = useProfile();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const functions = getFunctions();
  const postFunction = httpsCallable(functions, 'post-create');

  // todo: filter those that can post and mustwhitelistpost and is admin
  const community_options = useMemo(
    () => Object.entries(communities).map(
      ([id, data]: [string, any]) => ({
	value: id,
	label: data.name
      })
    ), [communities]);
  const dietary_tag_options = useMemo(() => ([
    {
      value: '-dairy',
      label: intl.formatMessage({id: 'common.dietary_tags.-dairy'})
    },
    {
      value: '-nuts',
      label: intl.formatMessage({id: 'common.dietary_tags.-nuts'})
    },
    {
      value: '+gluten_free',
      label: intl.formatMessage({id: 'common.dietary_tags.+gluten_free'})
    },
    {
      value: '+halal',
      label: intl.formatMessage({id: 'common.dietary_tags.+halal'})
    },
    {
      value: '+kosher',
      label: intl.formatMessage({id: 'common.dietary_tags.+kosher'})
    },
    {
      value: '+vegan',
      label: intl.formatMessage({id: 'common.dietary_tags.+vegan'})
    },
    {
      value: '+vegetarian',
      label: intl.formatMessage({id: 'common.dietary_tags.+vegetarian'})
    }
  ]), []);
  useIonViewWillEnter(() => {
    if(!features.canPost){
      history.replace('/map');
      return;
    }
    if(Object.keys(formState.dirtyFields).length === 0){
      reset();
    }
  }, [formState]);

  const onSubmit = handleSubmit((data) => {
    setIsLoading(true);
    postFunction({
      ...data,
      starts: data.starts + getTimezoneOffsetString(),
      ends: data.ends + getTimezoneOffsetString(),
      type: 'event'
    }).then((response) => {
      reset();
      setWherePickerRerenderTrigger(new Date());
      formRef.current!.scrollIntoView(true);
      toast.success(intl.formatMessage({id: 'pages.post.success'}));
      history.push('/map');
    }).catch((error) => {
      console.log(error);
    }).finally(() => {
      setIsLoading(false);
    });
  }, (error) => {
    console.log(error);
  });

  return <form
	   noValidate
	   onSubmit={onSubmit}
	   ref={formRef}>
    <IonListHeader color='dark'>
      <FormattedMessage id='pages.post.what' />
    </IonListHeader>
    <div className='ion-padding'>
      <Input
	control={control}
	disabled={isLoading}
	fill='outline'
	label={intl.formatMessage({id: 'common.label.title'})}
	labelPlacement='floating'
	name='title'
	required={true}
	type='text'
      />
      <Textarea
	control={control}
	disabled={isLoading}
	fill='outline'
	label={intl.formatMessage({id: 'common.label.details'})}
	labelPlacement='floating'
	name='details'
	required={true}
	rows={4}
      />
      <Select
	cancelText={intl.formatMessage({id: 'buttons.label.cancel'})}
	control={control}
	disabled={isLoading}
	fill='outline'
	label={intl.formatMessage({id: 'common.label.communities'})}
	labelPlacement='floating'
	multiple={true}
	name='communities'
	okText={intl.formatMessage({id: 'buttons.label.ok'})}
	options={community_options}
	required={true}
      />
      <Select
	cancelText={intl.formatMessage({id: 'buttons.label.cancel'})}
	control={control}
	disabled={isLoading}
	fill='outline'
	label={intl.formatMessage({id: 'common.label.dietary_tags'})}
	labelPlacement='floating'
	multiple={true}
	name='tags'
	okText={intl.formatMessage({id: 'buttons.label.ok'})}
	options={dietary_tag_options}
      />
      <Input
	control={control}
	disabled={isLoading}
	fill='outline'
	label={intl.formatMessage({id: 'common.label.servings'})}
	labelPlacement='floating'
	name='servings'
	type='number'
      />
    </div>
    <IonListHeader color='dark'>
      <div className='ion-align-items-center ion-justify-content-between' style={{display: 'flex', width: '100%'}}>
	<FormattedMessage id='pages.post.when' />
	<IonButton
	  className='pr-1'
	  color='light'
	  disabled={isLoading}
	  fill='outline'
	  onClick={resetWhenPickerToNow}>
	  <FormattedMessage id='components.whenPicker.happeningNow' />
	</IonButton>
      </div>
    </IonListHeader>
    <div className='ion-padding'>
      <WhenPicker isLoading={isLoading} />
    </div>
    <IonListHeader color='dark'>
      <FormattedMessage id='pages.post.where' />
    </IonListHeader>
    <div className='ion-padding'>
      <WherePicker isLoading={isLoading} rerenderTrigger={wherePickerRerenderTrigger}/>
    </div>
    <div className='pt-3 ion-text-center'>
      <StateButton
	isLoading={isLoading || !isWherePickerReady}
	size='large'
	type='submit'>
	<FormattedMessage id='pages.post.post' />
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
  </form>;
};
