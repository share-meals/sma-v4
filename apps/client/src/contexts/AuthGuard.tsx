import {
  createContext,
  useContext,
  useState,
} from 'react';

export interface AuthGuardState {
  url: string | undefined,
  setUrl: any
}

const AuthGuardContext = createContext<AuthGuardState>({} as AuthGuardState);

export const useAuthGuard = () => useContext(AuthGuardContext);

export const AuthGuardProvider: React.FC<React.PropsWithChildren> = ({
  children
}) => {
  const [url, setUrl] = useState<string | undefined>();
  return <AuthGuardContext.Provider
	   value={{
	     url, setUrl
	   }}>
    {children}
  </AuthGuardContext.Provider>
}
