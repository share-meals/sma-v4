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
import {signInWithEmailAndPassword} from 'firebase/auth';
import {useAuth} from 'reactfire';
import {useForm} from 'react-hook-form';
import {userSchema} from '@sma-v4/schema';
import {useState} from 'react';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';

import LoginSVG from '@/assets/svg/login.svg';
import ArrowOutwardIcon from '@material-design-icons/svg/sharp/arrow_outward.svg';

const LoginForm: React.FC = () => {
  const auth = useAuth();
  const intl = useIntl();
  const [toast] = useIonToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {
    control,
    handleSubmit
  } = useForm({
    mode: 'onBlur',
    resolver: zodResolver(
      userSchema.pick({
	email: true,
	password: true
      })
    )
  });

  const onSubmit = handleSubmit(async (data) => {
    setIsLoading(true);
    try{
      await signInWithEmailAndPassword(auth, data.email, data.password);
    } catch(error: unknown){
      if(error instanceof FirebaseError){
	// todo: common errors
	toast({
	  color: 'danger',
	  duration: 5 * 1000,
	  mode: 'md',
	  onDidDismiss: () => {setIsLoading(false)},
	  position: 'top',
	  positionAnchor: 'login-submit-button',
	  message: intl.formatMessage({
	    id: 'common.toast.error',
	    defaultMessage: 'Error: {code}',
	    // @ts-ignore
	  }, {code: error.code}),
	  swipeGesture: 'vertical'
	});
      }
    }
    setIsLoading(false);
  });
  
  return <>
    <IonText>
      <p className='ion-padding-bottom'>
	<FormattedMessage
	  id='pages.login.greeting'
	  defaultMessage='To begin using the Share Meals app, please log in.'
	/>
      </p>
    </IonText>
    <form
      onSubmit={onSubmit}>
      <Input
	control={control}
	disabled={isLoading}
	label={intl.formatMessage({
	  id: 'forms.label.email',
	  defaultMessage: 'Email',
	})}
	name='email'
	type='email'
      />
      <Input
	control={control}
	disabled={isLoading}
	label={intl.formatMessage({
	  id: 'forms.label.password',
	  defaultMessage: 'Password',
	})}
	name='password'
	type='password'
      />
      <div className='ion-padding-top ion-text-center'>
	<StateButton
	  id='login-submit-button'
	  isLoading={isLoading}
	  type='submit'>
	  <FormattedMessage
	    id='buttons.label.login'
	    defaultMessage='Login'
	  />
	</StateButton>
      </div>
    </form>
  </>;
}

export const Login: React.FC = () => {
  return (
    <IonGrid>
      <IonRow>
	<IonCol>
	  <IonImg src={LoginSVG} style={{width: '100%'}}/>
	</IonCol>
	<IonCol>
	  <LoginForm />
	  <IonList style={{marginTop: '4rem'}}>
	    <IonItem
	      className='ion-text-right ion-hide'
	      href='/forgot-password'
	      lines='none'>
	      <IonLabel>
		<FormattedMessage
		  id='pages.login.forgotPassword'
		  defaultMessage='forgot your password?'
		/>
	      </IonLabel>
	      <IonIcon color='primary' slot='end' src={ArrowOutwardIcon} />
	    </IonItem>
	  </IonList>
	</IonCol>
      </IonRow>
    </IonGrid>
  )
};
