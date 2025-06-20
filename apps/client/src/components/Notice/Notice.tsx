import classNames from 'classnames';
import {
  IonCard,
  IonCardContent,
  IonCol,
  IonGrid,
  IonIcon,
  IonRow,
  IonText,
} from '@ionic/react';

import CheckCircle from '@material-symbols/svg-400/rounded/check_circle.svg';
import Warning from '@material-symbols/svg-400/rounded/warning.svg';

import './Notice.css';

export interface NoticeProps {
  className?: string,
  color: string
};

const getIcon = (color: string) => {
  switch(color){
    case 'danger':
      return Warning;
    case 'success':
      return CheckCircle;
    default:
      return Warning;
  }
}

export const Notice: React.FC<React.PropsWithChildren<NoticeProps>> = ({
  children,
  className,
  color
}) => {
  return <IonCard
      className={classNames(['notice', 'ion-no-margin', className])}
      style={{
	border: `2px solid var(--ion-color-${color}`,
	boxShadow: 'none'
      }}>
      <IonCardContent className='ion-text-left ion-no-padding'>
	<IonGrid>
	  <IonRow className='ion-align-items-center'>
	  <IonCol size='auto'>
	    <IonIcon
	      aria-hidden='true'
	      color={color}
	      icon={getIcon(color)}
	      style={{fontSize: '2rem'}}
	    />
	  </IonCol>
	  <IonCol>
	    <IonText>
	      <p>
		{children}
	      </p>
	    </IonText>
	  </IonCol>
	</IonRow>
      </IonGrid>
    </IonCardContent>
  </IonCard>;
}
