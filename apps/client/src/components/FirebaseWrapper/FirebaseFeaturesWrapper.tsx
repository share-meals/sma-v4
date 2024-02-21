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

export const FirebaseFeaturesWrapper: React.FC<React.PropsWithChildren> = ({
    children,
}) => {
  const app = useFirebaseApp();
  const auth = getAuth(app);
  const database = getDatabase(app);
  const firestore = getFirestore(app);
  const functions = getFunctions(app);
  if(import.meta.env.VITE_ENVIRONMENT === 'emulator'){
    try{
      connectAuthEmulator(auth, 'http://localhost:9099');
      connectDatabaseEmulator(database, 'localhost', 9000)
      connectFirestoreEmulator(firestore, 'localhost', 8080);
      connectFunctionsEmulator(functions, 'localhost', 5001);
    }
    catch(error){
      // todo: in emulator: Firebase: Error (auth/emulator-config-failed)
      console.log(error);
    }
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
