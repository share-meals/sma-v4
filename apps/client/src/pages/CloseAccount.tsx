import {auth} from '@/components/Firebase';
import {
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import {
  FormattedMessage,
  useIntl
} from 'react-intl';
import {
  getFunctions,
  httpsCallable,
} from 'firebase/functions';
import {
  Input,
  StateButton
} from '@share-meals/frg-ui';
import {
  IonCol,
  IonGrid,
  IonRow,
  IonText,
} from '@ionic/react';
import {Notice} from '@/components/Notice';
import {useForm} from 'react-hook-form';
import {useProfile} from '@/hooks/Profile';
import {userSchema} from '@sma-v4/schema';
import {useState} from 'react';
import {zodResolver} from '@hookform/resolvers/zod';

export const CloseAccount: React.FC = () => {
  const intl = useIntl();
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {signout} = useProfile();
  const functions = getFunctions();
  const closeAccountFunction = httpsCallable(functions, 'user-close');
  const {
    control,
    handleSubmit,
  } = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(
      userSchema.pick({
	password: true
      })
    ),
    reValidateMode: 'onSubmit'
  });
  const onSubmit = handleSubmit(async (data) => {
    setIsLoading(true);
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      data.password
    );
    reauthenticateWithCredential(
      auth.currentUser,
      credential
    ).then(() => {
      setHasError(false);
      closeAccountFunction();
      signout();
    }).catch(() => {
      setHasError(true);
    }).finally(() => {
      setIsLoading(false);
    });
    //////
  });
  
  return <>
    <form
      noValidate
      onSubmit={onSubmit}>
      <IonGrid>
	<IonRow>
	  <IonCol>
	    <div className='mb-2'>
	      <IonText>
		<FormattedMessage id='pages.closeAccount.greeting' />
	      </IonText>
	    </div>
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
		<FormattedMessage id='buttons.label.submit' />
	      </StateButton>
	    </div>
	    {hasError && <Notice color='danger'>
	      <FormattedMessage id='pages.closeAccount.badPassword' />
	    </Notice>}
	  </IonCol>
	</IonRow>
      </IonGrid>
    </form>
  </>;
};
