import {Form} from '@share-meals/frg-ui';
import {
  getFunctions,
  httpsCallable,
} from 'firebase/functions';
import {toast} from 'react-toastify';
import {useIntl} from 'react-intl';
import {useState} from 'react';
import {useParams} from 'react-router-dom';


export interface PantryLinkSurveyProps {
  json: any;
  modalRef: any;
}

export const PantryLinkSurvey: React.FC<PantryLinkSurveyProps> = ({
  json,
  modalRef,
}) => {
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const functions = getFunctions();
  const submitResponses = httpsCallable(functions, 'pantry-link-survey-submit');
  const {plid} = useParams<{plid: string}>();
  const onSubmit = async (data: any) => {
    setIsLoading(true);
    await submitResponses({
      surveyId: json.meta.id,
      responseJson: data,
      machineId: plid
    });
    modalRef.current?.dismiss();
    toast.success(intl.formatMessage({id: 'pages.pantryLinkDashboard.surveySent'}));
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
