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
  IonLabel,
  IonModal,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import {JoinCommunityByEmailDomain} from './JoinCommunityByEmailDomain';
import type {
  JoinCommunityErrorMessage,
  JoinCommunitySuccessMessage,
} from './JoinCommunity.d.ts';
import {JoinCommunityForm} from './JoinCommunityForm';
import {Notice} from '@/components/Notice';
import {useIntl} from 'react-intl';

import CloseIcon from '@material-symbols/svg-400/rounded/close.svg';

interface JoinCommunityModalProps {
  setShowJoinCommunity: Dispatch<SetStateAction<boolean>>,
  showJoinCommunity: boolean,
}

export const JoinCommunityModal: React.FC<JoinCommunityModalProps> = ({
  setShowJoinCommunity,
  showJoinCommunity
}) => {
  const intl = useIntl();
  const [hasError, setHasError] = useState<JoinCommunityErrorMessage | null>(null);
  const [hasSuccess, setHasSuccess] = useState<JoinCommunitySuccessMessage[] | null>(null);
  return <IonModal
  aria-label={intl.formatMessage({id: 'xxx'})}
	   aria-modal='true'
	   role='dialog'
	   isOpen={showJoinCommunity}
	   onDidDismiss={() => {
	     setHasError(null);
	     setHasSuccess(null);
	     setShowJoinCommunity(false);
	   }}>
    <IonHeader className='ion-no-border' role='none'>
      <IonToolbar color='primary'>
	<IonTitle>
	  <FormattedMessage id='pages.account.joinCommunity' />
	</IonTitle>
	<IonButtons slot='end'>
	  <IonButton
	    aria-label={intl.formatMessage({id: 'xxx'})}
	    onClick={() => {setShowJoinCommunity(false);}}>
	    <IonIcon aria-hidden='true' src={CloseIcon}/>
	  </IonButton>
	</IonButtons>
      </IonToolbar>
    </IonHeader>
    <IonContent className='ion-padding' role='complementary'>
      <JoinCommunityForm
	setHasError={setHasError}
	setHasSuccess={setHasSuccess}
      />
      <div className='ion-text-right mt-2'>
	<JoinCommunityByEmailDomain
	  setHasError={setHasError}
	  setHasSuccess={setHasSuccess}
	/>
      </div>
      {hasSuccess !== null
      && <Notice color='success' className='ion-margin'>
	{hasSuccess.map((m) => {
	  switch(m.level){
	    case 'admin':
	      return <FormattedMessage
		       id='pages.account.addedCommunity.asAdmin'
		       values={{communityName: m.communityName}} />;
	      break;
	    case 'member':
	    default:
	      return <FormattedMessage
		       id='pages.account.addedCommunity.asMember'
		       values={{communityName: m.communityName}} />;
	      break;
	  }
	}).map((m, index) => {
	  return <IonLabel key={index}>
	    {m}
	  </IonLabel>
	})}
      </Notice>}

      {hasError !== null
      && <Notice color='danger' className='ion-margin'>
	<IonLabel>
	  {hasError === 'no matched communities' && <FormattedMessage id='common.errors.noCommunitiesFound' />}
	  {hasError === 'no new communities to join' && <FormattedMessage id='common.errors.noNewCommunitiesToJoin' />}
	</IonLabel>
      </Notice>}
    </IonContent>
  </IonModal>
}
