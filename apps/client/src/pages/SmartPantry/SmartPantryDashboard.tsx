import {differenceInDays} from 'date-fns';
import {FormattedMessage} from 'react-intl';
import {
  IonButton,
  IonCol,
  IonGrid,
  IonIcon,
  IonItem,
  IonImg,
  IonLabel,
  IonList,
  IonRow,
  IonText,
} from '@ionic/react';
import {LoadingIndicator} from '@/components/LoadingIndicator';
import {
  useEffect,
  useState
} from 'react';
import {useParams} from 'react-router-dom';
import {useSmartPantry} from '@/contexts/SmartPantry';

import SmartPantrySVG from '@/assets/svg/sp_logo.svg';

export const SmartPantryDashboard: React.FC = () => {
  const {
    points,
    timestamp
  } = useSmartPantry();
  
  const {spid} = useParams<{ spid: string }>();
  const [now, setNow] = useState<Date>(new Date());
  const [daysLeftInSurvey, setDaysLeftInSurvey] = useState<number | null | undefined>();

  useEffect(() => {
    if(timestamp !== null && timestamp !== undefined){
      setDaysLeftInSurvey(differenceInDays(now, timestamp.toDate()));
    }else{
      setDaysLeftInSurvey(null);
    }
  }, [now, timestamp]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(new Date());
    }, 60 * 60 * 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  if(daysLeftInSurvey === undefined){
    return <LoadingIndicator />;
  }
  const canTakeSurvey: boolean = daysLeftInSurvey! > 7 || daysLeftInSurvey === null;

  return <IonGrid>
    <IonRow className='ion-align-items-center'>
      <IonCol>
	<IonImg src={SmartPantrySVG} style={{width: '75%', margin: 'auto'}} />
      </IonCol>
      <IonCol className='ion-text-center'>
	<IonText>
	  <p>
	    <FormattedMessage
	      id='pages.smartPantryDashboard.youHave'
	      defaultMessage='you have'
	    />
	  </p>
	  <p className='mv-1' style={{fontSize: 50}}>
	    {points ? points / 100 : 0}
	  </p>
	  <p>
	    <FormattedMessage
	      id='common.points'
	      defaultMessage='points'
	    />
	  </p>
	</IonText>
      </IonCol>
    </IonRow>
    <IonRow>
      <IonCol>
	<IonList>
	  <IonItem
	    detail={true}
	    disabled={!canTakeSurvey}
	    href={`/smart-pantry/${spid}/survey`}>
	    <IonLabel>
	    {canTakeSurvey
	    ? <FormattedMessage
		id='pages.smartPantry.takeSurveyForPoints'
		defaultMessage='Take a Survey for More Points'
	    />
	    : <FormattedMessage
		id='pages.smartPantryDashboard.noSurvey'
		defaultMessage='You need to wait {daysLeftInSurvey} days until you can take a survey again'
		values={{daysLeftInSurvey: 7 - daysLeftInSurvey!}}
	    />
	    }
	    </IonLabel>
	  </IonItem>
	  <IonItem
	    detail={true}
	    disabled={false && points! <= 0}
	    href={`/smart-pantry/${spid}/vend`}>
	    <IonLabel>
	      <FormattedMessage
		id='pages.smartPantryDashboard.sendPoints'
		defaultMessage='Send points to {spid}'
		values={{spid}}
	      />
	    </IonLabel>
	  </IonItem>
	</IonList>
      </IonCol>
    </IonRow>
  </IonGrid>;
}
