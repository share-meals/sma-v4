import Markdown from 'react-markdown';
import {IonText} from '@ionic/react';

// todo: provide different languages and load dynamically
import PrivacyPolicyMD from '@/assets/md/privacyPolicy.md';

interface PrivacyPolicyProps {
  isModal?: boolean
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({
  isModal = false
}) => {
  if(isModal){
    return <IonText className='markdown-content'>
      <Markdown>
	{PrivacyPolicyMD}
      </Markdown>
    </IonText>;
  }else{
    return <div className='ion-padding' style={{
      display: 'block',
      overflow: 'visible'
    }}>
      <IonText>
	<Markdown>
	  {PrivacyPolicyMD}
	</Markdown>
      </IonText>
    </div>;
  }
}
