import {IonText} from '@ionic/react';
import {FormattedMessage} from 'react-intl';

export const PostNotFound: React.FC = () => <div className='ion-padding'>
    <IonText>
	<h1>
	    <FormattedMessage id='components.postNotFound.message' />
	</h1>
    </IonText>
</div>;
