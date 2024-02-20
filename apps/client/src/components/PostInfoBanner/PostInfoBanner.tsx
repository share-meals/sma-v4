import {
  formatDistanceToNow
} from 'date-fns';
import {
  FormattedMessage
} from 'react-intl';
import {
  IonCol,
  IonGrid,
  IonItem,
  IonLabel,
  IonRow,
} from '@ionic/react';
import {postSchema} from '@sma-v4/schema';
import {z} from 'zod';

type post = z.infer<typeof postSchema>;

export const PostInfoBanner: React.FC<post> = ({
  details,
  ends,
  evergreen,
  starts,
  title,
}) => {
  return <IonItem href='#' detail={true}>
    <IonLabel>
      <h1>
	{title}
      </h1>
      {!evergreen &&
      <IonGrid className='ion-no-padding'>
	<IonRow>
	  <IonCol className='ion-no-padding'>
	    <p>
	      <FormattedMessage
		id='common.start'
		defaultMessage='Starts' /> {formatDistanceToNow(starts)}
	    </p>
	  </IonCol>
	  <IonCol className='ion-no-padding'>
	  </IonCol>
	  <IonCol className='ion-text-right ion-no-padding'>
	    <p>
	      <FormattedMessage
		id='common.ends'
		defaultMessage='Ends' /> {formatDistanceToNow(ends)}
	    </p>
	  </IonCol>
	</IonRow>
      </IonGrid>
      }
      <p className='truncate-lines-3'>
	{details}
      </p>
    </IonLabel>
  </IonItem>;
};
