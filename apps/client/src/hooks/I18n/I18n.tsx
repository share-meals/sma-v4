import {
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';
import {Device} from '@capacitor/device';
import {
  Dispatch,
  SetStateAction,
  useEffect,
} from 'react';
import {
  IntlProvider
} from 'react-intl';
import {LoadingIndicator} from '@/components/LoadingIndicator';
import {Locale} from 'date-fns';
import {Preferences} from '@capacitor/preferences';
import fr from 'date-fns/locale/fr';
import ab from 'date-fns/locale/en-US';
import en from './locales/en.json';


// cannot specify exact languages due to storing in Preferences
type Language = string | undefined;

const messages = {
  en
};

const getDateFnsLocale = async (language: string) => {
  switch(language){
    case 'en':
      return (await import('date-fns/locale/en-US'))['enUS'];
      break;
    case 'es':
      return (await import('date-fns/locale/es'))['es'];
      break;
    case 'fr':
      return (await import('date-fns/locale/fr'))['fr'];
      break;
    default:
      return (await import('date-fns/locale/en-US'))['enUS'];
      break;
  }
}

export interface I18nState {
  dateFnsLocale: Locale | undefined,
  language: Language,
  setDateFnsLocale: Dispatch<SetStateAction<Locale | undefined>>,
  setLanguage: Dispatch<SetStateAction<Language>>,
  
}

const I18nContext = createContext<I18nState>({} as I18nState);

export const useI18n = () => useContext(I18nContext);

export const I18nProvider: React.FC<React.PropsWithChildren> = ({children}) => {
  const [language, setLanguage] = useState<Language>(undefined);
  const [dateFnsLocale, setDateFnsLocale] = useState<Locale | undefined>(undefined);
  useEffect(() => {
    // try to determine
    (async () => {
      const localLanguage = await Preferences.get({key: 'language'});
      if(localLanguage.value){
	//console.log(await getDateFnsLocale(localLanguage.value));
	setDateFnsLocale(await getDateFnsLocale(localLanguage.value));
	setLanguage(localLanguage.value);
      }else{
	const deviceLanguage = await Device.getLanguageCode();
	setDateFnsLocale(await getDateFnsLocale(deviceLanguage.value));
	setLanguage(deviceLanguage.value);
	Preferences.set({key: 'language', value: deviceLanguage.value});
      }
    })();
  }, [setLanguage]);
  return <I18nContext.Provider
	   value={{
	     dateFnsLocale,
	     language,
	     setDateFnsLocale,
	     setLanguage
	   }}>
    <IntlProvider
      locale={language || 'en'}
      messages={en}
      onError={() => {}}>
      {children}
    </IntlProvider>
  </I18nContext.Provider>;
}
