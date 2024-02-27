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
  IonCol,
  IonGrid,
  IonIcon,
  //IonImg, // don't use since lazy loading causes flickering
  IonItem,
  IonLabel,
  IonList,
  IonRow,
  IonText,
} from '@ionic/react';
import {getFirebaseAuth} from '@/components/Firebase';
import {Notice} from '@/components/Notice';
import {useForm} from 'react-hook-form';
import {userSchema} from '@sma-v4/schema';
import {useState} from 'react';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';

import LoginSVG from '@/assets/svg/login.svg';
import ArrowOutwardIcon from '@material-design-icons/svg/sharp/arrow_outward.svg';

const LoginForm: React.FC = () => {
  const intl = useIntl();
  const [error, setError] = useState<FirebaseError | null>(null);
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
    signInWithEmailAndPassword(getFirebaseAuth(), data.email, data.password)
	.then(() => {
	})
	.catch((error) => {
	  console.log(error);
	  if(error instanceof FirebaseError){
	    setError(error);
	  }
	})
	.finally(() => {
	  setIsLoading(false);
	});
    /*
    signInWithEmailAndPassword(auth, data.email, data.password)
      .catch((error: unknown) => {
      })
      .finally(() => {
	setIsLoading(false);
      });
    */
  });
  
  return <form
	   noValidate
	   onSubmit={onSubmit}>
    <Input
      control={control}
      disabled={isLoading}
      label={intl.formatMessage({
	id: 'forms.label.email',
      })}
      name='email'
      required={true}
      type='email'
    />
    <Input
      control={control}
      disabled={isLoading}
      label={intl.formatMessage({
	id: 'forms.label.password',
      })}
      name='password'
      required={true}
      type='password'
    />
    <div className='ion-padding-top ion-text-center'>
      <StateButton
	isLoading={isLoading}
	type='submit'>
	<FormattedMessage
	  id='buttons.label.login'
	/>
      </StateButton>
    </div>
      {error && <Notice color='danger'>
	<IonText>
	  <p>
	    <FormattedMessage
	      id='common.notice.error'
	      values={{code: error.code}}
	    />
	  </p>
	</IonText>
      </Notice>}
  </form>;
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
	      />
	    </p>
	  </IonText>
	  <LoginForm />
	  <IonList className='mt-3 ion-hide'>
	    <IonItem lines='none'>
	      <IonLabel>
		<FormattedMessage id='pages.login.forgotPassword' />
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
