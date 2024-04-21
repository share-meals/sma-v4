import PageNotFoundSVG from '@/assets/svg/page-not-found.svg';

export const PageNotFound: React.FC = () => {
  return <div className='ion-text-center'>
    <img src={PageNotFoundSVG} className='square responsive' />
  </div>;
}
