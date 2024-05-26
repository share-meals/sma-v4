import {
  IonSelect,
  IonSelectOption,
} from '@ionic/react';
import {useIntl} from 'react-intl';
import {useI18n} from '@/hooks/I18n';

const options = [
  {
    value: 'id',
    label: 'Bahasa Indonesia'
  },
  {
    value: 'en',
    label: 'English'
  },
  {
    value: 'es',
    label: 'Español'
  },
];

export interface LanguageSwitcherProps extends Pick<React.ComponentProps<typeof IonSelect>, 'fill' | 'labelPlacement'> {}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = (props) => {
  const intl = useIntl();
  const {language, setLanguage} = useI18n();
  return <IonSelect
	   cancelText={intl.formatMessage({id: 'buttons.label.cancel'})}
	   label={intl.formatMessage({id: 'common.language'})}
	   okText={intl.formatMessage({id: 'buttons.label.ok'})}
	   onIonChange={(event) => {
	     setLanguage(event.target.value);
	   }}
	   value={language}
	   {...props}
	 >
    {options.map((option) => <IonSelectOption value={option.value} key={option.value}>{option.label}</IonSelectOption>)}
  </IonSelect>;
}
