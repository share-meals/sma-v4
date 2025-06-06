import {toast} from 'react-toastify';

type toastError = (
  code: string,
  intl: any // need to pass as argument since this is not a component
) => void;

export const toastError: toastError = (code, intl) => {
  switch(code){
    case 'functions/unauthenticated':
      toast.error(intl.formatMessage({id: 'common.errors.unauthenticated'}));
      break;
      // todo: check other cases
    default:
      toast.error(intl.formatMessage({id: 'common.errors.generic'}));
      break;
  }
};
