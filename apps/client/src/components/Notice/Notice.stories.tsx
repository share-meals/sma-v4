import {LoremIpsum} from 'react-lorem-ipsum';
import type {
  Meta,
  StoryObj
} from '@storybook/react';
import {
  Notice,
  NoticeProps
} from './Notice';

const meta: Meta<NoticeProps & {defaultValue: string}> = {
    component: Notice,
    render: (props) => {
	return (
	  <Notice {...props}>
	    <LoremIpsum p={1} avgSentencesPerParagraph={2} />
	  </Notice>
	);
    },
    title: 'Components/Notice'
}

export default meta;
type Story = StoryObj<NoticeProps>;

export const Danger: Story = {
  args: {
    color: 'danger'
  }
};

export const Primary: Story = {
  args: {
    color: 'primary'
  }
};

export const Secondary: Story = {
  args: {
    color: 'secondary'
  }
};

export const Success: Story = {
  args: {
    color: 'success'
  }
};

