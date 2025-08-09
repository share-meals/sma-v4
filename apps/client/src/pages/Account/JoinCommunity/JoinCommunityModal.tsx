import {
  Dispatch,
  SetStateAction,
  useState,
} from 'react';
import {FormattedMessage} from 'react-intl';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonModal,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import {JoinCommunityByEmailDomain} from './JoinCommunityByEmailDomain';
import type {JoinCommunitySuccessMessage} from './JoinCommunity.d.ts';
import {JoinCommunityForm} from './JoinCommunityForm';
import {Notice} from '@/components/Notice';
import {useIntl} from 'react-intl';

import CloseIcon from '@material-symbols/svg-400/rounded/close.svg';

interface JoinCommunityModalProps {
  setShowJoinCommunity: Dispatch<SetStateAction<boolean>>,
  showJoinCommunity: boolean,
}

const errorMessageI18nKeyLookup: Record<string, string> = {
  'no matched communities': 'common.errors.noCommunitiesFound',
  'no new communities to join': 'common.errors.noNewCommunitiesToJoin'
};

export const JoinCommunityModal: React.FC<JoinCommunityModalProps> = ({
  setShowJoinCommunity,
  showJoinCommunity
}) => {
  const intl = useIntl();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successI18nKeys, setSuccessI18nKeys] = useState<JoinCommunitySuccessMessage[]>([]);
  return <IonModal
	   aria-label={intl.formatMessage({id: 'pages.account.joinCommunityModal.ariaLabel'})}
	   aria-modal='true'
	   role='dialog'
	   isOpen={showJoinCommunity}
	   onDidDismiss={() => {
	     setErrorMessage(null);
	     setSuccessI18nKeys([]);
	     setShowJoinCommunity(false);
	   }}>
    <IonHeader className='ion-no-border' role='none'>
      <IonToolbar color='primary'>
	<IonTitle>
	  <FormattedMessage id='pages.account.joinCommunity' />
	</IonTitle>
	<IonButtons slot='end'>
	  <IonButton
	    aria-label={intl.formatMessage({id: 'pages.account.joinCommunityModal.close.button.ariaLabel'})}
	    onClick={() => {setShowJoinCommunity(false);}}>
	    <IonIcon aria-hidden='true' src={CloseIcon}/>
	  </IonButton>
	</IonButtons>
      </IonToolbar>
    </IonHeader>
    <IonContent className='ion-padding' role='complementary'>
      <JoinCommunityForm
	setErrorMessage={setErrorMessage}
	setSuccessI18nKeys={setSuccessI18nKeys}
      />
      <div className='ion-text-right mt-2'>
	<JoinCommunityByEmailDomain
	  setErrorMessage={setErrorMessage}
	  setSuccessI18nKeys={setSuccessI18nKeys}
	/>
      </div>
      {successI18nKeys.length > 0
      && 
       successI18nKeys.map((m) => {
	 switch(m.level){
	   case 'admin':
	     return <Notice
		      color='success'
		      className='ion-margin'
		      i18nKey='pages.account.addedCommunity.asAdmin'
		      i18nValues={{communityName: m.communityName}} />;
	     break;
	   case 'member':
	     return <Notice
		      color='success'
		      className='ion-margin'
		      i18nKey='pages.account.addedCommunity.asMember'
		      i18nValues={{communityName: m.communityName}} />;
	     break;
	 }
      })
      }

      {errorMessage !== null
      && <Notice color='danger' className='ion-margin' i18nKey={errorMessageI18nKeyLookup[errorMessage]} />}
    </IonContent>
  </IonModal>
}
