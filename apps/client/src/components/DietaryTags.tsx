import {
  IonChip,
  IonLabel,
} from '@ionic/react';
import {FormattedMessage} from 'react-intl';
import {Tag} from '@sma-v4/schema';

interface DietaryTagsProps {
  tags: Tag[],
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
