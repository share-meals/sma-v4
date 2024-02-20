import {FormattedMessage} from 'react-intl';
import {
  httpsCallable,
  HttpsCallableResult
} from 'firebase/functions';
import {
  IonAlert,
  IonButton,
  IonCol,
  IonGrid,
  IonImg,
  IonProgressBar,
  IonRow,
  IonText,
} from '@ionic/react';
import {LoadingIndicator} from '@/components/LoadingIndicator';
import {
  ref
} from 'firebase/database';
import {
  useDatabase,
  useDatabaseObjectData,
  useFunctions
} from 'reactfire';
import {useHistory} from 'react-router-dom';
import {
  useEffect,
  useRef,
  useState,
} from 'react';
import {useParams} from 'react-router-dom';

//import WarningIcon from '@material-design-icons/svg/sharp/Warning.svg';


const TIMEOUT_TOTAL_MIN = 5;
const TIMEOUT_WARNING_SECONDS = 60;
const TIMEOUT_COUNTER_RESOLUTION = 0.1;

export const SmartPantryVend: React.FC = () => {
  const history = useHistory();
  const {spid} = useParams<{spid: string}>();
  const database = useDatabase();
  const spcommsRef = ref(database, `/smsp/${spid}/outbox`);
  const {status, data} = useDatabaseObjectData<{message: string, sessionId: string}>(spcommsRef);
  const [intervalId, setIntervalId] = useState<number>();
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [shouldCancel, setShouldCancel] = useState<boolean>(true); // by default, send cancel request on leave
  const shouldCancelRef = useRef(shouldCancel);
  const functions = useFunctions();
  const vendFunction = httpsCallable<{spid: string}, {sessionId: string}>(functions, 'smartpantry-vend-request');
  const cancelFunction = httpsCallable(functions, 'smartpantry-vend-cancel');

  const cancelVend = () => {
    history.replace(`/smart-pantry/${spid}`);
  };

  useEffect(() => {
    if(data?.message.startsWith('sessionId')){
      setSessionId(data?.message.split(':')[1]);
    }
    if(['approved', 'denied'].includes(data?.message)
       && data?.sessionId === sessionId){
      if(!shouldCancel){
	// need to wait until shouldCancel
	history.replace(`/smart-pantry/${spid}`);
      }
      setShouldCancel(false);
      shouldCancelRef.current = false;
    }
  }, [data, shouldCancel]);

  const [secondsRemaining, setSecondsRemaining] = useState<number>(60 * TIMEOUT_TOTAL_MIN);
  useEffect(() => {
    (async () => {
      const {data} = await vendFunction({spid});
      setSessionId(data.sessionId);
    })();
    const id = window.setInterval(() => {
      if(secondsRemaining <= 0){
	clearInterval(intervalId);
	cancelVend();
      }
      setSecondsRemaining((s) => s - TIMEOUT_COUNTER_RESOLUTION);
    }, TIMEOUT_COUNTER_RESOLUTION * 1000);
    setIntervalId(id);
    return () => {
      if(shouldCancelRef.current === true){
	cancelFunction({machineId: spid});
      }
      clearInterval(id);
    };

  }, []);
  if(status === 'loading' || sessionId === undefined){
    return <LoadingIndicator />;
  }
  return <IonGrid>
    <IonRow>
      <IonCol>

      </IonCol>
      <IonCol>
	<IonText>
	  <p>
	    We sent your points to the machine. Please make a choice on the Smart Pantry to receive your item.
	  </p>
	</IonText>
	{secondsRemaining <= TIMEOUT_WARNING_SECONDS
	&& <>
	  <IonRow style={{alignItems: 'center'}}>
	    <IonCol>
	      <IonText>
		<p>
		  <FormattedMessage
		    id='pages.smartPantryVend.remainingSeconds'
		    defaultMessage='Your vending session will be canceled in {secondsRemaining} seconds. Make choice now!'
		    values={{secondsRemaining: Math.floor(secondsRemaining)}}
		  />
		</p>
	      </IonText>
	    </IonCol>
	  </IonRow>
	  <IonRow>
	    <IonCol>
	      <IonProgressBar
		color='warning'
	      style={{height: '1rem'}}
	      value={secondsRemaining / TIMEOUT_WARNING_SECONDS} />
	    </IonCol>
	  </IonRow>
	</>
	}

	<IonButton
	  fill='outline'
	  onClick={cancelVend}
	>
	  cancel
	</IonButton>

      </IonCol>
    </IonRow>
  </IonGrid>;
};

/*
	    <IonCol size='auto'>
	      <IonImg
	      aria-hidden='true'
	      src={WarningIcon}
		style={{width: '4rem'}}
	      />
	    </IonCol>

*/
