import classnames from 'classnames'
import {FormattedMessage} from 'react-intl';
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonFooter,
  IonIcon,
  IonLabel,
  IonToolbar,
} from '@ionic/react';
import {useIntl} from 'react-intl';
import {useProfile} from '@/hooks/Profile';

import './Footer.css';

import AccountIcon from '@material-symbols/svg-400/rounded/manage_accounts-fill.svg';
import LoginIcon from '@material-symbols/svg-400/rounded/security_update_good-fill.svg';
import MapIcon from '@material-symbols/svg-400/rounded/map-fill.svg';
import SignupIcon from '@material-symbols/svg-400/rounded/person_add-fill.svg';
import PostIcon from '@material-symbols/svg-400/rounded/rss_feed.svg';

interface NavigationButtonProps {
  badge?: React.ReactElement<React.ComponentProps<typeof IonBadge>>;
  i18nKey: string;
  icon: string;
  link: string;
  testid: string;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({
  badge,
  i18nKey,
  icon,
  link,
  testid,
}) => {
  const intl = useIntl();
  return <IonButton
	   aria-label={intl.formatMessage({id: `${i18nKey}.ariaLabel`})}
	   className={classnames('icon-top', {'has-badge': badge})}
	   data-testid={testid}
	   routerLink={link}
	 >
    <IonIcon
      aria-hidden='true'
      icon={icon}
      slot='start'
    />
    <IonLabel>
      <FormattedMessage id={i18nKey} />
    </IonLabel>
    {badge}
  </IonButton>;
};

/*
   <NavigationButton
   data-testid=''
   i18nKey=''
   icon={}
   link=''
   />
*/

export const Footer: React.FC = () => {
  const {
    bundlePostsLength,
    features,
    isLoggedIn,
    postsLength,
  } = useProfile();

  return <IonFooter className='ion-no-border' id='footer'>
    <IonToolbar
      className='max-width-md margin-horizontal-auto'
      color='primary'>
      <IonButtons className='ion-justify-content-evenly' slot='start'>
	{!isLoggedIn && <>
	  <NavigationButton
	    i18nKey='pages.login.title'
	    icon={LoginIcon}
	    link='/login'
	    testid='components.footer.login.button'
	  />
	  <NavigationButton
	    i18nKey='pages.signup.title'
	    icon={SignupIcon}
	    link='/signup'
	    testid='components.footer.signup.button'
	  />
	</>
	}
  {isLoggedIn &&
   <NavigationButton
     badge={postsLength + bundlePostsLength > 0
					    ? <IonBadge color='light'>
					      {postsLength + bundlePostsLength}
					    </IonBadge>
					    : undefined}
     i18nKey='pages.map.title'
     icon={MapIcon}
     link='/map'
     testid='components.footer.map.button'
    />
  }  
  {features.canPost.length > 0 &&
   isLoggedIn &&
   <NavigationButton
     i18nKey='pages.post.title'
     icon={PostIcon}
     link='/post'
     testid='components.footer.post.button'
    />
  }
  {features.canShare.length > 0 &&
   isLoggedIn &&
   false &&
   <NavigationButton
     i18nKey='pages.share.title'
     icon={PostIcon}
     link='/share'
     testid='components.footer.share.button'
    />
  }
  {isLoggedIn &&
   <NavigationButton
     i18nKey='pages.account.title'
     icon={AccountIcon}
     link='/account'
     testid='components.footer.account.button'
   />}
      </IonButtons>
    </IonToolbar>
  </IonFooter>
}
