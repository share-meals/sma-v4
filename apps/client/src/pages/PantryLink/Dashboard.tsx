// TODO: export and import SMPL state type

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
import Markdown from 'react-markdown';
import {Notice} from '@/components/Notice';
import {PantryLinkInfo} from '@sma-v4/schema';
import {
  PantryLinkSurvey,
  PantryLinkSurveyProps
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

export const PantryLinkDashboard: React.FC = () => {
  const intl = useIntl();
  const {plid} = useParams<{plid: string}>();
  const {profile} = useProfile();
  const points = profile.private.pantryLink.points;
  const lastSurveyTaken = profile.private.pantryLink.timestamp.toDate();
  const [plInfo, setPlInfo] = useState<PantryLinkInfo | null | undefined>(undefined);
  const [plState, setPlState] = useState<string | null | undefined>(undefined);
  const [plOutbox, setPlOutbox] = useState<string | null | undefined>(undefined);
  const [sessionId, setSessionId] = useState<string | null | undefined>(undefined);
  const [sendingPoints, setSendingPoints] = useState<boolean>(false);
  const functions = getFunctions();
  // TODO: get input type from @sma-v4/schema
  const getPantryLinkInfo = httpsCallable<{plid: string}, PantryLinkInfo>(functions, 'pantry-link-info');
  const requestVend = httpsCallable<{}, {sessionId: string}>(functions, 'pantry-link-vend-request');
  const cancelVend = httpsCallable(functions, 'pantry-link-vend-cancel');
  const modalRef = useRef<HTMLIonModalElement>(null);

  useEffect(() => {
    // TODO: listen for outbox
    // TODO: limit access rules for outbox to match user id
    const statusRef = ref(database, `/pantryLinks/${plid.toLowerCase().replace(/[^a-zA-Z0-9]/g, '')}/status`);
    return onValue(statusRef, (snapshot) => {
      const val = snapshot.val();
      setPlState(val === null ? null : val);
    });
  }, [setPlState]);
  
  useEffect(() => {
    if(sessionId !== undefined
       && sessionId !== null){
      const outboxRef = ref(database, `/pantryLinks/${plid.toLowerCase().replace(/[^a-zA-Z0-9]/g, '')}/outbox/${sessionId}`);
      return onValue(outboxRef, (snapshot) => {
	const val = snapshot.val();
	setPlOutbox(val === null ? null : val.message);
      });
    }else{
      return; // needed for typescript checks
    }
  }, [sessionId, setPlOutbox]);

  useEffect(() => {
    switch(plOutbox){
      case 'approved':
	toast.success(
	  intl.formatMessage({id: 'pages.pantryLinkDashboard.vend.approved'})
	);
	setSendingPoints(false);
	setSessionId(null);
	break;
      case 'denied':
	toast.error(
	  intl.formatMessage({id: 'pages.pantryLinkDashboard.vend.denied'})
	);
	cancel({silent: false});
	setSendingPoints(false);
	setSessionId(null);
    }
  }, [plOutbox]);
  
  const sendPoints = async () => {
    setSendingPoints(true);
    const {data: {sessionId}} = await requestVend({machineId: plid});
    setSessionId(sessionId);
  };
  
  const cancel = ({silent}: {silent: boolean}) => {
    // TODO: only cancel if current user at pl
    cancelVend({machineId: plid});
    setSendingPoints(false);
    if(!silent){
      toast.success(
	intl.formatMessage({id: 'pages.pantryLinkDashboard.vend.canceled'})
      );
    }
  };

  useEffect(() => {
    (async () => {
      try{
	const response = await getPantryLinkInfo({plid});
	setPlInfo(response.data);
      }catch(error: any){
	console.log(error);
	setPlInfo(null);
	// TODO: error checking
      }
    })()
  }, []);

  useIonViewWillLeave(() => {
    cancel({silent: true});
  });

  switch(plInfo){
    case undefined:
      return <LoadingIndicator />;
      break;
    case null:
      return <InvalidCode />;
      break;
  }
  
  switch(plState){
    case undefined:
      return <div style={{height: 'calc(100vh - 113px)'}}>
	<LoadingIndicator />
      </div>;
    case null:
    case 'OFFLINE':
      return <Offline plName={plInfo!.name} />;
    case 'ENABLED':
      // waiting! so use it
      break;
  }
  
  const daysSinceLastSurvey = differenceInCalendarDays(
    new Date(),
    lastSurveyTaken
  );

  const daysRemainingUntilNextSurvey = Math.max(plInfo!.surveyInterval - daysSinceLastSurvey, 0);
  const canSurvey = daysSinceLastSurvey >= plInfo!.surveyInterval;
  return <>
    <div className='ion-text-center ion-padding'>
      <IonText>
  <h2>
	  {plInfo!.name}
	</h2>
	<Markdown>
	  {intl.formatMessage({id: 'pages.pantryLinkDashboard.youHaveXPoints'},
			      {points})}
	</Markdown>
      </IonText>
      
      <div className='mb-3'>
	<IonButton
	  disabled={!canSurvey}
	  fill='outline'
	  id='showSurvey'>
	  <FormattedMessage id='pages.pantryLinkDashboard.getMorePoints' />
	</IonButton>
	{!canSurvey && <IonText>
	  <p>
	    <FormattedMessage id='pages.pantryLinkDashboard.surveyWait' values={{days: daysRemainingUntilNextSurvey}} />
	  </p>
	</IonText>}
      </div>
      <StateButton
	isLoading={sendingPoints}
	onClick={sendPoints}
	disabled={points <= 0/* || plState !== 'ENABLED'*/}
	loadingIndicator={<StateButtonLoadingIndicator />}
	size='large'>
	<FormattedMessage id='pages.pantryLinkDashboard.sendPoints' />
      </StateButton>
      {
	/*
	   spState !== 'ENABLED' &&
	   <Notice color='warning'>
	   <span style={{display: 'flex'}} className='ion-align-items-center ion-justify-content-between'>
	   <FormattedMessage id='pages.pantryLinkDashboard.machineBusy' />
	   </span>
	   </Notice>
	 */
      }
      {sendingPoints &&
       <Notice color='success'>
	 <span style={{display: 'flex'}} className='ion-align-items-center ion-justify-content-between'>
	   <FormattedMessage id='pages.pantryLinkDashboard.makeChoiceOnMachine' />
	   <IonButton slot='end' fill='outline' onClick={() => {cancel({silent: false});}}>
	     <FormattedMessage id='buttons.label.cancel' />
	   </IonButton>
	 </span>
       </Notice>
      }
    </div>
    <SurveyModal
      json={JSON.parse(plInfo!.surveyJson)}
      modalRef={modalRef}
    />
  </>;
}

const InvalidCode: React.FC = () => <div className='ion-text-center'>
  <img src={PageNotFoundSVG} className='square responsive' />
  <IonText>
    <h1>
      <FormattedMessage id='pages.pantryLinkDashboard.plidNotFound.title' />
    </h1>
    <p>
      <FormattedMessage id='pages.pantryLinkDashboard.plidNotFound.explanation' />
    </p>
  </IonText>
</div>;

const Offline: React.FC<{plName: string}> = ({plName}) => <div className='ion-text-center'>
  <img src={PageNotFoundSVG} className='square responsive' />
  <IonText>
    <h1>
      <FormattedMessage id='pages.pantryLinkDashboard.offline.title' values={{plName}} />
    </h1>
    <p>
      <FormattedMessage id='pages.pantryLinkDashboard.offline.explanation' />
    </p>
  </IonText>
</div>;

const SurveyModal: React.FC<PantryLinkSurveyProps> = ({
  json,
  modalRef,
}) => <IonModal ref={modalRef} trigger='showSurvey'>
  <IonHeader className='ion-no-border'>
    <IonToolbar color='primary'>
      <IonTitle>
	<FormattedMessage id='pages.pantryLinkDashboard.survey.title' />
      </IonTitle>
      <IonButtons slot='end'>
        <IonButton onClick={() => modalRef.current?.dismiss()}>
	  <IonIcon icon={CloseIcon} slot='icon-only' />
	</IonButton>
      </IonButtons>
    </IonToolbar>
  </IonHeader>
  <IonContent className='ion-padding'>
    <PantryLinkSurvey
      json={json}
      modalRef={modalRef}
    />
  </IonContent>
</IonModal>;
