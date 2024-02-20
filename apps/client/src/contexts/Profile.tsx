import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  doc,
  Firestore,
} from 'firebase/firestore';
import {
  useUser,
} from 'reactfire';

type emailVerified = boolean;
type name = string;
type uid = string;

export interface ProfileState {
  emailVerified: emailVerified,
  name: name,
  setEmailVerified: Dispatch<SetStateAction<emailVerified>>,
  setName: Dispatch<SetStateAction<name>>,
  setUid: Dispatch<SetStateAction<uid>>,
  uid: uid
}

const ProfileContext = createContext<ProfileState>({} as ProfileState);

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider: React.FC<React.PropsWithChildren> = ({children}) => {
  const {data} = useUser();
  const [emailVerified, setEmailVerified] = useState<emailVerified>(data!.emailVerified);
  const [name, setName] = useState<name>(data!.displayName || '');
  const [uid, setUid] = useState<uid>(data!.uid);


  return <ProfileContext.Provider
	   value={{
	     emailVerified,
	     name,
	     setEmailVerified,
	     setName,
	     setUid,
	     uid
	   }}>
    {children}
  </ProfileContext.Provider>
}
