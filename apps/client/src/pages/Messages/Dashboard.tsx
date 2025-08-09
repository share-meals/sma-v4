import {Notice} from '@/components/Notice';
import {useMessages} from '@/hooks/Messages';

export const MessagesDashboard: React.FC = () => {
  const {dashboard} = useMessages();
  return <>
    {Object.keys(dashboard).length === 0 &&
     <Notice color='warning' className='p-3' i18nKey='pages.chatDashboard.noMessages' />
    }
  </>;
};
