import {
  collection,
  doc,
  documentId,
  where,
  Firestore,
  query
} from 'firebase/firestore';
import {
  useFirestore,
  useFirestoreCollectionData,
  useFirestoreDocData,
} from 'reactfire';
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
  const {uid} = useProfile();
  const [surveyJSON, setSurveyJSON] = useState<any>();

  const firestore: Firestore = useFirestore();
  const ref = doc(firestore, 'users', uid);
  const {data}  = useFirestoreDocData(ref, {idField: 'id'});
  
  return <SmartPantryContext.Provider
	   value={{
	     points: data.private?.smartPantry?.points ?? null,
	     surveyJSON,
	     setSurveyJSON,
	     timestamp: data.private?.smartPantry?.timestamp ?? null
	   }}
	   children={children}
  />;
}
