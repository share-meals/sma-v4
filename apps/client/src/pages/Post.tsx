import {
  Input,
  Select,
  StateButton,
  Textarea
} from '@share-meals/frg-ui';
import {
  FormattedMessage,
  useIntl,
} from 'react-intl';
import {
  getFunctions,
  httpsCallable,
} from 'firebase/functions';
import {getTimezoneOffsetString} from '@/utilities';
import {
  IonButton,
  IonCol,
  IonGrid,
  IonLabel,
  IonListHeader,
  IonRow,
  isPlatform,
  useIonViewWillEnter,
} from '@ionic/react';
import {StateButtonLoadingIndicator} from '@/components/StateButtonLoadingIndicator';
import {toast} from 'react-toastify';
import {WhenPicker} from '@/components/WhenPicker';
import {WherePicker} from '@/components/WherePicker';
import {Notice} from '@/components/Notice';
import {PhotoPicker} from '@/components/PhotoPicker';
import {
  useMemo,
  useState,
  useRef
} from 'react';
import {useFormContext} from 'react-hook-form';
import {useHistory} from 'react-router-dom';
import {usePostForm} from '@/hooks/PostForm';
import {useProfile} from '@/hooks/Profile';


export const Post: React.FC = () => {
  const formRef = useRef<null | HTMLFormElement>(null);
  const [wherePickerRerenderTrigger, setWherePickerRerenderTrigger] = useState<Date | null>(null);
  const history = useHistory();
  const intl = useIntl();
  const {
    isWherePickerReady,
    resetWhenPickerToNow,
    setIsWherePickerReady,
  } = usePostForm();
  const {
    control,
    formState,
    handleSubmit,
    reset
  } = useFormContext();
  const {communities, features} = useProfile();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const functions = getFunctions();
  const postFunction = httpsCallable(functions, 'post-create');
  // todo: filter those that can post and mustwhitelistpost and is admin
  const communityOptions = useMemo(
    () => features.canPost.map((id: string) => ({
      value: id,
      label: communities[id].name
    })
    ), [communities, features]);
  const dietaryTagOptions = useMemo(() => ([
    {
      value: '-dairy',
      label: intl.formatMessage({id: 'common.dietary_tags.-dairy'})
    },
    {
      value: '-nuts',
      label: intl.formatMessage({id: 'common.dietary_tags.-nuts'})
    },
    {
      value: '+glutenFree',
      label: intl.formatMessage({id: 'common.dietary_tags.+glutenFree'})
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
    if(features.canPost.length === 0){
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
      ends: data.ends + getTimezoneOffsetString()
    }).then(() => {
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

  return <div data-testid='pages.post'>
    <form
      id='post-form'
      noValidate
      onSubmit={onSubmit}
      ref={formRef} />
    <IonListHeader color='dark'>
      <FormattedMessage id='pages.post.what' />
    </IonListHeader>
    <div className='ion-padding'>
      <Input
      control={control}
      data-testid='pages.post.title.input'
	disabled={isLoading}
	fill='outline'
	form='post-form'
	label={intl.formatMessage({id: 'common.label.title'})}
	labelPlacement='floating'
	name='title'
	required={true}
	type='text'
      />
      <Textarea
      control={control}
      data-testid='pages.post.details.input'
	disabled={isLoading}
	fill='outline'
	form='post-form'
	label={intl.formatMessage({id: 'common.label.details'})}
	labelPlacement='floating'
	name='details'
	required={true}
	rows={4}
      />
      <Select
	cancelText={intl.formatMessage({id: 'buttons.label.cancel'})}
	control={control}
	data-testid='pages.post.communities.select'
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
      <IonGrid className='ion-no-padding'>
	<IonRow>
	  <IonCol style={{paddingRight: '0.5rem'}}>
	    <Select
	      cancelText={intl.formatMessage({id: 'buttons.label.cancel'})}
	      control={control}
	      data-testid='pages.post.tags.select'
	      disabled={isLoading}
	      fill='outline'
	      form='post-form'
	      label={intl.formatMessage({id: 'common.label.dietary_tags'})}
	      labelPlacement='floating'
	      multiple={true}
	      name='tags'
	      okText={intl.formatMessage({id: 'buttons.label.ok'})}
	      options={dietaryTagOptions}
	    />
	  </IonCol>
	  <IonCol style={{paddingLeft: '0.5rem'}}>
	    <Input
	      control={control}
	      data-testid='pages.post.servings.input'
	      disabled={isLoading}
	      fill='outline'
	      form='post-form'
	      label={intl.formatMessage({id: 'common.label.servings'})}
	      labelPlacement='floating'
	      name='servings'
	    type='number'
	    />
	  </IonCol>
	</IonRow>
      </IonGrid>
    </div>
    <IonListHeader color='dark'>
      <div className='ion-align-items-center ion-justify-content-between' style={{display: 'flex', width: '100%'}}>
	<FormattedMessage id='common.label.when' />
	<IonButton
	  aria-label={intl.formatMessage({id: 'components.whenPicker.happeningNow.button.ariaLabel'})}
	  className='pr-1'
	  color='light'
	  data-testid='pages.post.happeningNow.button'
	  disabled={isLoading}
	  fill='outline'
	  onClick={resetWhenPickerToNow}>
	  <FormattedMessage id='components.whenPicker.happeningNow.button.text' />
	</IonButton>
      </div>
    </IonListHeader>
    <div className='ion-padding'>
      <WhenPicker isLoading={isLoading} name='post' />
    </div>
    <IonListHeader color='dark'>
      <FormattedMessage id='common.label.where' />
    </IonListHeader>
    <div className='ion-padding'>
      <WherePicker
	isLoading={isLoading}
	isWherePickerReady={isWherePickerReady}
	rerenderTrigger={wherePickerRerenderTrigger}
	setIsWherePickerReady={setIsWherePickerReady}
      />
    </div>
    {!isPlatform('android') &&
     <PhotoPicker isLoading={isLoading} />
    }
    <div className='pt-3 ion-text-center'>
      <StateButton
	aria-label={intl.formatMessage({id: 'pages.post.submit.button.ariaLabel'})}
	data-testid='pages.post.submit.button'
	form='post-form'
	isLoading={isLoading || !isWherePickerReady}
	loadingIndicator={<StateButtonLoadingIndicator />}
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
	data-testid='pages.post.reset.button'
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
