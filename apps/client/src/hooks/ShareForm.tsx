import {
  FormProvider,
  useForm,
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
import {shareCreateClientSchema} from '@sma-v4/schema';
import {useProfile} from '@/hooks/Profile';
import {zodResolver} from '@hookform/resolvers/zod';

interface ShareFormState {
  isWherePickerReady: boolean;
  resetWhenPickerToNow: () => void;
  setIsWherePickerReady: Dispatch<SetStateAction<boolean>>;
};

const ShareFormContext = createContext<ShareFormState>({} as ShareFormState);

export const useShareForm = () => useContext(ShareFormContext);

const whenPickerSetValueOptions = {
  shouldValidate: false,
  shouldDirty: false,
  shouldTouch: false
}

export const ShareFormProvider: React.FC<React.PropsWithChildren> = ({children}) => {
  const nowAndLater = getNowAndLater();
  const {features} = useProfile();
  const {reset, ...methods} = useForm({
    defaultValues: {
      communities: features.canShare.length === 1 ? [features.canShare[0]] : [],
      starts: nowAndLater[0],
      ends: nowAndLater[1],
      swipes: 3,
      type: 'share',
    },
    mode: 'onSubmit',
    resolver: zodResolver(shareCreateClientSchema),
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
    reset();
  }, []);
  return <ShareFormContext.Provider
	   value={{
	     isWherePickerReady,
	     resetWhenPickerToNow,
	     setIsWherePickerReady,
	   }}>
    <FormProvider {...methods}
		  reset={internalReset}>
      {children}
    </FormProvider>
  </ShareFormContext.Provider>
}
