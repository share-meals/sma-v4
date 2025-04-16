import {FormattedMessage} from 'react-intl';
import {
  IonLabel,
} from '@ionic/react';
import {Notice} from '@/components/Notice';
import {useMessages} from '@/hooks/Messages';
import {useProfile} from '@/hooks/Profile';

export const MessagesDashboard: React.FC = () => {
  const {dashboard} = useMessages();
  return <>
    {Object.keys(dashboard).length === 0 &&
     <div className='p-3'>
       <Notice color='warning'>
	 <IonLabel>
	   <FormattedMessage id='pages.chatDashboard.noMessages' />
	 </IonLabel>
       </Notice>
     </div>
    }
  </>;
};
