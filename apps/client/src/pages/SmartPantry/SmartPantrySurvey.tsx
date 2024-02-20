import {httpsCallable} from 'firebase/functions';
import {
  IonButton,
  IonItem
} from '@ionic/react';
import {
  Radio,
  StateButton,
} from '@share-meals/frg-ui';
import {LoadingIndicator} from '@/components/LoadingIndicator';
import Markdown from 'react-markdown';
import {
  useSmartPantry
} from '@/contexts/SmartPantry';
import {
  useEffect,
  useState
} from 'react';
import {useForm} from 'react-hook-form';
import {useFunctions} from 'reactfire';
import {
  useHistory,
  useParams
} from 'react-router-dom';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';

export const SmartPantrySurvey: React.FC = () => {
  const {spid} = useParams<{spid: string}>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [response, setResponse] = useState<any>(null);
  const {surveyJSON, setSurveyJSON} = useSmartPantry();
  const functions = useFunctions();
  const handshakeFunction = httpsCallable(functions, 'smartpantry-handshake');

  useEffect(() => {
    (async () => {
      const handshakeResponse: any = await handshakeFunction();
      setResponse(handshakeResponse.data);
      if(handshakeResponse.data.step === 'step'){
	setSurveyJSON(handshakeResponse.data.surveyJSON);
      }
      setIsLoading(false);
    })();
  }, []);

  useEffect(() => {
    if(response?.step === 'survey'){
      setSurveyJSON(response.surveyJSON);
    }
  }, [JSON.stringify(response)]);
  
  if(isLoading){
    return <LoadingIndicator />;
  };

  if(response.step === 'survey'
     && (surveyJSON === undefined)){
    return <LoadingIndicator />;
  }
  
  switch(response.step){
    case 'points':
      return <></>;
      break;
    case 'survey':
      return <HydratedSmartPantrySurvey />;
      break;
    default:
      return <></>;
      break;
  }
  return <></>;
}

// todo: survey type
const HydratedSmartPantrySurvey: React.FC = () => {
  const {surveyJSON} = useSmartPantry();
  const {spid} = useParams<{spid: string}>();
  // pull schema
  let schema = {};
  surveyJSON.pages.forEach((page: any) => page.forEach((item: any) => {
    if(item.module === 'question'){
      // todo: better zod
      // @ts-ignore
      schema[item.name] = z.any();
    }
  }));

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const functions = useFunctions();
  const history = useHistory();
  const responsesCreateFunction = httpsCallable(functions, 'smartpantry-surveyresponse-create');

  const {
    control,
    handleSubmit
  } = useForm({
    mode: 'onBlur',
    resolver: zodResolver(
      z.object(schema)
    )
  });

  const onSubmit = handleSubmit(async (data) => {
    setIsLoading(true);
    responsesCreateFunction({
      machineId: spid,
      responses: JSON.stringify(data),
      surveyId: surveyJSON.meta.id
    })
      .then(() => {
	history.push(`/smart-pantry/${spid}`);
      })
      .finally(() => {
	setIsLoading(false);
      });
  });
  
  return <form onSubmit={onSubmit}>
    {surveyJSON.pages.map((page: any) =>
      page.map((item: any, itemIndex: number) => {
      switch(item.module){
	case 'text':
	  return <Markdown key={itemIndex} >{item.text}</Markdown>;
	  break;
	case 'question':
	  return <SmartPantryQuestion key={itemIndex} {...item} control={control} isLoading={isLoading} />;
	  break;
	default:
	  return <></>;
	  break;
      }
    })
  )}
  <StateButton type='submit' isLoading={isLoading}>
    submit
  </StateButton>
  </form>;
}

const SmartPantryQuestion: React.FC<any> = ({
  control,
  isLoading,
  maxSelections,
  name,
  options,
  text,
  type
}) => {
  let question;
  switch(type){
    case 'multipleChoice':
      if(maxSelections === 1){
	question = <Radio
	control={control}
	mode='md'
	name={name}
	options={options.map((option: any) => ({
	  name: option,
	  value: option
	}))}
	wrapper={IonItem}
	wrapperOptions={{lines: 'none'}}
	/>;
      }
      break;
  }
  return <div>
    <Markdown>{text}</Markdown>
    {question}
  </div>;
}
