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
import {
  getFunctions,
  httpsCallable,
} from 'firebase/functions';
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
import {Notice} from '@/components/Notice';
import {
  sendEmailVerification,
  signInWithEmailAndPassword
} from 'firebase/auth';
import {useForm} from 'react-hook-form';
import {userSchema} from '@sma-v4/schema';
import {useState} from 'react';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';

import ArticleSharpIcon from '@material-design-icons/svg/sharp/article.svg';
import FeedSharpIcon from '@material-design-icons/svg/sharp/feed.svg';
import SignupSVG from '@/assets/svg/signup.svg';

const functions = getFunctions();
const signupFunction = httpsCallable(functions, 'user-create');


const SignupForm: React.FC = () => {
  //const auth = useAuth();
  const intl = useIntl();
  const [error, setError] = useState<FirebaseError | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const schema = userSchema.pick({
    email: true,
    password: true,
    name: true
  }).extend({
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

  //const watchHasCommunityCode = watch('hasCommunityCode');
  
  const onSubmit = handleSubmit(
    async(data) => {
      setIsLoading(true);
      signupFunction(data)
	.then(async () => {
	  /*
	  const response = await signInWithEmailAndPassword(auth, data.email, data.password);
	  // todo: verify that this works on server
	  sendEmailVerification(response.user);
	  */
	}).catch((error: unknown) => {
	  if(error instanceof FirebaseError){
	    setError(error);
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
	label={intl.formatMessage({
	  id: 'forms.label.email'
	})}
	name='email'
	required={true}
	type='email'
      />
      <Input
	control={control}
	disabled={isLoading}
	label={intl.formatMessage({
	id: 'forms.label.password'
      })}
	name='password'
	required={true}
	type='password'
      />
      <Input
	control={control}
	disabled={isLoading}
	label={intl.formatMessage({
	  id: 'forms.label.name'
	})}
	name='name'
	required={true}
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
	  />
	  <IonIcon color='primary' slot='start' src={FeedSharpIcon} />
	</IonItem>
	<IonItem button disabled={isLoading}>
	  <FormattedMessage
	    id='pages.signup.readTOS'
	  />
	  <IonIcon color='primary' slot='start' src={ArticleSharpIcon} />
	</IonItem>
      </IonList>
      <div className='ion-padding-top ion-text-center'>
	<StateButton
	  id='signup-submit-button'
	  isLoading={isLoading}
	  type='submit'>
	  <FormattedMessage
	    id='buttons.label.signup'
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
	      />
	    </p>
	  </IonText>
	  <SignupForm />
	</IonCol>
      </IonRow>
    </IonGrid>
  );
};
