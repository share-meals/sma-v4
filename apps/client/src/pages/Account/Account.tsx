import {
  FormattedMessage,
  useIntl
} from 'react-intl';
import {
  Input
} from '@share-meals/frg-ui';
import {
  IonItem,
  IonList,
} from '@ionic/react';
import {useAuth} from 'reactfire';
import {useForm} from 'react-hook-form';
import {useState} from 'react';
import {userSchema} from '@sma-v4/schema';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';

const ChangePasswordModal: React.FC = () => {
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    control,
    handleSubmit
  } = useForm({
    defaultValues: {},
    mode: 'onBlur',
    resolver: zodResolver(
      userSchema.pick({
	password: true
      })
    )
  });

  const onSubmit = handleSubmit(async (data) => {
    console.log(data);
  });

    return <>
    <form
      onSubmit={onSubmit}>
      <Input
	control={control}
	disabled={isLoading}
	label={intl.formatMessage({
	  id: 'forms.label.new_password',
	  defaultMessage: 'New Password',
	  description: 'Form Label for New Password'
	})}
	name='new_password'
	type='password'
      />
     <Input
	control={control}
	disabled={isLoading}
	label={intl.formatMessage({
	  id: 'forms.label.confirm_new_password',
	  defaultMessage: 'Confirm New Password',
	  description: 'Form Label for Confirm New Password'
	})}
	name='confirm_new_password'
	type='password'
      />
      <Input
	control={control}
	disabled={isLoading}
	label={intl.formatMessage({
	  id: 'forms.label.old_password',
	  defaultMessage: 'Old Password',
	  description: 'Form Label for Old Password'
	})}
	name='old_password'
	type='password'
      />
     </form>
  </>;

};

export const Account: React.FC = () => {
  const auth = useAuth();
  return <IonList>
    <IonItem className='ion-hide'>
      <FormattedMessage
	id='pages.account.changePassword'
	defaultMessage='Change Password'
	description='Item label for Change Password'
      />
    </IonItem>
    <IonItem
      button
      onClick={() => {
	auth.signOut();
      }}>
      <FormattedMessage
	id='pages.account.logout'
	defaultMessage='Logout'
	description='Item label to logout'
      />
    </IonItem>
  </IonList>;
};
