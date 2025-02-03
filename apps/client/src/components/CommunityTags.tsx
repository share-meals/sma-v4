import {
  Community,
  membershipSchema
} from '@sma-v4/schema';
import {
  IonChip,
  IonIcon,
  IonLabel,
} from '@ionic/react';
import {person} from 'ionicons/icons';

import {useProfile} from '@/hooks/Profile';
import {z} from 'zod';

import StarIcon from '@material-symbols/svg-400/rounded/star-fill.svg';
import CloseIcon from '@material-symbols/svg-400/rounded/close.svg';

type OnClose = (communityId: string) => void;

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
  const theme = community.colors ? community.colors[0] : {
    color: '#000000',
    type: 'dark'
  };
  return <IonChip style={{
    '--background': theme.color,
    '--color': theme.type === 'dark' ? '#ffffff' : '#000000'
  }}>
    <IonIcon
      aria-hidden='true'
      icon={membership === 'admin' ? StarIcon : person}
      style={{
	'color': theme.type === 'dark' ? '#ffffff' : '#000000'
      }}
    />
    <IonLabel>
      {community.name}
    </IonLabel>
    {onClose && 
     <IonIcon
       aria-hidden='true'
       icon={CloseIcon}
       onClick={() => {onClose(community.id);}}
       style={{
	 'color': theme.type === 'dark' ? '#ffffff' : '#000000'
       }}
     />
    }
  </IonChip>;
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
