import {
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';
import omit from 'lodash/fp/omit';
import {useLogger} from '@/hooks/Logger';

// todo: add onClick handler for alerts
export interface Alert {
  button?: {
    action: () => void,
    label: string,
  },
  message: string
}

interface Alerts {[key: string]: Alert};
type AddAlert = (s: string, a: Alert) => void;
type RemoveAlert = (s: string) => void;

interface AlertsState {
  addAlert: AddAlert,
  removeAlert: RemoveAlert,
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
    setAlerts({...alerts, [key]: alert});
  }, [alerts, setAlerts]);
  const removeAlert = useCallback<RemoveAlert>((key) => {
    setAlerts(omit([key], alerts));
  }, [alerts, setAlerts]);
  return <AlertsContext.Provider
	   children={children}
	   value={{
	     addAlert,
	     alerts,
	     removeAlert
	   }}
  />
};
