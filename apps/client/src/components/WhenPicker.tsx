import {
  Datetime,
} from '@share-meals/frg-ui';
import {FormattedMessage} from 'react-intl';
import {
  IonDatetimeButton,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonNote,
} from '@ionic/react';
import {useFormContext} from 'react-hook-form';

interface WhenPickerProps {
  isLoading: boolean;
  name: string;
}

export const WhenPicker: React.FC<WhenPickerProps> = ({
  isLoading,
  name
}) => {
  const {
    control,
    formState
  } = useFormContext();
  return <IonList className='ion-no-padding'>
    <IonItem className='no-hover no-ripple' lines='none'>
      <IonLabel>
	<FormattedMessage id='common.label.starts' />
      </IonLabel>
      <IonDatetimeButton datetime={`${name}_starts`} disabled={isLoading} />
      <IonModal keepContentsMounted={true}>
	<Datetime
	  control={control}
	  id={`${name}_starts`}
	  minuteValues='0,15,30,45'
	  name='starts'
	/>
      </IonModal>
    </IonItem>
    <IonItem className='no-hover no-ripple' lines='none'>
      <IonLabel color={formState.isSubmitted && formState.errors.ends ? 'danger' : undefined}>
	<FormattedMessage id='common.label.ends' />
      </IonLabel>
      <IonDatetimeButton
	className={formState.isSubmitted && formState.errors.ends ? 'hasError' : undefined}
	datetime={`${name}_ends`}
	disabled={isLoading}
      />
      <IonModal keepContentsMounted={true}>
	<Datetime
	  control={control}
	  id={`${name}_ends`}
	  minuteValues='0,15,30,45'
	  name='ends'
	/>
      </IonModal>
    </IonItem>
    {formState.errors.ends
    && <div className='input-bottom sc-ion-input-md'>
      <IonNote color='danger'>
	{formState.errors.ends.message as string}
      </IonNote>
    </div>
    }
  </IonList>;
};
