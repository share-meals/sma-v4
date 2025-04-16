import {
  FormProvider,
  useForm,
  useFormContext,
} from 'react-hook-form';
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useCallback,
  useState,
} from 'react';
import {getNowAndLater} from '@/utilities';
import {postCreateClientSchema} from '@sma-v4/schema';
import {useProfile} from '@/hooks/Profile';
import {zodResolver} from '@hookform/resolvers/zod';

interface PostFormState {
  isWherePickerReady: boolean;
  resetWhenPickerToNow: () => void;
  setIsWherePickerReady: Dispatch<SetStateAction<boolean>>;
};

const PostFormContext = createContext<PostFormState>({} as PostFormState);

export const usePostForm = () => useContext(PostFormContext);

const whenPickerSetValueOptions = {
  shouldValidate: false,
  shouldDirty: false,
  shouldTouch: false
}

export const PostFormProvider: React.FC<React.PropsWithChildren> = ({children}) => {
  const nowAndLater = getNowAndLater();
  const {features} = useProfile();
  const {reset, ...methods} = useForm({
    defaultValues: {
      communities: features.canPost.length === 1 ? [features.canPost[0]] : [],
      starts: nowAndLater[0],
      ends: nowAndLater[1],
      type: 'event'
    },
    mode: 'onSubmit',
    resolver: zodResolver(postCreateClientSchema),
    reValidateMode: 'onSubmit'
  });

  const [isWherePickerReady, setIsWherePickerReady] = useState<boolean>(false);
  
  const resetWhenPickerToNow = useCallback(() => {
    const [now, hourFromNow] = getNowAndLater();
    methods.setValue('starts', now, whenPickerSetValueOptions); // remove last character since it is a Z by default
    methods.setValue('ends', hourFromNow, whenPickerSetValueOptions); // remove last character since it is a Z by default
  }, []);

  const internalReset = useCallback(() => {
    resetWhenPickerToNow();
    const nowAndLater = getNowAndLater();
    reset();
  }, []);
  return <PostFormContext.Provider
	   value={{
	     isWherePickerReady,
	     resetWhenPickerToNow,
	     setIsWherePickerReady,
	   }}>
    <FormProvider {...methods}
		  reset={internalReset}>
      {children}
    </FormProvider>
  </PostFormContext.Provider>
}
