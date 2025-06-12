import PageNotFoundSVG from '@/assets/svg/page-not-found.svg';
import {useIntl} from 'react-intl';

export const PageNotFound: React.FC = () => {
  const intl = useIntl();
  return <div className='ion-text-center'>
    <img
      alt={intl.formatMessage({id: 'img.alt.PageNotFound'})}
      src={PageNotFoundSVG}
      className='square responsive'
    />
  </div>;
}
