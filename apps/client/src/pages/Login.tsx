import {signInWithEmailAndPassword} from 'firebase/auth';
import {FirebaseError} from '@firebase/util';
import {
  FormattedMessage,
  useIntl
} from 'react-intl';
import {
  Input,
  StateButton
} from '@share-meals/frg-ui';
import {
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  //IonImg, // don't use since lazy loading causes flickering
  IonItem,
  IonList,
  IonModal,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import {getFirebaseAuth} from '@/components/Firebase';
import {Notice} from '@/components/Notice';
import {ResetPassword} from '@/pages/ResetPassword';
import {
  useCallback,
  useRef,
  useState,
} from 'react';
import {useForm} from 'react-hook-form';
import {useLogger} from '@/hooks/Logger';
import {useMessaging} from '@/hooks/Messaging';
import {userSchema} from '@sma-v4/schema';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';

import CloseSVG from '@material-symbols/svg-400/rounded/close.svg';
import LoginSVG from '@/assets/svg/login.svg';

const LoginForm: React.FC = () => {
  const intl = useIntl();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {enable, sendMessagingToken} = useMessaging();
  const {log} = useLogger();
  const {
    control,
    formState,
    handleSubmit,
  } = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(
      userSchema.pick({
	email: true,
	password: true
      })
    ),
    reValidateMode: 'onSubmit'
  });
  const getMessage = useCallback((code: string) => {
    switch(code){
      case 'auth/user-not-found':
      case 'auth/wrong-password':
	return intl.formatMessage({id: 'pages.login.error.incorrectEmailOrPassword'});
      default:
	return intl.formatMessage({id: 'pages.login.error.default'});
    }
  }, []);

  const onSubmit = handleSubmit(async (data) => {
    setIsLoading(true);
    log({
      level: 'debug',
      component: 'login',
      message: 'logging in'
    });
    try{
      await signInWithEmailAndPassword(getFirebaseAuth(), data.email, data.password);
      await enable();
      await sendMessagingToken();
    }catch(error){
      if(error instanceof FirebaseError){
	log({
	  level: 'error',
	  component: 'login',
	  message: error.code
	});
	setError(error.code);
      }
    }
    setIsLoading(false);
    /*
       signInWithEmailAndPassword(auth, data.email, data.password)
       .catch((error: unknown) => {
      })
      .finally(() => {
	setIsLoading(false);
      });
    */
  });
  
  return <>
  <form
    noValidate
    onSubmit={onSubmit}>
    <Input
      control={control}
      data-testid='input-email'
      disabled={isLoading}
      fill='outline'
      label={intl.formatMessage({id: 'common.label.email'})}
      labelPlacement='floating'
      name='email'
      required={true}
      type='email'
    />
    <Input
      control={control}
      data-testid='input-password'
      disabled={isLoading}
      fill='outline'
      label={intl.formatMessage({id: 'common.label.password'})}
      labelPlacement='floating'
      name='password'
      required={true}
      type='password'
    />
    <div className='ion-padding-top ion-text-center'>
      <StateButton
	data-testid='button-submit'
	isLoading={isLoading}
	type='submit'>
	<FormattedMessage id='buttons.label.login' />
      </StateButton>
    </div>
    {formState.isSubmitted
    && Object.keys(formState.errors).length > 0
    && <Notice color='danger'>
      <FormattedMessage id='common.label.formHasErrors' />
    </Notice>}
    {error && <Notice color='danger'>
      {getMessage(error)}
    </Notice>}
  </form>
  </>;
}

export const Login: React.FC = () => {
  const modal = useRef<HTMLIonModalElement>(null);
  return <>
    <IonGrid>
      <IonRow>
	<IonCol size-xs='6' push-xs='3' push-sm='0'>
	  <img src={LoginSVG} className='square responsive' />
	</IonCol>
	<IonCol size-xs='12' size-sm='6'>
	  <IonText>
	    <p className='ion-padding-bottom'>
	      <FormattedMessage
	      id='pages.login.greeting'
	      />
	    </p>
	  </IonText>
	  <LoginForm />
	  <div className='ion-text-right mt-3'>
	    <IonButton
	      fill='clear'
	      id='showResetPassword'>
	      <FormattedMessage id='pages.login.resetPassword' />
	    </IonButton>
	  </div>
	</IonCol>
      </IonRow>
    </IonGrid>
    <IonModal ref={modal} trigger='showResetPassword'>
      <IonHeader className='ion-no-border'>
        <IonToolbar color='primary'>
	  <IonTitle>
	    <FormattedMessage id='pages.resetPassword.title' />
	  </IonTitle>
          <IonButtons slot='end'>
            <IonButton onClick={() => modal.current?.dismiss()}>
	      <IonIcon icon={CloseSVG} slot='icon-only' />
	    </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className='ion-padding'>
	<ResetPassword />
      </IonContent>
    </IonModal>
    </>;
};
