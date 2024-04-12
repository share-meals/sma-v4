import Markdown from 'react-markdown';


// todo: provide different languages and load dynamically
import PrivacyPolicyMD from '@/assets/md/privacyPolicy.md';

export const PrivacyPolicy: React.FC = () => {
  return <Markdown>
    {PrivacyPolicyMD}
  </Markdown>;
}
