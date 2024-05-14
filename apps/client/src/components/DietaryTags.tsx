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

export const DietaryTags: React.FC<{tags?: any[] | null}> = ({
  tags = []
}) => {
  return <>
    {(tags ?? []).map(
      (t) => <IonChip
	key={t}
	       style={{
		 '--background': t.startsWith('-') ? 'var(--ion-color-danger)' : 'var(--ion-color-success)',
		 '--color': '#ffffff'
	       }}>
	<IonLabel>
	  <FormattedMessage id={`common.dietary_tags.${t}`} />
	</IonLabel>
      </IonChip>)}
  </>;
}
