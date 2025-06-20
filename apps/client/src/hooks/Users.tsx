const REFRESH_THRESHOLD_IN_DAYS = 1;

import {
  createContext,
  useContext,
  useState,
} from 'react';
import {differenceInDays} from 'date-fns';
import {
  getFunctions,
  httpsCallable,
} from 'firebase/functions';

type User = any;

interface Users {
  [uid: string /* todo: get from schema*/]: User
}

interface UsersState {
  getUser: (uid: string) => Promise<User>
}



const UsersContext = createContext<UsersState>({} as UsersState);
export const useUsers = () => useContext(UsersContext);
export const UsersProvider: React.FC<React.PropsWithChildren> = ({children}) => {
  const [users, setUsers] = useState<Users>({});
  const functions = getFunctions();
  const getFunction = httpsCallable(functions, 'user-profile-read');
  const getUser = async (uid: string) => {
    if(users[uid]
       && differenceInDays(new Date(), users[uid].timestamp) < REFRESH_THRESHOLD_IN_DAYS){
      return users[uid];
    }else{
      // get the user
      const {data} = await getFunction({uid});
      setUsers({
	...users,
	[uid]: {
	  // todo: remove ignore
	  // @ts-ignore
	  ...data,
	  timestamp: new Date()
	}
      });
      return data;
    }
  };
  return <UsersContext.Provider
  children={children}
  value={{
    getUser
  }} />;
};
