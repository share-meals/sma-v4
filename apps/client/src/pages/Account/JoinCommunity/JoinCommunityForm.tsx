import {communityCodeSchema} from '@sma-v4/schema';
import {
  Dispatch,
  SetStateAction,
  useState
} from 'react';
import {FormattedMessage} from 'react-intl';
import {
  getFunctions,
  httpsCallable,
} from 'firebase/functions';
import {
  Input,
  StateButton,
} from '@share-meals/frg-ui';
import {
  IonCol,
  IonGrid,
  IonRow,
  useIonViewDidLeave,
} from '@ionic/react';
import type {JoinCommunitySuccessMessage} from './JoinCommunity.d.ts';
import {StateButtonLoadingIndicator} from '@/components/StateButtonLoadingIndicator';
import {useForm} from 'react-hook-form';
import {useIntl} from 'react-intl';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';

export interface JoinCommunityFormProps {
  setErrorMessage: Dispatch<SetStateAction<string | null>>,
  setSuccessI18nKeys: Dispatch<SetStateAction<JoinCommunitySuccessMessage[]>>
}

export const JoinCommunityForm: React.FC<JoinCommunityFormProps> = ({
  setErrorMessage,
  setSuccessI18nKeys
}) => {
  const intl = useIntl();
  const functions = getFunctions();
  const addByCommunityCodeFunction = httpsCallable(functions, 'user-community-addByCommunityCode');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {
    control,
    handleSubmit,
    reset
  } = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(
      z.object({
	communityCode: communityCodeSchema
      })
    ),
    reValidateMode: 'onSubmit'
  });
  useIonViewDidLeave(() => {
    setSuccessI18nKeys([]);
    setErrorMessage(null);
    reset();
  });
  const onSubmit = handleSubmit((data: any) => {
    setIsLoading(true);
    setSuccessI18nKeys([]);
    setErrorMessage(null);
    addByCommunityCodeFunction(data)
      .then((response: any) => {
	setSuccessI18nKeys(response.data as JoinCommunitySuccessMessage[]);
	reset();
      })
      .catch((error: any) => {
	setErrorMessage(error.message);
      }).finally(() => {
	setIsLoading(false);
      });
  });
  return <>
    <form
      noValidate
      onSubmit={onSubmit}>
      <IonGrid>
	<IonRow className='ion-align-items-top'>
	  <IonCol>
	    <Input
	      control={control}
	      data-testid='pages.account.joinCommunityForm.communityCode.input'
	      disabled={isLoading}
	      fill='outline'
	      label={intl.formatMessage({id: 'common.label.communityCode'})}
	      labelPlacement='floating'
	      name='communityCode'
	      required={true}
	      type='text'
	    />
	  </IonCol>
	  <IonCol size='auto'>
	    <StateButton
	      isLoading={isLoading}
	      style={{marginTop: 10}}
	      loadingIndicator={<StateButtonLoadingIndicator />}
	      type='submit'>
	      <FormattedMessage id='pages.account.join' />
	    </StateButton>
	  </IonCol>
	</IonRow>
      </IonGrid>
    </form>
  </>;
}
