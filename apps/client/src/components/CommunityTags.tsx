import {
  Community,
  membershipSchema
} from '@sma-v4/schema';
import {
  IonButton,
  IonIcon,
  IonItem,
  useIonAlert,
} from '@ionic/react';
import {person} from 'ionicons/icons';
import {useIntl} from 'react-intl';
import {useProfile} from '@/hooks/Profile';
import {z} from 'zod';

import StarIcon from '@material-symbols/svg-400/rounded/star-fill.svg';
import CloseIcon from '@material-symbols/svg-400/rounded/close.svg';

type OnClose = (communityId: string) => void;

interface Theme {
  color: string,
  type: 'dark' | 'light'
}

interface CommunityTagIconProps {
  membership: 'admin' | 'member';
  theme: Theme
}

const CommunityTagIcon: React.FC<CommunityTagIconProps> = ({
  membership,
  theme,
}) => {
  const intl = useIntl();
  switch(membership){
    case 'admin':
      return <IonIcon
	       aria-label={intl.formatMessage({id: `components.communityTags.icon.admin`})}
	       icon={StarIcon}
	       slot='start'
	       style={{
		 'color': theme.color
	       }}
      />;      
    case 'member':
    default:
      return <IonIcon
	       aria-label={intl.formatMessage({id: `components.communityTags.icon.member`})}
	       icon={person}
	       slot='start'
	       style={{
		 'color': theme.color
	       }}
      />;
  }
}

interface CommunityTagProps {
  community: Community;
  membership: z.infer<typeof membershipSchema>;
  onClose?: OnClose;
}

const CommunityTag: React.FC<CommunityTagProps> = ({
  community,
  membership,
  onClose,
}) => {
  const [presentAlert] = useIonAlert();
  const intl = useIntl();
  const theme: Theme = community.colors ? community.colors[0] : {
    color: '#000000',
    type: 'dark'
  };

  return <IonItem lines='none'>
    <CommunityTagIcon {...{membership, theme}} />
    {community.name}
    {onClose &&
     <IonButton
       aria-label={intl.formatMessage({id: 'components.communityTags.leaveCommunity'})}
       color='danger'
       fill='outline'
       onClick={() => {
        presentAlert({
	  header: intl.formatMessage({id: 'common.label.confirm'}),
	  message: intl.formatMessage({id: 'common.label.confirmLeaveCommunity'}, {communityName: community.name}),
	  buttons: [
	    {
	      htmlAttributes: {
		'data-testid': 'pages.viewPost.closePost.confirm.no.button'
	      },
	      role: 'cancel',
	      text: intl.formatMessage({id: 'common.label.no'}),
	    },
	    {
	      handler: () => {
		onClose(community.id);
	      },
	      htmlAttributes: {
		'data-testid': 'pages.viewPost.closePost.confirm.yes.button'
	      },
	      role: 'confirm',
	      text: intl.formatMessage({id: 'common.label.yes'}),
	    },
	  ]
        })
       }}
       slot='end'>
       <IonIcon
	 aria-hidden='true'
	 icon={CloseIcon}
	 slot='icon-only'
       />
     </IonButton>
    }
  </IonItem>  
}

interface CommunityTagsProps {
  communities: string[]; // TODO: pull communityId from schema
  onClose?: OnClose;
}

export const CommunityTags: React.FC<CommunityTagsProps> = ({
  communities: propCommunities,
  onClose
}) => {
  const {communities: communityData, profile} = useProfile();
  const communities = propCommunities.filter((c: string) => Object.keys(communityData).includes(c));
  return <>
    {communities!
      .sort((a, b) => {
	if(communityData[a].name < communityData[b].name){
	  return -1;
	}else{
	  return 1;
	}
      })
      .map((c) => <CommunityTag
		    community={communityData[c]}
		    key={c}
		    membership={profile.private.communities[`community-${c}`]}
		    onClose={onClose}
      />
    )}
  </>;
}
