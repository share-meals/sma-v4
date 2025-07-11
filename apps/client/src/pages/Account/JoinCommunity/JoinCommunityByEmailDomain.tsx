import {FormattedMessage} from 'react-intl';
import {
  getFunctions,
  httpsCallable,
} from 'firebase/functions';
import {StateButton} from '@share-meals/frg-ui';
import {StateButtonLoadingIndicator} from '@/components/StateButtonLoadingIndicator';
import {useState} from 'react';

import type {JoinCommunityFormProps} from './JoinCommunityForm';
import type {JoinCommunitySuccessMessage} from './JoinCommunity.d.ts';

export const JoinCommunityByEmailDomain: React.FC<JoinCommunityFormProps> = ({
  setHasError,
  setHasSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const functions = getFunctions();
  const addByEmailDomainFunction = httpsCallable(functions, 'user-community-addByEmailDomain');
  return <>
    <StateButton
      data-testid='pages.account.joinCommunityByEmailAddress.button'
      fill='clear'
      isLoading={isLoading}
      loadingIndicator={<StateButtonLoadingIndicator />}
      onClick={() => {
	setIsLoading(true);
	setHasSuccess(null);
	setHasError(null);
	addByEmailDomainFunction()
	  .then((response) => {
	    setHasSuccess(response.data as JoinCommunitySuccessMessage[]);
	  })
	  .catch((error) => {
	    setHasError(error.message);
	  }).finally(() => {
	    setIsLoading(false);
	  });

	//	setIsLoading(false);
      }}
    >
      <FormattedMessage id='pages.account.joinByEmailDomain' />
    </StateButton>
  </>;
}
