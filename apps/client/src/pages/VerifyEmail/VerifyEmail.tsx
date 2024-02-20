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
import {useHistory} from 'react-router-dom';
import {useState} from 'react';

import VerifyEmailSVG from '@/assets/svg/verifyEmail.svg';

export const VerifyEmail: React.FC = () => {
  const auth = useAuth();
  const history = useHistory();
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(false);
  const [toast] = useIonToast();
  
  const logout = () => {
    auth.signOut();
  }
  
  const resendVerificationEmail = () => {
    sendEmailVerification(auth.currentUser!);
    toast({
      color: 'warning',
      duration: 5 * 1000,
      mode: 'md',
      position: 'top',
      positionAnchor: 'verify-email-resend-button',
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
      history.push('/map');
    }else{
      toast({
	color: 'danger',
	duration: 5 * 1000,
	mode: 'md',
	position: 'top',
	positionAnchor: 'verify-status-button',
	message: intl.formatMessage({
	  id: 'pages.verifyEmail.stillUnverified',
	  defaultMessage: 'Your account seems to still be unverified. Please the resend "Resend Email" button to receive another.'
	}),
	swipeGesture: 'vertical'
      });
    }
    setIsLoading(false);
  };
  
  return <IonGrid>
    <IonRow>
      <IonCol>
	<IonImg src={VerifyEmailSVG} style={{width: '100%'}}/>
      </IonCol>
      <IonCol>
	<IonText>
	  <p>
	    <FormattedMessage
	      id='pages.verifyEmail.greeting'
	      defaultMessage='Before continuing, please verify your email'
	    />
	  </p>
	</IonText>
	<div className='ion-text-center mb-3'>
	  <StateButton
	    id='verify-status-button'
	    isLoading={isLoading}
	    onClick={verifyStatus}>
	    <FormattedMessage
	      id='pages.verifyEmail.yesVerified'
	      defaultMessage='Yes I verified it!'
	    />
	  </StateButton>
	</div>
	<IonRow style={{alignItems: 'flex-end'}}>
	  <IonCol>
	    <IonButton fill='outline' onClick={logout}>
	      <FormattedMessage
		id='pages.common.logout'
		defaultMessage='Logout'
	      />
	    </IonButton>
	  </IonCol>
	  <IonCol className='ion-text-right'>
	    <IonButton
	      id='verify-email-resend-button'
	      onClick={resendVerificationEmail}>
	      <FormattedMessage
		id='pages.verifyEmail.resend'
		defaultMessage='Resend Email'
	      />
	    </IonButton>
	  </IonCol>
	</IonRow>
      </IonCol>
    </IonRow>
  </IonGrid>;
}
