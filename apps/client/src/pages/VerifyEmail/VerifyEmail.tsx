// todo: when resend email, get auth/too-many-requests

import {
  FormattedMessage,
  useIntl
} from 'react-intl';
import {
  IonButton,
  IonCol,
  IonGrid,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonRow,
  IonText,
  useIonToast
} from '@ionic/react';
import {sendEmailVerification} from 'firebase/auth';
import {StateButton} from '@share-meals/frg-ui';
import {useAuth} from 'reactfire';
import {
  useEffect,
  useRef,
  useState
} from 'react';
import {useProfile} from '@/contexts/Profile';
import {useHistory} from 'react-router-dom';

import VerifyEmailSVG from '@/assets/svg/verifyEmail.svg';

export const VerifyEmail: React.FC = () => {
  const auth = useAuth();
  const history = useHistory();
  // @ts-ignore
  const unblock = useRef<any>();
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(false);
  const [toast] = useIonToast();
  const {uid: email} = useProfile();

  useEffect(() => {
    unblock.current = history.block();
  }, []);
  
  const logout = () => {
    auth.signOut();
  }
  
  const resendVerificationEmail = () => {
    sendEmailVerification(auth.currentUser!);
    toast({
      color: 'warning',
      duration: 5 * 1000,
      mode: 'md',
      position: 'bottom',
      message: intl.formatMessage({
	id: 'pages.verifyEmail.verificationEmailSent',
	defaultMessage: 'An email has been sent to your email address.'
      }),
      swipeGesture: 'vertical'
    });
  };

  const verifyStatus = async () => {
    setIsLoading(true);
    await auth.currentUser!.reload();
    if(auth.currentUser!.emailVerified){
      unblock.current();
      history.replace('/map');
    }else{
      toast({
	color: 'danger',
	duration: 5 * 1000,
	mode: 'ios',
	position: 'bottom',
	message: intl.formatMessage({
	  id: 'pages.verifyEmail.stillUnverified',
	  defaultMessage: 'Still unverified.'
	}),
	swipeGesture: 'vertical'
      });
    }
    setIsLoading(false);
  };
  return <IonGrid>
    <IonRow>
      <IonCol size-xs='6' push-xs='3' push-sm='0'>
	<IonImg src={VerifyEmailSVG} className='responsive square' />
      </IonCol>
      <IonCol size-xs='12' size-sm='6'>
	<IonText>
	  <p>
	    <FormattedMessage
	      id='pages.verifyEmail.greeting'
	      defaultMessage='We sent a verification email to {email}. Please open it and click on the verification link before continuing.'
	      values={{email: email}}
	    />
	  </p>
	</IonText>
	<div className='ion-text-center'>
	  <StateButton
	    isLoading={isLoading}
	    onClick={verifyStatus}>
	    <FormattedMessage
	      id='pages.verifyEmail.yesVerified'
	      defaultMessage='Yes I verified it!'
	    />
	  </StateButton>
	</div>
	<IonList className='mt-3'>
	  <IonItem lines='none'>
	    <IonLabel>
	      <FormattedMessage
		id='pages.verifyEmail.resendLabel'
		defaultMessage="didn't get one?"
	      />
	      </IonLabel>
	      <IonButton
		fill='outline'
		onClick={resendVerificationEmail}
		slot='end'
		size='default'>
	      <FormattedMessage
		id='pages.verifyEmail.resendButton'
		defaultMessage="resend"
	      />
	      </IonButton>
	  </IonItem>
	  <IonItem lines='none'>
	    <IonLabel>
	      <FormattedMessage
		id='pages.verifyEmail.logoutLabel'
		defaultMessage='not your account?'
	      />
	      </IonLabel>
	      <IonButton
		fill='outline'
		onClick={logout}
		slot='end'
		size='default'>
		<FormattedMessage
		id='pages.common.logout'
		defaultMessage='logout'
		/>
	      </IonButton>
	  </IonItem>
	</IonList>
      </IonCol>
    </IonRow>
  </IonGrid>;
}
