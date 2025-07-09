import {
  Camera,
  CameraResultType,
  CameraSource
} from '@capacitor/camera';
import {
  FormattedMessage,
  useIntl,
} from 'react-intl';
import {
  IonButton,
  IonCol,
  IonGrid,
  IonIcon,
  IonListHeader,
  IonRow,
} from '@ionic/react';
import {useMemo} from 'react';
import {useFormContext} from 'react-hook-form';

import {close} from 'ionicons/icons';
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
  // TODO: handle reject
  // @ts-ignore
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
  const intl = useIntl();
  const addPhoto = async () => {
    // get the photo
    const photo = await Camera.getPhoto({
      webUseInput: true,
      allowEditing: false,
      quality: 50,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
    });
    const photoBase64 = await resizeAndCrop({base64: photo.base64String!});
    setValue('photos', photos ? [...photos, photoBase64] : [photoBase64]);
  };
  return <IonButton
	   aria-label={intl.formatMessage({id: 'components.photoPicker.addPhoto.button.ariaLabel'})}
	   className='pr-1'
	   color='light'
	   data-testid='components.photoPicker.addPhoto.button'
	   disabled={photos && photos.length >= 4}
	   fill='outline'
	   onClick={addPhoto}>
    <IonIcon
      aria-hidden='true'
      src={AddPhotoIcon}
      slot='icon-only'
    />
  </IonButton>;
};

export const PhotoPicker: React.FC<PhotoPickerProps> = () => {
  const {watch, setValue} = useFormContext();
  const intl = useIntl();
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
	  {photos && photos.map((photo: string, index: number) => (
	    <IonCol className='photopicker-tile' key={photo.slice(-10) + index}>
	      <IonButton
		aria-label={intl.formatMessage({id: 'components.photoPicker.removePhoto.button.ariaLabel'})}
		data-testid='components.photoPicker.removePhoto.button'
		color='danger'
		onClick={() => {
		  setValue('photos', photos.filter((_: string, i: number) => i !== index));
		}}>
		<IonIcon aria-hidden='true' slot='icon-only' icon={close} />
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
