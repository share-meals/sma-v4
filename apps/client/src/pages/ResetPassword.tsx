import {auth} from '@/components/Firebase';
import {
  FormattedMessage,
  useIntl
} from 'react-intl';
import {
  Input,
  StateButton
} from '@share-meals/frg-ui';
import {
  IonLabel,
  IonText
} from '@ionic/react';
import {Notice} from '@/components/Notice';
import {sendPasswordResetEmail} from 'firebase/auth';
import {useForm} from 'react-hook-form';
import {useState} from 'react';
import {userSchema} from '@sma-v4/schema';
import {zodResolver} from '@hookform/resolvers/zod';

export const ResetPassword: React.FC = () => {
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showNotice, setShowNotice] = useState<boolean>(false);
  const {
    control,
    handleSubmit
  } = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(
      userSchema.pick({email: true})
    ),
    reValidateMode: 'onSubmit'
  });
  const onSubmit = handleSubmit((data) => {
    setIsLoading(true);
    sendPasswordResetEmail(auth, data.email)
      .then(() => {

      })
      .catch((error) => {
	switch(error.code){
	  case 'auth/user-not-found':
	    // do nothing; this is fine
	    break;
	  default:
	    // TODO: what should we do with other errors?
	    break;
	}
      })
      .finally(() => {
	setIsLoading(false);
	setShowNotice(true);
      });
  });
  return <form
	   noValidate
	   onSubmit={onSubmit}>
    <Input
      control={control}
      disabled={isLoading}
      fill='outline'
      label={intl.formatMessage({id: 'common.label.email'})}
      labelPlacement='floating'
      name='email'
      required={true}
      type='email'
    />
    <div className='ion-padding-top ion-text-center'>
      <StateButton
	isLoading={isLoading}
	type='submit'>
	<FormattedMessage id='buttons.label.reset' />
      </StateButton>
    </div>
    {showNotice && <Notice color='success'>
      <IonLabel>
	<FormattedMessage
	  id='pages.resetPassword.successNotice'
	/>
      </IonLabel>
    </Notice>}
  </form>  
}
