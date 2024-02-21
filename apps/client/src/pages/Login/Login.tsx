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
  //IonImg, // don't use since lazy loading causes flickering
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
import {userSchema} from '@/components/schema';
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
    defaultValues: {
      email: 'jon.chin@nyu.edu',
      password: 'ragnorak'
    },
    mode: 'onBlur',
    resolver: zodResolver(
      userSchema.pick({
	email: true,
	password: true
      })
    ),
    reValidateMode: 'onBlur'
  });

  const onSubmit = handleSubmit((data) => {
    setIsLoading(true);
    signInWithEmailAndPassword(auth, data.email, data.password)
      .catch((error: unknown) => {
      if(error instanceof FirebaseError){
	// todo: common errors
	toast({
	  color: 'danger',
	  duration: 5 * 1000,
	  mode: 'md',
	  onDidDismiss: () => {setIsLoading(false)},
	  position: 'bottom',
	  message: intl.formatMessage({
	    id: 'common.toast.error',
	    defaultMessage: 'Error: {code}',
	    // @ts-ignore
	  }, {code: error.code}),
	  swipeGesture: 'vertical'
	});
      }
      })
      .finally(() => {
	setIsLoading(false);
      });
  });
  
  return <>
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
	<IonCol size-xs='6' push-xs='3' push-sm='0'>
	  <img src={LoginSVG} className='square responsive' />
	</IonCol>
	<IonCol size-xs='12' size-sm='6'>
	  <IonText>
	    <p className='ion-padding-bottom'>
	      <FormattedMessage
		id='pages.login.greeting'
		defaultMessage='Login to your Share Meals account'
	      />
	    </p>
	  </IonText>
	  <LoginForm />
	  <IonList className='mt-3 ion-hide'>
	    <IonItem lines='none'>
	      <IonLabel>
		<FormattedMessage
		  id='pages.login.forgotPassword'
		  defaultMessage='forgot your password?'
		/>
	      </IonLabel>
	      <IonButton
		fill='outline'
		href='/reset-password'
		slot='end'
		size='default'>
		Reset
	      </IonButton>
	    </IonItem>
	  </IonList>
	</IonCol>
      </IonRow>
    </IonGrid>
  )
};
