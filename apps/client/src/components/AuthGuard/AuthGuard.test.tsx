import {createBrowserHistory} from 'history';
import {AuthGuard} from './AuthGuard';
import {render} from '@testing-library/react';
import {Router} from 'react-router-dom';
import {useSigninCheck} from 'reactfire';

const history = createBrowserHistory();
history.replace = vi.fn();

vi.mock('reactfire', async (actual) => {
  const reactfireActual = await actual();
  return {
    ...reactfireActual,
    useSigninCheck: vi.fn()
  }
});

describe('AuthGuard', () => {
  it('should render children when unauthed', async () => {
    useSigninCheck.mockReturnValueOnce({
      data: {
	signedIn: false
      }
    });

    const {findByTestId} = render(
      <AuthGuard>
	<div data-testid='child div'></div>
      </AuthGuard>
    );

    expect(await findByTestId('child div')).toBeInTheDocument();
  });

  it('should redirect when authed', () => {
    useSigninCheck.mockReturnValueOnce({
      data: {
	signedIn: true
      }
    });

    render(
      <Router history={history}>
	<AuthGuard />
      </Router>
    );

    expect(history.replace).toHaveBeenCalled();
  });

  it('should render a loading indicator while waiting to check authed status', () => {
    useSigninCheck.mockReturnValueOnce({
      status: 'loading'
    });

    const {queryByTestId} = render(
      <AuthGuard />
    );

    expect(queryByTestId('loading indicator')).toBeInTheDocument();
  });
});
