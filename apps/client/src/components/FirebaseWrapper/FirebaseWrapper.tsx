import {FirebaseFeaturesWrapper} from './FirebaseFeaturesWrapper';
import {FirebaseAppProvider} from 'reactfire';
import {initializeApp} from 'firebase/app';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
};

// todo: better typing?
export const FirebaseWrapper: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <FirebaseAppProvider firebaseConfig={firebaseConfig} suspense={true}>
      <FirebaseFeaturesWrapper>{children}</FirebaseFeaturesWrapper>
    </FirebaseAppProvider>
  );
};
