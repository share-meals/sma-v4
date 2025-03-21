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
  IonThumbnail,
} from '@ionic/react';
import {Link} from 'react-router-dom';
import Markdown from 'react-markdown';
import {normalizeForUrl} from '@/utilities/normalizeForUrl';
import {Photo} from '@/components/Photo';
import {postSchema} from '@sma-v4/schema';
import {storage} from '@/components/Firebase';
import {useI18n} from '@/hooks/I18n';
import {z} from 'zod';

type post = z.infer<typeof postSchema>;

const getLink: (arg: any) => string = (postInfo) => {
    switch(postInfo.source){
	case 'bundle':
	    return `/view-bundle-post/${normalizeForUrl(postInfo.bundleName)}/${postInfo.id}`;
	default:
	    return `/view-post/${postInfo.id}`;
    };
};

export const PostInfoBanner: React.FC<post & {onNavigate: () => void}> = (props) => {
  const {onNavigate, ...postInfo} = props;
    const {dateFnsLocale} = useI18n();
  return <Link to={{pathname: getLink(postInfo)}} style={{textDecoration: 'none'}} onClick={onNavigate}>
    <IonItem detail={true}>
      <IonLabel>
	<h2>
	  <span className={classnames({feature: postInfo.feature})}>
	    {postInfo.title}
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
	{postInfo.photos && postInfo.photos.length > 0
	? <Photo path={`postPhotos/${postInfo.id}-${postInfo.photos[0]}.png`} />
	: <img src='https://sharemeals.org/assets/img/og_image.png' />}
      </IonThumbnail>
    </IonItem>
  </Link>;
};
