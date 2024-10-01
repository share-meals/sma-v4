import {auth} from '@/components/Firebase';
import {
  Checkbox,
  Input,
  StateButton,
  Toggle
} from '@share-meals/frg-ui';
import {FirebaseError} from '@firebase/util';
import {
  FormattedMessage,
  useIntl
} from 'react-intl';
import {
  getFunctions,
  httpsCallable,
} from 'firebase/functions';
import {
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import {LanguageSwitcher} from '@/components/LanguageSwitcher';
import {Notice} from '@/components/Notice';
import {PrivacyPolicy} from '@/pages/PrivacyPolicy';
import {
  sendEmailVerification,
  signInWithEmailAndPassword
} from 'firebase/auth';
import {
  useCallback,
  useRef,
  useState,
} from 'react';
import {useForm} from 'react-hook-form';
import {signupSchema} from '@sma-v4/schema';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';

import SignupSVG from '@/assets/svg/signup.svg';
import CloseIcon from '@material-symbols/svg-400/rounded/close.svg';

const functions = getFunctions();
const signupFunction = httpsCallable(functions, 'user-create');

const SignupForm: React.FC = () => {
  const intl = useIntl();
  const [error, setError] = useState<string | null>(null);
  const getMessage = useCallback((code: string, message?: string) => {
    switch(code){
      case 'auth/email-already-exists':
      case 'functions/already-exists':
	return intl.formatMessage({id: 'pages.signup.error.email-already-exists'});
      case 'functions/invalid-argument':
	switch(message){
	  case 'no matched communities':
	    return intl.formatMessage({id: 'common.errors.noCommunitiesFound'});
	    break;
	  default:
	    // do nothing?
	    break;
	}
	
      default:
	return intl.formatMessage({id: 'pages.login.error.default'});
    }
  }, []);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const modal = useRef<HTMLIonModalElement>(null);
  const defaultValues = import.meta.env.VITE_ENVIRONMENT === 'emulator' ? {
    email: `${Math.random()}@test.com`,
    password: 'passwordpassword',
    confirmPassword: 'passwordpassword',
    name: 'test user'
  } : {};
  const {
    control,
    formState,
    handleSubmit
  } = useForm({
    defaultValues,
    mode: 'onSubmit',
    resolver: zodResolver(signupSchema),
    reValidateMode: 'onSubmit',
  });

  const onSubmit = handleSubmit(
    async (data) => {
      setIsLoading(true);
      signupFunction(data)
	.then(async () => {
	  const response = await signInWithEmailAndPassword(auth, data.email, data.password);
	  // todo: verify that this works on server
	  sendEmailVerification(response.user);
	}).catch((error: unknown) => {
	  if(error instanceof FirebaseError){
	    setError(getMessage(error.code, error.message));
	  }
	}).finally(() => {
	  setIsLoading(false);
	});
  });
  return <>
    <form
      noValidate
      onSubmit={onSubmit}>
      <Input
	control={control}
	disabled={isLoading}
	fill='outline'
	helperText={intl.formatMessage({id: 'pages.signup.emailEduAddress'})}
	label={intl.formatMessage({id: 'common.label.email'})}
	labelPlacement='floating'
	name='email'
	required={true}
	type='email'
      />
      <Input
	control={control}
	disabled={isLoading}
	fill='outline'
	label={intl.formatMessage({id: 'common.label.password'})}
	labelPlacement='floating'
	name='password'
	required={true}
	type='password'
      />
      <Input
	control={control}
	disabled={isLoading}
	fill='outline'
	label={intl.formatMessage({id: 'forms.label.confirmPassword'})}
	labelPlacement='floating'
	name='confirmPassword'
	required={true}
	type='password'
      />
      <Input
	control={control}
	disabled={isLoading}
	fill='outline'
	label={intl.formatMessage({id: 'common.label.name'})}
	labelPlacement='floating'
	name='name'
	required={true}
	type='text'
      />
      <Input
	control={control}
	disabled={isLoading}
	fill='outline'
	helperText={intl.formatMessage({id: 'pages.signup.communityCodeOptional'})}
	label={intl.formatMessage({id: 'common.label.communityCode'})}
	labelPlacement='floating'
	name='communityCode'
	type='text'
      />
      <IonList lines='none'>
	<IonItem lines='none'>
	  <IonLabel>
	    <FormattedMessage id='pages.signup.privacyPolicy' />
	  </IonLabel>
	  <IonButton
	    data-testid='button-showPrivacyPolicy'
	    fill='outline'
	    id='showPrivacyPolicy'
	    size='default'
	    slot='end'>
	    <FormattedMessage id='common.label.read' />
	  </IonButton>
	</IonItem>
	<IonItem lines='none' className='ion-hide'>
	  <IonLabel>
	    <FormattedMessage id='pages.signup.tos' />
	  </IonLabel>
	  <IonButton
	    fill='outline'
	    size='default'
	    slot='end'>
	    <FormattedMessage id='common.label.read' />
	  </IonButton>
	</IonItem>
      </IonList>
      <div className='ion-padding-top ion-text-center'>
	<StateButton
	  id='signup-submit-button'
	  isLoading={isLoading}
	  type='submit'>
	  <FormattedMessage
	    id='buttons.label.signup'
	  />
	</StateButton>
      </div>
      {formState.isSubmitted
      && Object.keys(formState.errors).length > 0
      && <Notice color='danger'>
	<FormattedMessage id='common.label.formHasErrors' />
      </Notice>}
      {error && <Notice color='danger'>
	{error}
      </Notice>}
    </form>
    <IonModal
      ref={modal}
      trigger='showPrivacyPolicy'
      data-testid='modal-privacyPolicy'>
      <IonHeader className='ion-no-border'>
        <IonToolbar color='primary'>
	  <IonTitle>
	    <FormattedMessage id='pages.privacyPolicy.title' />
	  </IonTitle>
          <IonButtons slot='end'>
            <IonButton
	      data-testid='button-close'
	      onClick={() => modal.current?.dismiss()}>
	      <IonIcon icon={CloseIcon} slot='icon-only' />
	    </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className='ion-padding'>
	<PrivacyPolicy />
      </IonContent>
    </IonModal>
  </>;
}
export const Signup: React.FC = () => {  
  return <IonGrid>
      <IonRow>
	<IonCol size-xs='6' push-xs='3' push-sm='0'>
	  <img src={SignupSVG} className='square responsive' />
	</IonCol>
	<IonCol size-xs='12' size-sm='6' className='pt-2'>
	  <LanguageSwitcher
	    fill='outline'
	    labelPlacement='stacked'
	  />
	  <IonText>
	    <p className='ion-padding-bottom'>
	      <FormattedMessage
		id='pages.signup.greeting'
	      />
	    </p>
	  </IonText>
	  <SignupForm />
	</IonCol>
      </IonRow>
    </IonGrid>;
};
