import {Form} from '@share-meals/frg-ui';
import {
  getFunctions,
  httpsCallable,
} from 'firebase/functions';
import {LoadingIndicator} from '@/components/LoadingIndicator';
import {toast} from 'react-toastify';
import {useIntl} from 'react-intl';
import {
  useIonViewDidEnter,
  useIonViewWillLeave,
} from '@ionic/react';
import {useState} from 'react';
import {useParams} from 'react-router-dom';


export interface SmartPantrySurveyProps {
  json: any;
  modalRef: any;
}

export const SmartPantrySurvey: React.FC<SmartPantrySurveyProps> = ({
  json,
  modalRef,
}) => {
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const functions = getFunctions();
  const submitResponses = httpsCallable(functions, 'smart-pantry-survey-submit');
  const {spid} = useParams<{spid: string}>();
  const onSubmit = async (data: any) => {
    setIsLoading(true);
    await submitResponses({
      surveyId: json.meta.id,
      responseJson: data,
      machineId: spid
    });
    modalRef.current?.dismiss();
    toast.success(intl.formatMessage({id: 'pages.smartPantryDashboard.surveySent'}));
    setIsLoading(false);
  };
  
  return <div className='ion-padding'>
    <Form
      isLoading={isLoading}
      json={json}
      onSubmit={onSubmit}
    />
  </div>;
};
