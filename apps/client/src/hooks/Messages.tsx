import {
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';

interface LatestMessage {
  userId: string,
  title?: string,
  message: string,
  timestamp: Date,
  unreadCount: number
}

interface MessagesStore {
  event: Record<string, LatestMessage>,
  user: Record<string, LatestMessage>,
}

interface DashboardMessage {
  postId?: string,
  text: string,
  timestamp: string,
  title?: string,
  type: 'event' | 'share',
  userId: string,
}

type DashboardStore = Record<string, DashboardMessage>;

interface MessagesState {
  dashboard: DashboardStore,
  messages: MessagesStore,
  unreadCount: number
}

const MessagesContext = createContext<MessagesState>({} as MessagesState);

export const useMessages = () => useContext(MessagesContext);

export const MessagesProvider: React.FC<React.PropsWithChildren> = ({children}) => {
  const [messages, setMessages] = useState<MessagesStore>({event: {}, user: {}});
  const [dashboard, setDashboard] = useState<DashboardStore>({});
  const [unreadCount, setUnreadCount] = useState<number>(0);
  
  return <MessagesContext.Provider
  children={children}
  value={{
    dashboard,
    messages,
    unreadCount
  }} />;
};
