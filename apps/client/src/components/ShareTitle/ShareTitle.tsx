import {FormattedMessage} from 'react-intl';
import {IonSkeletonText} from '@ionic/react';
import {
  useEffect,
  useState
} from 'react';
import {useUsers} from '@/hooks/Users';

import './ShareTitle.css';

type StyleObject = {
  [key: string]: string | number | StyleObject;
};

type StyleLookup = {
  [key: string]: StyleObject
}

const styleLookup: StyleLookup  = {
  h1: {width: '33%', height: '32px'},
  p: {width: '33%', height: '11.2px'}
}

export const ShareTitle: React.FC<{
  element?: string,
  swipes: number,
  userId: string
}> = ({
  element = 'p',
  swipes,
  userId,
}) => {
  const {getUser} = useUsers();
  const [name, setName] = useState<string | null>(null);
  useEffect(() => {
    getUser(userId)
      .then(({displayName}) => {
	setName(displayName);
      });
  }, []);
  if(name === null){
    return <IonSkeletonText style={styleLookup[element]} />;
  }else{
    return <FormattedMessage id='common.share.dynamicTitle' values={{name, swipes}} />;
  }
};
