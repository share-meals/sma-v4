import {
  getFunctions,
  httpsCallable,
} from 'firebase/functions';

import {
  useIonViewDidEnter
} from '@ionic/react';
import{
  useParams
} from 'react-router-dom';

export const SmartPantrySurvey: React.FC = () => {
  const {spid} = useParams<{spid: string}>();
  const functions = getFunctions();
  const handshakeFunction = httpsCallable(functions, 'smartpantry-handshake');
  useIonViewDidEnter(() => {

  });
  return <>

  </>;

};
