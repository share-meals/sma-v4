import {
  IonChip,
  IonIcon,
  IonLabel,
} from '@ionic/react';
import {postSchema} from '@sma-v4/schema';
import {z} from 'zod';

// todo: pull from postSchema
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
	  {t.slice(1)}
	</IonLabel>
      </IonChip>)}
  </>;
}
