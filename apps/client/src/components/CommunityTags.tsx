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

import StarIcon from '@material-design-icons/svg/filled/star.svg';

const affiliatedCommunitySchema = communitySchema.extend({
  myMembership: myMembershipSchema
});

type Community = z.infer<typeof affiliatedCommunitySchema>;

const CommunityTag: React.FC<{community: Community}> = ({community}) => {
  const theme = community.colors ? community.colors[0] : {
    color: '#000000',
    type: 'dark'
  };
  return <IonChip style={{
    '--background': theme.color,
    '--color': theme.type === 'dark' ? '#ffffff' : '#000000'
  }}>
    <IonLabel>
      {community.name}
    </IonLabel>
    <IonIcon
      aria-hidden='true'
      icon={community.myMembership === 'admin' ? StarIcon : person }
      style={{
	'color': theme.type === 'dark' ? '#ffffff' : '#000000'
      }}
    />
  </IonChip>;
}

export const CommunityTags: React.FC<{communities: string[]}> = ({communities}) => {
  const {communities: communityData} = useProfile();
  return <>
    {communities!.map((c) => <CommunityTag key={c} community={communityData[c]} />)}
  </>;
}
