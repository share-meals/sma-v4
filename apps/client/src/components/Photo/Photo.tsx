import {
  getDownloadURL,
  ref,
} from 'firebase/storage';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonModal,
} from '@ionic/react';
import {storage} from '@/components/Firebase';
import {
  useEffect,
  useState,
} from 'react';

import CloseIcon from '@material-symbols/svg-400/rounded/close.svg';

import './Photo.css';

interface PhotoProps {
  path: string,
}

export const Photo: React.FC<PhotoProps> = ({
  path,
}) => {
  const [url, setUrl] = useState<string | null>(null);
  const [showPhoto, setShowPhoto] = useState<boolean>(false);
  useEffect(() => {
    getDownloadURL(ref(storage, path)).then((response) => {
      setUrl(response);
    });
  }, [path]);
  return <div className='photo'>
    {url && <>
      <img
	src={url}
	onClick={() => {setShowPhoto(true);}}
      />
      <IonModal
	className='photo-modal'
	isOpen={showPhoto}
	onWillDismiss={() => {setShowPhoto(false);}}
      >
	<IonContent>
	  <IonButton onClick={() => {setShowPhoto(false);}}>
	    <IonIcon icon={CloseIcon} />
	  </IonButton>
	  <img src={url} />
	</IonContent>
      </IonModal>
    </>}
  </div>
  
}
