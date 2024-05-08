import {
  communitySchema,
  myMembershipSchema
} from '@sma-v4/schema';
import {
  IonChip,
  IonIcon,
  IonLabel,
} from '@ionic/react';
import {person} from 'ionicons/icons';

import {useProfile} from '@/hooks/Profile';
import {z} from 'zod';

import StarSVG from '@material-design-icons/svg/filled/star.svg';
import CloseSVG from '@material-symbols/svg-400/rounded/close.svg';

const affiliatedCommunitySchema = communitySchema.extend({
  myMembership: myMembershipSchema
});

type Community = z.infer<typeof affiliatedCommunitySchema>;
type OnClose = (communityId: string) => void;

const CommunityTag: React.FC<{community: Community, onClose?: OnClose}> = ({community, onClose}) => {
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
      icon={community.myMembership === 'admin' ? StarSVG : person}
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
       icon={CloseSVG}
       onClick={() => {onClose(community.id);}}
       style={{
	 'color': theme.type === 'dark' ? '#ffffff' : '#000000'
       }}
     />
    }
  </IonChip>;
}

export const CommunityTags: React.FC<{communities: string[], onClose?: OnClose}> = ({communities, onClose}) => {
  const {communities: communityData} = useProfile();
  return <>
    {communities!
      .sort((a, b) => {
	if(communityData[a].name < communityData[b].name){
	  return -1;
	}else{
	  return 1;
	}
      })
      .map((c) => <CommunityTag key={c} community={communityData[c]} onClose={onClose}/>)}
  </>;
}
