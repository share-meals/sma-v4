import {LoadingIndicator} from './LoadingIndicator';
import {
  Meta,
  StoryObj
} from'@storybook/react';

const meta: Meta<typeof LoadingIndicator> = {
  component: LoadingIndicator,
  decorators: [
    (Story) => (
      <div style={{
	backgroundColor: 'var(--ion-color-primary)',
	height: '100%'
      }}>
	<Story />
      </div>
    )
  ]
};

export default meta;
type Story = StoryObj<typeof LoadingIndicator>;

export const Default: Story = {
  args: {
    name: undefined
  }
};

export const Dots: Story = {
  args: {
    name: 'dots'
  }
};
