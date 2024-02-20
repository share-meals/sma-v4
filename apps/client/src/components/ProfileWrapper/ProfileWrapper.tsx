import {CommunitiesProvider} from '@/contexts/Communities';
import {
  doc,
  Firestore
} from 'firebase/firestore';
import {PostsProvider} from '@/contexts/Posts';
import {ProfileProvider} from '@/contexts/Profile';
import {
  useFirestore,
  useSigninCheck,
} from 'reactfire';

export const ProfileWrapper: React.FC<React.PropsWithChildren> = ({
  children
}) => {
  const {data: {signedIn}} = useSigninCheck();
  if(signedIn){
    return <ProfileProvider>
      <CommunitiesProvider>
	<PostsProvider>
	  {children}
	</PostsProvider>
      </CommunitiesProvider>
    </ProfileProvider>;  
  }else{
    // todo: check if this is ok
    return children;
  }
}
