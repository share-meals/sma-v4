import {
  AuthProvider,
  DatabaseProvider,
  FirestoreProvider,
  FunctionsProvider,
  useFirebaseApp,
} from 'reactfire';
import {
  connectAuthEmulator,
  getAuth
} from 'firebase/auth';
import {
  connectDatabaseEmulator,
  getDatabase
} from 'firebase/database';
import {
  connectFirestoreEmulator,
  getFirestore
} from 'firebase/firestore';
import {
  connectFunctionsEmulator,
  getFunctions
} from 'firebase/functions';

function ErrorFallback({ error }: any) {
  return (
    <div role='alert'>
      <p>Error loading projects:</p>
      <pre>{error.message}</pre>
    </div>
  );
}

export const FirebaseFeaturesWrapper: React.FC<React.PropsWithChildren> = ({
    children,
}) => {
  const app = useFirebaseApp();
  const auth = getAuth(app);
  const database = getDatabase(app);
  const firestore = getFirestore(app);
  const functions = getFunctions(app);
  if(import.meta.env.VITE_ENVIRONMENT === 'emulator'){
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectDatabaseEmulator(database, 'localhost', 9000)
    connectFirestoreEmulator(firestore, 'localhost', 8080);
    connectFunctionsEmulator(functions, 'localhost', 5001);
    }
  return (
    <AuthProvider sdk={auth}>
      <DatabaseProvider sdk={database}>
	<FirestoreProvider sdk={firestore}>
	  <FunctionsProvider sdk={functions}>
	    {children}
	  </FunctionsProvider>
	</FirestoreProvider>
      </DatabaseProvider>
    </AuthProvider>
  );
};
