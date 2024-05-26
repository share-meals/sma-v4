// todo: when resend email, get auth/too-many-requests

import {auth} from '@/components/Firebase';
import {FormattedMessage} from 'react-intl';
import {
  IonButton,
  IonCol,
  IonGrid,
  IonIcon,
  IonImg,
  IonItem,
  IonList,
  IonRow,
  IonText,
} from '@ionic/react';
import {Notice} from '@/components/Notice';
import {sendEmailVerification} from 'firebase/auth';
import {StateButton} from '@share-meals/frg-ui';
import {
  useEffect,
  useRef,
  useState
} from 'react';
import {useProfile} from '@/hooks/Profile';
import {useHistory} from 'react-router-dom';

import VerifyEmailSVG from '@/assets/svg/verifyEmail.svg';

export const VerifyEmail: React.FC = () => {
  const history = useHistory();
  const unblock = useRef<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [stillUnverified, setStillUnverified] = useState(false);
  const [verifyEmailResent, setVerifyEmailResent] = useState(false);
  const {user} = useProfile();

  useEffect(() => {
    unblock.current = history.block();
  }, []);
  
  const logout = () => {
    unblock.current();
    auth.signOut();
  }
  
  const resendVerificationEmail = () => {
    sendEmailVerification(auth.currentUser!);
    setVerifyEmailResent(true);
  };

  const verifyStatus = async () => {
    setIsLoading(true);
    await auth.currentUser!.reload();
    if(auth.currentUser!.emailVerified){
      unblock.current();
      history.replace('/map');
    }else{
      setStillUnverified(true);
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
	      values={{email: user.email}}
	    />
	  </p>
	</IonText>
	<StateButton
	  expand='block'
	  isLoading={isLoading}
	  onClick={verifyStatus}
	  size='large'>
	  <FormattedMessage id='pages.verifyEmail.yesVerified' />
	</StateButton>
	{stillUnverified &&
	 <Notice color='danger'>
	   <FormattedMessage id='pages.verifyEmail.stillUnverified' />
	 </Notice>
	}
      </IonCol>
    </IonRow>
    <IonRow>
      <IonCol size-xs='6'>
	<IonButton
	  fill='outline'
	  onClick={logout}
	  size='default'>
	  <FormattedMessage id='common.label.logout' />
	</IonButton>
      </IonCol>
      <IonCol size-xs='6' className='ion-text-right'>
	<IonButton
	  fill='outline'
	  onClick={resendVerificationEmail}
	  size='default'>
	  <FormattedMessage id='pages.verifyEmail.resendButton' />
	</IonButton>
	{verifyEmailResent &&
	 <Notice color='success'>
	   <FormattedMessage id='pages.verifyEmail.verifyEmailResent' />
	 </Notice>
	}

      </IonCol>
    </IonRow>
  </IonGrid>;
}
