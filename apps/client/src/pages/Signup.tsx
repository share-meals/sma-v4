import {auth} from '@/components/Firebase';
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
  Input,
  StateButton,
} from '@share-meals/frg-ui';
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
import {StateButtonLoadingIndicator} from '@/components/StateButtonLoadingIndicator';
import {
  useCallback,
  useRef,
  useState,
} from 'react';
import {useForm} from 'react-hook-form';
import {signupSchema} from '@sma-v4/schema';
import {zodResolver} from '@hookform/resolvers/zod';

import SignupSVG from '@/assets/svg/signup.svg';
import CloseIcon from '@material-symbols/svg-400/rounded/close.svg';

const functions = getFunctions();
const signupFunction = httpsCallable(functions, 'user-create');

const SignupForm: React.FC = () => {
  const intl = useIntl();
  const [errorI18nKey, setErrorI18nKey] = useState<string | null>(null);
  const getMessage = useCallback((code: string, message?: string) => {
    switch(code){
      case 'auth/email-already-exists':
      case 'functions/already-exists':
	return 'pages.signup.error.email-already-exists';
      case 'functions/invalid-argument':
	switch(message){
	  case 'no matched communities':
	    return 'common.errors.noCommunitiesFound';
	    break;
	  default:
	    // do nothing?
	    break;
	}
	
      default:
	return 'pages.login.error.default';
    }
  }, []);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const modal = useRef<HTMLIonModalElement>(null);
  const {
    control,
    formState,
    handleSubmit
  } = useForm({
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
	    setErrorI18nKey(getMessage(error.code, error.message));
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
	    data-testid='pages.signup.privacyPolicy.button'
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
	  loadingIndicator={<StateButtonLoadingIndicator />}
	  type='submit'>
	  <FormattedMessage id='buttons.label.signup' />
	</StateButton>
      </div>
      {formState.isSubmitted
      && Object.keys(formState.errors).length > 0
      && <Notice color='danger' i18nKey='common.label.formHasErrors' />}
      {errorI18nKey && <Notice color='danger' i18nKey={errorI18nKey} />}
    </form>
    <IonModal
      aria-label={intl.formatMessage({id: 'pages.signup.privacyPolicy.modal.ariaLabel'})}
      aria-modal='true'
      data-testid='pages.signup.privacyPolicy.modal'
      ref={modal}
      role='dialog'
      trigger='showPrivacyPolicy'
    >
      {/* TODO: double check role */}
      <IonHeader role='none' className='ion-no-border'>
        <IonToolbar color='primary'>
	  <IonTitle>
	    <FormattedMessage id='pages.privacyPolicy.title' />
	  </IonTitle>
          <IonButtons slot='end'>
            <IonButton
	      aria-label={intl.formatMessage({id: 'pages.signUp.privacyPolicy.modal.close.ariaLabel'})}
	      data-testid='pages.signup.privacyPolicy.close.button'
	      onClick={() => modal.current?.dismiss()}>
	      <IonIcon
		aria-hidden='true'
		icon={CloseIcon}
		slot='icon-only'
	      />
	    </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      {/* TODO: role should not be complementary? need a11y compliance */}
      <IonContent className='ion-padding' role='complementary'>
	<PrivacyPolicy isModal={true} />
      </IonContent>
    </IonModal>
  </>;
}
export const Signup: React.FC = () => {  
  const intl = useIntl();
  return <div data-testid='pages.signup'>
    <IonGrid>
      <IonRow>
	<IonCol size-xs='6' push-xs='3' push-sm='0'>
	  <img
	    alt={intl.formatMessage({id: 'pages.signupPage.image.alt'})}
	    src={SignupSVG}
	    className='square responsive'
	  />
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
    </IonGrid>
  </div>;
};
