import classnames from 'classnames';
import {
  formatDistanceToNow,
  isPast,
} from 'date-fns';
import {FormattedMessage} from 'react-intl';
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
import {postSchema} from '@sma-v4/schema';
import {useI18n} from '@/hooks/I18n';
import {z} from 'zod';

type post = z.infer<typeof postSchema>;

export const PostInfoBanner: React.FC<post & {onNavigate: () => void}> = (props) => {
  const {onNavigate, ...postInfo} = props;
  const {dateFnsLocale} = useI18n();
  return <Link to={{pathname: `/view-post/${postInfo.id}`, state: {a: 'asf'}}} style={{textDecoration: 'none'}} onClick={onNavigate}>
    <IonItem detail={true}>
      <IonLabel>
	<h2>
	  <span className={classnames({feature: postInfo.feature})}>
	    {postInfo.title}
	  </span>
	</h2>
	{!postInfo.evergreen &&
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
	<div className='truncate-lines-3 mt-1'>
	  <Markdown>
	    {postInfo.details}
	  </Markdown>
	</div>
      </IonLabel>
      <IonThumbnail slot='start'>
	<img src='https://sharemeals.org/assets/img/og_image.png' />
      </IonThumbnail>
    </IonItem>
  </Link>;
};
