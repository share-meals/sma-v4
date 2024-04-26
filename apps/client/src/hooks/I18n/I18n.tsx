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
import {IntlProvider} from 'react-intl';
import {LoadingIndicator} from '@/components/LoadingIndicator';
import {Locale} from 'date-fns';
import {Preferences} from '@capacitor/preferences';
import fr from 'date-fns/locale/fr';
import ab from 'date-fns/locale/en-US';

import en from './locales/en.json';
import id from './locales/id.json';

// cannot specify exact languages due to storing in Preferences
type Language = 'en' | 'es' | 'id';

const messages: {
  [key: string]: any
} = {
  en,
  id
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
    case 'id':
      return (await import('date-fns/locale/id'))['id'];
      break;
    default:
      return (await import('date-fns/locale/en-US'))['enUS'];
      break;
  }
}

export interface I18nState {
  dateFnsLocale: Locale | undefined,
  language: Language | undefined,
  setDateFnsLocale: Dispatch<SetStateAction<Locale | undefined>>,
  setLanguage: (lang: Language) => Promise<void>//Dispatch<SetStateAction<Language>>,
}

const I18nContext = createContext<I18nState>({} as I18nState);

export const useI18n = () => useContext(I18nContext);

export const I18nProvider: React.FC<React.PropsWithChildren> = ({children}) => {
  const [language, internalSetLanguage] = useState<Language | undefined>(undefined);
  const [dateFnsLocale, setDateFnsLocale] = useState<Locale | undefined>(undefined);
  const setLanguage = async (lang: Language) => {
    setDateFnsLocale(await getDateFnsLocale(lang));
    internalSetLanguage(lang);
    Preferences.set({key: 'language', value: lang});
  }
  useEffect(() => {
    // try to determine
    (async () => {
      const localLanguage = await Preferences.get({key: 'language'});
      if(localLanguage.value){
	setLanguage(localLanguage.value as Language);
      }else{
	const deviceLanguage = await Device.getLanguageCode();
	setLanguage(deviceLanguage.value as Language);
      }
    })();
  }, []);
  return <I18nContext.Provider
	   value={{
	     dateFnsLocale,
	     language,
	     setDateFnsLocale,
	     setLanguage
	   }}>
    <IntlProvider
      locale={language || 'en'}
      messages={messages[language || 'en']}
      onError={() => {}}>
      {children}
    </IntlProvider>
  </I18nContext.Provider>;
}
