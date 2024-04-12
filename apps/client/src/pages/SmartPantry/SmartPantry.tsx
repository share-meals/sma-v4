import {FormattedMessage} from 'react-intl';
import {
  IonButton,
  IonText
} from '@ionic/react';
import {LoadingIndicator} from '@/components/LoadingIndicator';
import {Notice} from '@/components/Notice';
import {StateButton} from '@share-meals/frg-ui';
import {
  useHistory,
  useParams
} from 'react-router-dom';
import {useProfile} from '@/hooks/Profile';
import {useState} from 'react';

export const SmartPantry: React.FC = () => {
  const {spid} = useParams<{spid: string}>();
  const history = useHistory();
  const [sendingPoints, setSendingPoints] = useState<boolean>(false);
  const {profile} = useProfile();
  if(!profile){
    return;
  }
  const points = profile.private?.smartPantry?.points ?? 0;
  const sendPoints = () => {
    setSendingPoints(true);
  };

  const cancel = () => {
    setSendingPoints(false);
  }
  return <div className='ion-text-center'>
    <IonText>
      <p className='ion-no-margin'>
	<FormattedMessage id='pages.smartPantry.youHave' />
      </p>
      <h1 className='ion-no-margin' style={{fontSize: '8rem'}}>
	{points / 100}
      </h1>
      <p className='ion-no-margin'>
	<FormattedMessage id='common.label.points' />
      </p>
      <p>
	<FormattedMessage id='pages.smartPantry.connectedTo' values={{spid}}/>
      </p>
    </IonText>
    <div>
    <IonButton fill='outline' onClick={() => {history.push(`/smart-pantry/survey/${spid}`)}}>
      <FormattedMessage id='pages.smartPantry.getMorePoints' />
    </IonButton>
    </div>
    <div>
    <StateButton
      disabled={points <= 0}
      isLoading={sendingPoints}
      size='large'
      onClick={sendPoints}>
      <FormattedMessage id='pages.smartPantry.sendPoints' values={{spid}} />
    </StateButton>
    </div>
    {sendingPoints &&
     <Notice color='success'>
       <FormattedMessage id='pages.smartPantry.makeChoiceOnMachine' />
       <IonButton slot='end' fill='outline' onClick={cancel}>
	 <FormattedMessage id='buttons.label.cancel' />
       </IonButton>
     </Notice>
    }
  </div>;
};
