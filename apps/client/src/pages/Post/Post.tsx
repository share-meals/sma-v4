import {FirebaseError} from '@firebase/util';
import {
  FormattedMessage,
  useIntl
} from 'react-intl';
import {
  Input,
  StateButton
} from '@share-meals/frg-ui';
import {postSchema} from '@sma-v4/schema';
import {useForm} from 'react-hook-form';
import {
  useState
} from 'react';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';


export const Post: React.FC = () => {
  const intl = useIntl();
  const [error, setError] = useState<FirebaseError | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {
    control,
    handleSubmit
  } = useForm({
    mode: 'onBlur',
    resolver: zodResolver(postSchema),
    reValidateMode: 'onBlur'
  });

  const onSubmit = handleSubmit((data) => {
    console.log(data);
  });
  
  return <form
	   noValidate
	   onSubmit={onSubmit}>
    <Input
      control={control}
      disabled={isLoading}
      label={intl.formatMessage({
	id: 'forms.label.title',
      })}
      name='title'
      required={true}
      type='text'
    />
    
  </form>;
};
