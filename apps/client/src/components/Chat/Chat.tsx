const MESSAGE_BLOCK_THRESHOLD_IN_MINUTES = 10;

import {
  ChatMessage,
  chatMessageSchema
} from '@sma-v4/schema';
import classnames from 'classnames';
import {
  doc,
  onSnapshot,
} from 'firebase/firestore';
import {DateTimeDisplay} from '@/components/DateTimeDisplay';
import {firestore} from '@/components/Firebase';
import {
  FormattedMessage,
  useIntl,
} from 'react-intl';
import {
  getFunctions,
  httpsCallable,
} from 'firebase/functions';
import {
  Input,
  StateButton
} from '@share-meals/frg-ui';
import {
  IonCol,
  IonGrid,
  IonIcon,
  IonRow,
} from '@ionic/react';
import {StateButtonLoadingIndicator} from '@/components/StateButtonLoadingIndicator';
import {useForm} from 'react-hook-form';
import {
  useMemo,
  useState,
} from 'react';
import {useProfile} from '@/hooks/Profile';
import {UserName} from '@/components/User';
import {zodResolver} from '@hookform/resolvers/zod';

import SendIcon from '@material-symbols/svg-700/rounded/send-fill.svg';
import './Chat.css';

const hashStringToNumber = (str: string, maxNumber: number) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash += str.charCodeAt(i);
  }
  const mappedNumber = (hash % maxNumber) + 1;
  return mappedNumber;
}

const datesWithinMinutes = (date1: Date, date2: Date, minutes: number) => {
  const difference = Math.abs(date1.getTime() - date2.getTime());
  const minutesDifference = Math.floor(difference / 1000 / 60);
  return minutesDifference <= minutes;
}

// todo: better typing
interface MessageBlockProps {
  texts: string[],
  timestamp: any,
  userId: string
}

const MessageBlock: React.FC<MessageBlockProps> = ({
  texts,
  timestamp,
  userId,
}) => {
  const {user} = useProfile();
  const classes = classnames({
    [`hashedBackground${hashStringToNumber(userId, 10)}`]: true
  });
  const wrapperClasses = classnames({
    messageBlock: true,
    me: userId === user.uid,    
  });
  return <>
    <div className={wrapperClasses}>
      {texts.map((t, index) => <div key={index}>
	<div className={classes}>
	  {t}
	</div>
      </div>)}
      <div className='meta'>
	<span className='userName'>
	  <UserName uid={userId} />
	</span>
	{' · '}
	<span className='timestamp'>
	  <DateTimeDisplay timestamp={timestamp.toDate()} />
	</span>
      </div>
    </div>
  </>;
}

export interface ChatFormProps {
  collection: string, // todo: make post or dm
  documentId: string
}

const ChatForm: React.FC<ChatFormProps> = ({
  documentId
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const intl = useIntl();
  const functions = getFunctions();
  const chatFunction = httpsCallable(functions, 'post-chat-create'); // todo: add dm

  const {
    control,
    handleSubmit,
    reset,
  } = useForm({
    resolver: zodResolver(
      chatMessageSchema.pick({
	text: true
      })
    ),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit'
  });
  const onSubmit = handleSubmit(async (data) => {
    setIsLoading(true);
    await chatFunction({
      postId: documentId,
      text: data.text
    })
    reset();
    setIsLoading(false);
  });
  
  return <>
    <form
      noValidate
      onSubmit={onSubmit}>
      <IonGrid>
	<IonRow className='ion-align-items-top'>
	  <IonCol>
	    <Input
	      aria-label={intl.formatMessage({id: 'components.chat.text.input.ariaLabel'})}
	      control={control}
	      data-testid='components.chat.text.input'
	      disabled={isLoading}
	      fill='outline'
	      label={undefined}
	      placeholder={intl.formatMessage({id: 'components.chat.inputPlaceholder'})}
	      name='text'
	      required={true}
	      type='text'
	    />
	  </IonCol>
	  <IonCol size='auto' style={{paddingTop: 10}}>
	    <StateButton
	      aria-label={intl.formatMessage({id: 'components.chat.submit.button.ariaLabel'})}
	      data-testid='components.chat.submit.button'
	      isLoading={isLoading}
	      loadingIndicator={<StateButtonLoadingIndicator />}
	      type='submit'>
	      <IonIcon
		aria-hidden='true'
		slot='icon-only'
		src={SendIcon}
	      />
	    </StateButton>
	  </IonCol>
	</IonRow>
      </IonGrid>
    </form>
  </>;
}

type Messages = ChatMessage[];

export interface ChatProps {
  messages: Messages
}

const ChatMessages: React.FC<ChatProps> = ({
  messages
}) => {
  const messageBlocks = useMemo(() => {
    if(messages === undefined
       || messages.length === 0){
      return [];
    }
    const blocks: any[] = [];
    for(const message of messages){
      if(blocks.length === 0){
	blocks.push({
	  texts: [message.text],
	  timestamp: message.timestamp,
	  userId: message.userId,
	});
      }else{
	if(blocks[blocks.length - 1].userId === message.userId
	   && datesWithinMinutes(
	     blocks[blocks.length - 1].timestamp.toDate(),
	     message.timestamp.toDate(),
	     MESSAGE_BLOCK_THRESHOLD_IN_MINUTES
	)){
	  blocks[blocks.length - 1].texts.push(message.text);
	  blocks[blocks.length - 1].timestamp = message.timestamp;
	}else{
	  blocks.push({
	    texts: [message.text],
	    timestamp: message.timestamp,
	    userId: message.userId,
	  })
	}
      }
    }
    return blocks;
  }, [messages]);
  if(messages === undefined
     || messages.length === 0){
    return <div className='ion-text-center mv-1'>
      <FormattedMessage id='components.chat.noMessages' />
    </div>;
  }
  const renderedMessages = messageBlocks.map((block) => <MessageBlock {...block} key={block.timestamp} />);
  return <>
    {renderedMessages}
  </>;
};

export const Chat: React.FC<ChatFormProps> = ({
  collection,
  documentId,
}) => {
  //const {user: {uid}} = useProfile();
  const [messages, setMessages] = useState<Messages>([]);
  const chatDoc = doc(firestore, 'chats', documentId);
  onSnapshot(chatDoc, (d) => {
    const data = d.data();
    if(data
       && JSON.stringify(messages) !== JSON.stringify(data.messages)){
      setMessages(data.messages);
    }
  });
  return <>
    <div className='chatMessagesWrapper'>
      <ChatMessages messages={messages} />
    </div>
    <ChatForm {...{collection, documentId}} />
  </>;
};
