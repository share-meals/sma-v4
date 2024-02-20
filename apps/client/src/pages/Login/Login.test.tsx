import Login from './Login';
import {render} from '@testing-library/react';

describe('Login', () => {
  it('must render', () => {
    const {findByTestId} = render(
	<Login />
    );

    expect(findByTestId('login page')).toBeInTheDocument();
  });
})
