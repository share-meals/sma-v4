import {
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';
import {Preferences} from '@capacitor/preferences';
import {useEffect} from 'react';

interface Log {
  component: string,
  level: 'debug' | 'error',
  message: string,
  timestamp: Date,
}

type LogArgs = Omit<Log, 'timestamp'>;

export interface LoggerState {
  log: (l: LogArgs) => void,
  logs: Log[],
}

const LoggerContext = createContext<LoggerState>({} as LoggerState);

export const useLogger = () => useContext(LoggerContext);

const MAX_LOG_COUNT = 100;

export const LoggerProvider: React.FC<React.PropsWithChildren> = ({children}) => {
  const [logs, setLogs] = useState<Log[]>([]);
  useEffect(() => {
    Preferences.get({key: 'logs'})
	       .then(({value: l}) => {
		 if(l === null){
		   setLogs([]);
		 }else{
		   setLogs(JSON.parse(l));
		 }
	       });
  }, []);
  const log = useCallback((l: LogArgs) => {
    const newLogs = [
      ...logs.slice(-1 * Math.min(MAX_LOG_COUNT, logs.length)),
      {
	...l,
	timestamp: new Date()
      }
    ];
    setLogs(newLogs);
    Preferences.set({key: 'logs', value: JSON.stringify(newLogs)});
  }, [logs]);
  return <LoggerContext.Provider
	   children={children}
	   value={{
	     log,
	     logs,
	   }} />;
}
