import {
  IonSpinner
} from '@ionic/react';
import {
  useEffect,
  useState,
} from 'react';

type Props = React.ComponentProps<typeof IonSpinner>;

const DELAY = 200;

export const LoadingIndicator: React.FC<Props> = (props) => {
  const [shouldRender, setShouldRender] = useState<boolean>(false);
  useEffect(() => {
    const timeoutId: number = window.setTimeout(() => {

    }, DELAY);
    return () => {
      clearTimeout(timeoutId);
    }
  }, []);
  if(shouldRender){
    return <div
      style={{
	alignItems: 'center',
	display: 'flex',
	height: '100%',
	justifyContent: 'center',
      }}>
      <IonSpinner
	aria-label='loading indicator'
	color='primary'
	data-testid='loading indicator'
	style={{
	  height: '50%',
	  width: '50%',
	  opacity: 0.5
	}}
      {...props}
      />
    </div>;
  }else{
    return <></>;
  }
};
