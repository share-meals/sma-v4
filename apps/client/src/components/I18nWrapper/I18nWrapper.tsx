import {
  createIntl,
  createIntlCache,
  IntlProvider,
  IntlShape,
} from 'react-intl';

import en from './dictionaries/en.json';

interface dictionary {
  [key: string]: string | dictionary;
}

const messages: object = {
  en: en
}

export const I18nWrapper: React.FC<React.PropsWithChildren> = ({
  children
}) => {
  const cache = createIntlCache();
  const intl: IntlShape = createIntl({
    locale: 'en',
    messages: {}
  }, cache);
  return <IntlProvider
  locale='en'
  messages={{}}
  >
  {children}
  </IntlProvider>
};
