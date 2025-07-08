// TODO: export and import SMSP state type

import {database} from '@/components/Firebase';
import {
  ref,
  onValue
} from "firebase/database";
import {differenceInCalendarDays} from "date-fns";
import {
  FormattedMessage,
  useIntl
} from 'react-intl';
import {
  getFunctions,
  httpsCallable,
} from 'firebase/functions';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonModal,
  IonText,
  IonTitle,
  IonToolbar,
  useIonViewWillLeave,
} from '@ionic/react';
import {LoadingIndicator} from '@/components/LoadingIndicator';
import {Notice} from '@/components/Notice';
import {SmartPantryInfo} from '@sma-v4/schema';
import {
  SmartPantrySurvey,
  SmartPantrySurveyProps
} from './Survey';
import {StateButton} from '@share-meals/frg-ui';
import {StateButtonLoadingIndicator} from '@/components/StateButtonLoadingIndicator';
import {toast} from 'react-toastify';
import {
  useEffect,
  useRef,
  useState,
} from 'react';
import {useParams} from 'react-router-dom';
import {useProfile} from '@/hooks/Profile';

import CloseIcon from '@material-symbols/svg-400/rounded/close.svg';
import PageNotFoundSVG from '@/assets/svg/page-not-found.svg';

export const SmartPantryDashboard: React.FC = () => {
  const intl = useIntl();
  const {spid} = useParams<{spid: string}>();
  const {profile} = useProfile();
  const points = profile.private.smartPantry.points;
  const lastSurveyTaken = profile.private.smartPantry.timestamp.toDate();
  const [spInfo, setSpInfo] = useState<SmartPantryInfo | null | undefined>(undefined);
  const [spState, setSpState] = useState<string | null | undefined>(undefined);
  const [spOutbox, setSpOutbox] = useState<string | null | undefined>(undefined);
  const [sessionId, setSessionId] = useState<string | null | undefined>(undefined);
  const [sendingPoints, setSendingPoints] = useState<boolean>(false);
  const functions = getFunctions();
  // TODO: get input type from @sma-v4/schema
  const getSmartPantryInfo = httpsCallable<{spid: string}, SmartPantryInfo>(functions, 'smart-pantry-info');
  const requestVend = httpsCallable<{}, {sessionId: string}>(functions, 'smart-pantry-vend-request');
  const cancelVend = httpsCallable(functions, 'smart-pantry-vend-cancel');
  const modalRef = useRef<HTMLIonModalElement>(null);

  useEffect(() => {
    // TODO: listen for outbox
    // TODO: limit access rules for outbox to match user id
    const statusRef = ref(database, `/smsp/${spid.toLowerCase().replace(/[^a-zA-Z0-9]/g, '')}/status`);
    return onValue(statusRef, (snapshot) => {
      const val = snapshot.val();
      setSpState(val === null ? null : val);
    });
  }, [setSpState]);
  
  useEffect(() => {
    if(sessionId !== undefined
       && sessionId !== null){
      const outboxRef = ref(database, `/smsp/${spid.toLowerCase().replace(/[^a-zA-Z0-9]/g, '')}/outbox/${sessionId}`);
      return onValue(outboxRef, (snapshot) => {
	const val = snapshot.val();
	setSpOutbox(val === null ? null : val.message);
      });
    }else{
      return; // needed for typescript checks
    }
  }, [sessionId, setSpOutbox]);

  useEffect(() => {
    switch(spOutbox){
      case 'approved':
	toast.success(
	  intl.formatMessage({id: 'pages.smartPantryDashboard.vend.approved'})
	);
	setSendingPoints(false);
	setSessionId(null);
	break;
      case 'denied':
	toast.error(
	  intl.formatMessage({id: 'pages.smartPantryDashboard.vend.denied'})
	);
	cancel({silent: false});
	setSendingPoints(false);
	setSessionId(null);
    }
  }, [spOutbox]);
  
  const sendPoints = async () => {
    setSendingPoints(true);
    const {data: {sessionId}} = await requestVend({machineId: spid});
    setSessionId(sessionId);
  };
  
  const cancel = ({silent}: {silent: boolean}) => {
    // TODO: only cancel if current user at sp
    cancelVend({machineId: spid});
    setSendingPoints(false);
    if(!silent){
      toast.success(
	intl.formatMessage({id: 'pages.smartPantryDashboard.vend.canceled'})
      );
    }
  };

  useEffect(() => {
    (async () => {
      try{
	const response = await getSmartPantryInfo({spid});
	setSpInfo(response.data);
      }catch(error: any){
	console.log(error);
	setSpInfo(null);
	// TODO: error checking
      }
    })()
  }, []);

  useIonViewWillLeave(() => {
    cancel({silent: true});
  });

  switch(spInfo){
    case undefined:
      return <LoadingIndicator />;
      break;
    case null:
      return <InvalidCode />;
      break;
  }
  
  switch(spState){
    case undefined:
      return <div style={{height: 'calc(100vh - 113px)'}}>
	<LoadingIndicator />
      </div>;
    case null:
    case 'OFFLINE':
      return <Offline spName={spInfo!.name} />;
    case 'ENABLED':
      // waiting! so use it
      break;
  }
  
  const daysSinceLastSurvey = differenceInCalendarDays(
    new Date(),
    lastSurveyTaken
  );

  const daysRemainingUntilNextSurvey = Math.max(spInfo!.surveyInterval - daysSinceLastSurvey, 0);
  const canSurvey = daysSinceLastSurvey >= spInfo!.surveyInterval;
  return <>
    <div className='ion-text-center ion-padding'>
      <IonText>
	<p className='ion-no-margin'>
	  <FormattedMessage id='pages.smartPantryDashboard.youHave' />
	</p>
	<h1 className='ion-no-margin' style={{fontSize: '8rem'}}>
	  {points / 100}
	</h1>
	<p className='ion-no-margin'>
	  <FormattedMessage id='common.label.points' />
	</p>
      </IonText>
      <div className='mb-3'>
	<IonButton
	  disabled={!canSurvey}
	  fill='outline'
	  id='showSurvey'>
	  <FormattedMessage id='pages.smartPantryDashboard.getMorePoints' />
	</IonButton>
	{!canSurvey && <IonText>
	  <p>
	    <FormattedMessage id='pages.smartPantryDashboard.surveyWait' values={{days: daysRemainingUntilNextSurvey}} />
	  </p>
	</IonText>}
      </div>
      <StateButton
	isLoading={sendingPoints}
	onClick={sendPoints}
	disabled={points <= 0/* || spState !== 'ENABLED'*/}
	loadingIndicator={<StateButtonLoadingIndicator />}
	size='large'>
	<FormattedMessage id='pages.smartPantryDashboard.sendPoints' values={{spName: spInfo!.name}} />
      </StateButton>
      {
	/*
	spState !== 'ENABLED' &&
       <Notice color='warning'>
	 <span style={{display: 'flex'}} className='ion-align-items-center ion-justify-content-between'>
	   <FormattedMessage id='pages.smartPantryDashboard.machineBusy' />
	 </span>
       </Notice>
	*/
      }
      {sendingPoints &&
       <Notice color='success'>
	 <span style={{display: 'flex'}} className='ion-align-items-center ion-justify-content-between'>
	   <FormattedMessage id='pages.smartPantryDashboard.makeChoiceOnMachine' />
	   <IonButton slot='end' fill='outline' onClick={() => {cancel({silent: false});}}>
	     <FormattedMessage id='buttons.label.cancel' />
	   </IonButton>
	 </span>
       </Notice>
      }
    </div>
    <SurveyModal
      json={JSON.parse(spInfo!.surveyJson)}
      modalRef={modalRef}
    />
  </>;
}

const InvalidCode: React.FC = () => <div className='ion-text-center'>
  <img src={PageNotFoundSVG} className='square responsive' />
  <IonText>
    <h1>
      <FormattedMessage id='pages.smartPantryDashboard.spidNotFound.title' />
    </h1>
    <p>
      <FormattedMessage id='pages.smartPantryDashboard.spidNotFound.explanation' />
    </p>
  </IonText>
</div>;

const Offline: React.FC<{spName: string}> = ({spName}) => <div className='ion-text-center'>
  <img src={PageNotFoundSVG} className='square responsive' />
  <IonText>
    <h1>
      <FormattedMessage id='pages.smartPantryDashboard.offline.title' values={{spName}} />
    </h1>
    <p>
      <FormattedMessage id='pages.smartPantryDashboard.offline.explanation' />
    </p>
  </IonText>
</div>;

const SurveyModal: React.FC<SmartPantrySurveyProps> = ({
  json,
  modalRef,
}) => <IonModal ref={modalRef} trigger='showSurvey'>
  <IonHeader className='ion-no-border'>
    <IonToolbar color='primary'>
      <IonTitle>
	<FormattedMessage id='pages.smartPantryDashboard.survey.title' />
      </IonTitle>
      <IonButtons slot='end'>
        <IonButton onClick={() => modalRef.current?.dismiss()}>
	  <IonIcon icon={CloseIcon} slot='icon-only' />
	</IonButton>
      </IonButtons>
    </IonToolbar>
  </IonHeader>
  <IonContent className='ion-padding'>
    <SmartPantrySurvey
      json={json}
      modalRef={modalRef}
    />
  </IonContent>
</IonModal>;
