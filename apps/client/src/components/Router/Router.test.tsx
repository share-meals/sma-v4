import {FirebaseWrapper} from '../FirebaseWrapper';
import {render} from '@testing-library/react';
import {Router} from './Router';
import {useSigninCheck} from 'reactfire';

// throws error because of Login and Signup page, likely because of frg-ui

vi.mock('reactfire', async (actual) => {
  const reactfireActual = await actual();
  return {
    ...reactfireActual,
    useSigninCheck: vi.fn()
  }
});

const setAuthed: void = (authed: boolean) => {
  useSigninCheck.mockReturnValueOnce({
    data: {
      signedIn: authed
    }
  });
};

describe('Router', () => {
  describe('Footer', () => {
    const unAuthedButtonIds: string[] = [
      'login button',
      'signup button'
    ];

    const authedButtonIds: string[] = [
      'map button',
      'account button'
    ];
    
    it('should render the correct navigation buttons when the user is not logged in', async () => {
      setAuthed(false);
      
      const {findByTestId} = render(
	<FirebaseWrapper>
	  <Router />
	</FirebaseWrapper>
      );

      for(const buttonId of unAuthedButtonIds){
	expect(await findByTestId(buttonId)).toBeInTheDocument();
      }

      for(const buttonId of authedButtonIds){
	expect(await findByTestId(buttonId)).toBeNull();
      }
    });
    
    
    it('should render the correct navigation buttons when the user is logged in', async () => {
      setAuthed(true);
      
      const {queryByTestId} = render(
	<div>
	</div>
      );
      
      for(const buttonId of unAuthedButtonIds){
	expect(queryByTestId(buttonId)).toBeNull();
      }

      for(const buttonId of authedButtonIds){
	expect(await findByTestId(buttonId)).toBeInTheDocument();
      }
    });
  });
/*  

  it('should render a loading indicator while waiting to check authed status', () => {
    useSigninCheck.mockReturnValueOnce({
      status: 'loading'
    });

    const {queryByTestId} = render(
      <Router />
    );

    expect(queryByTestId('loading indicator')).toBeInTheDocument();
  });

  describe('Unauthed Routes', () => {
    beforeEach(() => {
      setAuthed(false);
    });

    it('should render a MustUnauthed page when unauthed', () => {
      const {queryByTestId} = render(<MemoryRouter initialEntries={['/login']}>
	<Routes />
      </MemoryRouter>);
      
      expect(queryByTestId('login page')).toBeInTheDocument();
    });
  });

  describe.skip('Authed Routes', () => {
    beforeEach(() => {
      setAuthed(true);
    });
    
    it('should redirect to /map when accessing a MustUnauthed page while authed', () => {

      const {queryByTestId} = render(<MemoryRouter initialEntries={['/login']}>
	<Routes />
      </MemoryRouter>);

      expect(queryByTestId('map page')).toBeInTheDocument();
    });
  });

  describe('/ route', () => {
    it('should redirect to /login when unauthed', () => {
      setAuthed(false);
      
      const {queryByTestId} = render(<MemoryRouter initialEntries={['/']}>
	<Routes />
      </MemoryRouter>);
      
      expect(queryByTestId('login page')).toBeInTheDocument();
    });

    it('should redirect to /map when authed', () => {
      setAuthed(true);
      
      const {queryByTestId} = render(<MemoryRouter initialEntries={['/']}>
	<Routes />
      </MemoryRouter>);
      
      expect(queryByTestId('map page')).toBeInTheDocument();
    });
  });
  
  describe('AnyAuthed Routes', () => {
    beforeEach(() => {
      setAuthed(false);
    });

    it('should render the Notfound page when visiting an incorrect url', () => {
      const {queryByTestId} = render(<MemoryRouter initialEntries={['/abc']}>
	<Routes />
      </MemoryRouter>);
      
      expect(queryByTestId('not found page')).toBeInTheDocument();
    });
  });
*/  
});
