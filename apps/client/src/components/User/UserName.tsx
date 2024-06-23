import useSWR from 'swr';
import {useUsers} from '@/hooks/Users';

interface UserNameProps {
  uid: string // todo: pull from schema
}


export const UserName: React.FC<UserNameProps> = ({uid}) => {
  const {getUser} = useUsers();
  const {data, error, isLoading} = useSWR(uid, getUser);
  // todo: error handling
  if(isLoading){
    return  '...';
  }
  return <>
    {data.displayName}
  </>
};
