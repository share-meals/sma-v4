import {
  createContext,
  useContext,
  useRef,
} from 'react';

export interface AuthGuardState {
  urlRef: React.MutableRefObject<string | null>,
}

const AuthGuardContext = createContext<AuthGuardState>({} as AuthGuardState);

export const useAuthGuard = () => useContext(AuthGuardContext);

export const AuthGuardProvider: React.FC<React.PropsWithChildren> = ({
  children
}) => {
  const urlRef = useRef<string | null>(null);
  return <AuthGuardContext.Provider
	   value={{
	     urlRef
	   }}>
    {children}
  </AuthGuardContext.Provider>
}
