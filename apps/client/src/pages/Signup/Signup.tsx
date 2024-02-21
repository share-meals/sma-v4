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
import {httpsCallable} from 'firebase/functions';
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
import {sendEmailVerification} from 'firebase/auth';
import {signInWithEmailAndPassword} from '@firebase/auth';
import {
  useAuth,
  useFunctions
} from 'reactfire';
import {useForm} from 'react-hook-form';
import {userSchema} from '@/components/schema';
import {useState} from 'react';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';

import ArticleSharpIcon from '@material-design-icons/svg/sharp/article.svg';
import FeedSharpIcon from '@material-design-icons/svg/sharp/feed.svg';
import SignupSVG from '@/assets/svg/signup.svg';

const SignupForm: React.FC = () => {
  const auth = useAuth();
  const functions = useFunctions();
  const intl = useIntl();
  const [toast] = useIonToast();
  const signupFunction = httpsCallable(functions, 'user-create');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const schema = userSchema.pick({
    email: true,
    password: true,
    name: true
  }).partial().extend({
    //hasCommunityCode: z.boolean()
  });
  const {
    control,
    handleSubmit,
    watch
  } = useForm({
    mode: 'onBlur',
    resolver: zodResolver(schema),
    reValidateMode: 'onBlur'
  });

  const watchHasCommunityCode = watch('hasCommunityCode');
  
  const onSubmit = handleSubmit(
    async(data) => {
      setIsLoading(true);
      signupFunction(data)
	.then(async () => {
	  const response = await signInWithEmailAndPassword(auth, data.email, data.password);
	  // todo: verify that this works on server
	  sendEmailVerification(response.user);
	}).catch((error: unknown) => {
	  if(error instanceof FirebaseError){
	    toast({
	      color: 'danger',
	      duration: 2 * 1000,
	      mode: 'md',
	      onDidDismiss: () => {setIsLoading(false)},
	      position: 'bottom',
	      message: intl.formatMessage({
		id: 'common.toast.error',
		defaultMessage: 'Error: {code}',
	      }, {code: error.code}),
	      swipeGesture: 'vertical'
	    });
	  }
	}).finally(() => {
	  setIsLoading(false);
	});
    },
    (data) => {
      toast({
	color: 'danger',
	duration: 2 * 1000,
	message: intl.formatMessage({
	  id: 'common.form.error',
	  defaultMessage: 'There are errors in your form',
	}),
	mode: 'md',
	onDidDismiss: () => {setIsLoading(false)},
	position: 'bottom',
	swipeGesture: 'vertical'
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
      <Input
	control={control}
	disabled={isLoading}
	label={intl.formatMessage({
	  id: 'forms.label.name',
	  defaultMessage: 'Name',
	})}
	name='name'
	type='text'
      />
      <IonList lines='none' className='ion-hide'>
	<IonItem lines='none'>
	  <Toggle
	    control={control}
	    disabled={isLoading}
	    label='Have a Community Code?'
	    mode='ios'
	    name='hasCommunityCode'>
	  </Toggle>
	</IonItem>
	<IonItem button disabled={isLoading}>
	  <FormattedMessage
	    id='pages.signup.readPrivacyPolicy'
	    defaultMessage='Read Privacy Policy'
	  />
	  <IonIcon color='primary' slot='start' src={FeedSharpIcon} />
	</IonItem>
	<IonItem button disabled={isLoading}>
	  <FormattedMessage
	    id='pages.signup.readTOS'
	    defaultMessage='Read Terms of Service'
	  />
	  <IonIcon color='primary' slot='start' src={ArticleSharpIcon} />
	</IonItem>
      </IonList>
      <div className='ion-padding-top ion-text-center'>
	<StateButton
	  isLoading={isLoading}
	  type='submit'>
	  <FormattedMessage
	    id='buttons.label.signup'
	    defaultMessage='Signup'
	  />
	</StateButton>
      </div>
    </form>
  </>;
}
export const Signup: React.FC = () => {  
  return (
    <IonGrid>
      <IonRow>
	<IonCol size-xs='6' push-xs='3' push-sm='0'>
	  <img src={SignupSVG} className='square responsive' />
	</IonCol>
	<IonCol size-xs='12' size-sm='6'>
	  <IonText>
	    <p className='ion-padding-bottom'>
	      <FormattedMessage
		id='pages.signup.greeting'
		defaultMessage='Create your Share Meals account to start'
	      />
	    </p>
	  </IonText>
	  <SignupForm />
	</IonCol>
      </IonRow>
    </IonGrid>
  );
};
