import {
  IonChip,
  IonIcon,
  IonLabel,
} from '@ionic/react';
import {FormattedMessage} from 'react-intl';

// todo: pull from postSchema
//import {postSchema} from '@sma-v4/schema';
//import {z} from 'zod';

//type Tags = Pick<z.infer(typeof postSchema), 'tags'> | undefined | null;

interface DietaryTagsProps {
  tags: any[],
}

export const DietaryTags: React.FC<DietaryTagsProps> = ({
  tags
}) => {
  return <>
    {tags.map(
      (t) => <IonChip
	key={t}
	color={t.startsWith('-') ? 'danger' : 'success'}>
	<IonLabel>
	  <FormattedMessage id={`common.dietary_tags.${t}`} />
	</IonLabel>
      </IonChip>)}
  </>;
}
