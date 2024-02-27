import {
  createIntl,
  createIntlCache,
  IntlProvider,
  IntlShape,
} from 'react-intl';

import en from './locales/en.json';

const messages: object = {
  en: en
}

export const I18nWrapper: React.FC<React.PropsWithChildren> = ({
  children
}) => {
  return <IntlProvider
  children={children}
  locale='en'
  messages={en}
  onError={() => {}}
  />;
};
