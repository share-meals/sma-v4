import classnames from 'classnames';
import {DietaryTags} from '@/components/DietaryTags';
import {
  formatDistanceToNow,
  isPast,
} from 'date-fns';
import {FormattedMessage} from 'react-intl';
import {
  getDownloadURL,
  ref,
} from 'firebase/storage';
import {
  IonCol,
  IonGrid,
  IonItem,
  IonLabel,
  IonRow,
  IonSkeletonText,
  IonThumbnail,
} from '@ionic/react';
import {Link} from 'react-router-dom';
import logo from '@/assets/svg/logo.svg';
import Markdown from 'react-markdown';
import {normalizeForUrl} from '@/utilities/normalizeForUrl';
import {Photo} from '@/components/Photo';
import {postSchema, shareSchema} from '@sma-v4/schema';
import {storage} from '@/components/Firebase';
import {
  useEffect,
  useState
} from 'react';
import {useI18n} from '@/hooks/I18n';
import {useUsers} from '@/hooks/Users';
import {z} from 'zod';

type post = z.infer<typeof postSchema>;
type share = z.infer<typeof shareSchema>;

const getLink: (arg: any) => string = (postInfo) => {
  if(postInfo.source === 'bundle'){
    return `/view-bundle-post/${normalizeForUrl(postInfo.bundleName)}/${postInfo.id}`;
  }
  if(postInfo.type === 'event'){
    return `/view-post/${postInfo.id}`;
  }
  if(postInfo.type === 'share'){
    return `/view-share/${postInfo.id}`;
  }

  // should never get to here
  return '/map';
};

const ShareTitle: React.FC<share> = ({
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
    return <IonSkeletonText style={{width: '30%', height: '20px'}} />;
  }else{
    return <>
      <FormattedMessage id='pages.viewShare.title' values={{name, swipes}} />
    </>;
  }
};

export const PostInfoBanner: React.FC<any & {onNavigate: () => void}> = (props) => {
  const {onNavigate, ...postInfo} = props;

  const {dateFnsLocale} = useI18n();
  return <Link to={{pathname: getLink(postInfo)}} style={{textDecoration: 'none'}} onClick={onNavigate}>
    <IonItem detail={true}>
      <IonLabel>
	<h2>
	  <span className={classnames({feature: postInfo.feature})}>
	    {postInfo.type === 'event' && postInfo.title}
	    {postInfo.type === 'share' && <ShareTitle {...postInfo} />}
	  </span>
	</h2>
	{!postInfo.evergreen &&
	 (postInfo.starts && postInfo.ends) &&
	 <p>
	   {isPast(postInfo.starts)
	   ? <FormattedMessage id='common.label.started' />
	   : <FormattedMessage id='common.label.starts' />} {formatDistanceToNow(postInfo.starts, {addSuffix: true, locale: dateFnsLocale})}
	   <br />
	   {isPast(postInfo.ends)
	   ? <FormattedMessage id='common.label.ended' />
	   : <FormattedMessage id='common.label.ends' />} {formatDistanceToNow(postInfo.ends, {addSuffix: true, locale: dateFnsLocale})}
	 </p>
	}
	{postInfo.tags && <div>
	  <DietaryTags tags={postInfo.tags} />
	</div>}
	{postInfo.details && postInfo.details !== '' &&
	 <div className='truncate-lines-3 mt-1'>
	   <Markdown>
	     {postInfo.details}
	   </Markdown>
	 </div>
	}
      </IonLabel>
      <IonThumbnail slot='start'>
	{postInfo.photos
	&& postInfo.photos.length > 0
				  ? <Photo path={`postPhotos/${postInfo.id}-${postInfo.photos[0]}.png`} />
				  : <img src={logo} />}
      </IonThumbnail>
    </IonItem>
  </Link>;
};
