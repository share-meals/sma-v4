import {
  Camera,
  CameraResultType,
  CameraSource
} from '@capacitor/camera';
import {FormattedMessage} from 'react-intl';
import {
  IonButton,
  IonCol,
  IonGrid,
  IonIcon,
  IonListHeader,
  IonRow,
} from '@ionic/react';
import {
  useMemo,
  useState
} from 'react';
import {useFormContext} from 'react-hook-form';
import {usePostForm} from '@/hooks/PostForm';

import {close} from 'ionicons/icons';
import CloseIcon from '@material-symbols/svg-400/rounded/close.svg';
import AddPhotoIcon from '@material-symbols/svg-400/rounded/add_a_photo-fill.svg';

import './PhotoPicker.css';

export interface PhotoPickerProps {
  isLoading: boolean;
}

type ResizeAndCrop = (args: {
  base64: string
}) => Promise<any>;

const IMAGE_RESIZE_TARGET = 300;

const resizeAndCrop: ResizeAndCrop = async ({base64}) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = `data:image/jpeg;base64, ${base64}`;
    image.onload = async () => {
      const canvas = document.createElement('canvas') as HTMLCanvasElement;
      canvas.width = IMAGE_RESIZE_TARGET;
      canvas.height = IMAGE_RESIZE_TARGET;
      const ctx = canvas.getContext('2d');
      const xOffset = (image.width - image.height) / 2 > 0 ? (image.width - image.height) / 2 : 0;
      const yOffset = (image.height - image.width) / 2 > 0 ? (image.height - image.width) / 2 : 0;
      const smallestSide = Math.min(image.width, image.height);
      // Draw the cropped and resized image on the canvas
      ctx!.drawImage(image, xOffset, yOffset, smallestSide, smallestSide, 0, 0, IMAGE_RESIZE_TARGET, IMAGE_RESIZE_TARGET);
      
      resolve(canvas.toDataURL());
    }
  });
};

const AddPhotoButton: React.FC = () => {
  const {watch, setValue} = useFormContext();
  const photos = watch('photos');
  const addPhoto = async () => {
    // get the photo
    const photo = await Camera.getPhoto({
      allowEditing: true,
      quality: 100,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
    });
    const photoBase64 = await resizeAndCrop({base64: photo.base64String!});
    setValue('photos', photos ? [...photos, photoBase64] : [photoBase64]);
  };
  return <IonButton
	   className='pr-1'
	   color='light'
	   disabled={photos && photos.length >= 4}
	   fill='outline'
	   onClick={addPhoto}>
    <IonIcon
      src={AddPhotoIcon}
      slot='icon-only'
    />
  </IonButton>;
};

export const PhotoPicker: React.FC<PhotoPickerProps> = ({
  isLoading
}) => {
  const {watch, setValue} = useFormContext();
  const photos = watch('photos');
  const blanks = useMemo<any[]>(() => {
    let payload = [];
    for(let index = photos ? photos.length : 0; index < 4; index++){
      payload.push(<IonCol className='photopicker-tile' key={`photopicker-blank-${index}`}/>);
    }
    return payload;
  }, [photos]);
  return <>
    <IonListHeader color='dark'>
      <div className='ion-align-items-center ion-justify-content-between' style={{display: 'flex', width: '100%'}}>
	<FormattedMessage id='common.labels.photos' />
	<AddPhotoButton />
      </div>
    </IonListHeader>
    <div className='ion-no-padding'>
      <IonGrid className='ion-no-padding'>
	<IonRow>
	  {photos && photos.map((photo: any, index: number) => (
	    <IonCol className='photopicker-tile' key={photo.slice(-10) + index}>
	      <IonButton
		color='danger'
		onClick={() => {
		  setValue('photos', photos.filter((_: string, i: number) => i !== index));
		}}>
		<IonIcon slot='icon-only' icon={close} />
	      </IonButton>
	      <img src={photo} />
	    </IonCol>
	  ))}
	  {photos && blanks}
	</IonRow>
      </IonGrid>
    </div>
  </>;
};
