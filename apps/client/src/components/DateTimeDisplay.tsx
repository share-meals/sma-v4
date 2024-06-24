import {
  isSameDay,
  isSameYear,
} from 'date-fns';
import {
  FormattedDate,
  FormattedTime,
} from 'react-intl';

interface DateTimeDisplay {
  timestamp: Date
}

export const DateTimeDisplay: React.FC<DateTimeDisplay> = ({timestamp}) => {
  //if(isSameDay(now, timestamp)){
  return <>
    <DateDisplay timestamp={timestamp} />
    {' · '}
    <TimeDisplay timestamp={timestamp} />
  </>;
};

export const DateDisplay: React.FC<DateTimeDisplay> = ({timestamp}) => {
  const now = new Date();
  if(isSameDay(now, timestamp)){
    return 'today';
  }else{
    return <FormattedDate
	     weekday='short'
	     month='short'
	     day='numeric'
	     year={isSameYear(timestamp, now) ? undefined : 'numeric'}
	     value={timestamp}
    />
  }
};

export const TimeDisplay: React.FC<DateTimeDisplay> = ({timestamp}) => {
  return <FormattedTime
	   localeMatcher='best fit'
	   value={timestamp}
  />

};
