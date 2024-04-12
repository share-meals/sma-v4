import {
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';
import {useLogger} from '@/hooks/Logger';

// todo: add onClick handler for alerts
export interface Alert {
  message: string
}

interface Alerts {[key: string]: Alert};
type AddAlert = (s: string, a: Alert) => void;

interface AlertsState {
  addAlert: AddAlert,
  alerts: Alerts,
}

const AlertsContext = createContext<AlertsState>({} as AlertsState);

export const useAlerts = () => useContext(AlertsContext);

export const AlertsProvider: React.FC<React.PropsWithChildren> = ({children}) => {
  const [alerts, setAlerts] = useState<Alerts>({});
  const {log} = useLogger();
  const addAlert = useCallback<AddAlert>((key, alert) => {
    log({
      level: 'debug',
      component: 'alerts',
      message: `adding alert: ${JSON.stringify(alert)}`
    });
    setAlerts({...alerts, key: alert});
  }, []);
  return <AlertsContext.Provider
	   children={children}
	   value={{
	     addAlert,
	     alerts
	   }}
  />
}
