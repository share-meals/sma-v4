import {I18nProvider} from '@/hooks/I18n';
import {LanguageSwitcher} from './LanguageSwitcher';
import type {
  Meta,
  StoryObj
} from '@storybook/react';

interface LanguageSwitcherProps {};

const meta: Meta<LanguageSwitcherProps> = {
  component: LanguageSwitcher,
  render: (props) => {
    return <I18nProvider>
      <LanguageSwitcher {...props} />
    </I18nProvider>;
  },
  title: 'Components/LanguageSwitcher'
};

export default meta;
type Story = StoryObj<LanguageSwitcherProps>;

export const Default: Story = {
  args: {}
};

export const AsInput: Story = {
  args: {
    fill: 'outline',
    labelPlacement: 'stacked'
  }
}
