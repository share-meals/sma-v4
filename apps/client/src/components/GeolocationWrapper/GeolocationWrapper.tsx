import {GeolocationProvider} from './GeolocationContext';

export const GeolocationWrapper: React.FC<React.PropsWithChildren> = ({
  children
}) => {
  return <GeolocationProvider>
    {children}
  </GeolocationProvider>;
}
