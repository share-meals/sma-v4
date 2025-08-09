// todo: when resend email, get auth/too-many-requests

import {auth} from '@/components/Firebase';
import {FormattedMessage} from 'react-intl';
import {getEnumValueOrNull} from '@/utilities/getEnumValueOrNull';
import {
  IonButton,
  IonCol,
  IonGrid,
  IonImg,
  IonRow,
  IonText,
} from '@ionic/react';
import {Notice} from '@/components/Notice';
import {sendEmailVerification} from 'firebase/auth';
import {StateButton} from '@share-meals/frg-ui';
import {StateButtonLoadingIndicator} from '@/components/StateButtonLoadingIndicator';
import {
  useEffect,
  useRef,
  useState
} from 'react';
import {useProfile} from '@/hooks/Profile';
import {useHistory} from 'react-router-dom';

import VerifyEmailSVG from '@/assets/svg/verifyEmail.svg';

enum mockEmailVerifiedValues {
  True = 'true',
  False = 'false'
}

export const VerifyEmail: React.FC = () => {
  const history = useHistory();
  const unblock = useRef<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [stillUnverified, setStillUnverified] = useState(false);
  const [verifyEmailResent, setVerifyEmailResent] = useState(false);
  const {user} = useProfile();
  const queryParams = new URLSearchParams(window.location.search);
  const mockEmailVerified = getEnumValueOrNull(mockEmailVerifiedValues, queryParams.get('mockEmailVerified'));

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
    if(auth.currentUser!.emailVerified
       && mockEmailVerified !== 'false'){
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
	    <FormattedMessage id='pages.verifyEmail.greeting' values={{email: user.email}} />
	  </p>
	</IonText>
	<StateButton
	  data-testid='pages.verifyEmail.verifyEmail.button'
	  expand='block'
	  isLoading={isLoading}
	  loadingIndicator={<StateButtonLoadingIndicator />}
	  onClick={verifyStatus}
	  size='large'>
	  <FormattedMessage id='pages.verifyEmail.yesVerified' />
	</StateButton>
	{stillUnverified &&
	 <Notice color='danger' i18nKey='pages.verifyEmail.stillUnverified' />
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
	  data-testid='pages.verifyEmail.resendVerificationEmail.button'
	  fill='outline'
	  onClick={resendVerificationEmail}
	  size='default'>
	  {/* TODO: rename these i18n keys */}
	  <FormattedMessage id='pages.verifyEmail.resendButton' />
	</IonButton>
	{verifyEmailResent &&
	 <Notice color='success' i18nKey='pages.verifyEmail.verifyEmailResent' />
	}

      </IonCol>
    </IonRow>
  </IonGrid>;
}
