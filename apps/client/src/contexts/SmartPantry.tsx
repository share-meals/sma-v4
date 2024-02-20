import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from 'react';
import {useProfile} from '@/contexts/Profile';

export interface SmartPantryState {
  points: number | null | undefined,
  surveyJSON: any,
  setSurveyJSON: Dispatch<SetStateAction<any>>,
  timestamp: any | null | undefined,
}

const SmartPantryContext = createContext<SmartPantryState>({} as SmartPantryState);

export const useSmartPantry = () => useContext(SmartPantryContext);

export const SmartPantryProvider: React.FC<React.PropsWithChildren> = ({
  children
}) => {
  const {privateData} = useProfile();
  const [surveyJSON, setSurveyJSON] = useState<any>();
  const points = privateData?.smartPantry?.points;
  const timestamp = privateData?.smartPantry?.timestamp;
  
  return <SmartPantryContext.Provider
	   value={{
	     points: points ?? null,
	     surveyJSON,
	     setSurveyJSON,
	     timestamp: timestamp ?? null
	   }}
	   children={children}
  />;
}
