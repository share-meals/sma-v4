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


import {useForm} from 'react-hook-form';
import {useProfile} from '@/hooks/Profile';
import {useState} from 'react';
import {userSchema} from '@sma-v4/schema';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';

/*
const ChangePasswordModal: React.FC = () => {
  const auth = getFirebaseAuth();
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
	label={intl.formatMessage({id: 'forms.label.new_password'})}
	name='new_password'
	type='password'
      />
     <Input
	control={control}
	disabled={isLoading}
       label={intl.formatMessage({id: 'forms.label.confirm_new_password'})}
	name='confirm_new_password'
	type='password'
      />
      <Input
	control={control}
	disabled={isLoading}
	label={intl.formatMessage({id: 'forms.label.old_password'})}
	name='old_password'
	type='password'
      />
     </form>
  </>;

};
*/

export const Account: React.FC = () => {
  const {signout} = useProfile();
  return <IonList>
    <IonItem className='ion-hide'>
      <FormattedMessage id='pages.account.changePassword' />
    </IonItem>
    <IonItem
      button
      onClick={signout}>
      <FormattedMessage
	id='pages.account.logout'
      />
    </IonItem>
  </IonList>;
};
