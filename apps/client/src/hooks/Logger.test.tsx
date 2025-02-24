import {
  render,
  screen
} from '@testing-library/react';
import {
  LoggerProvider,
  useLogger
} from './Logger';
import userEvent from '@testing-library/user-event';

vitest.mock('firebase/functions', () => ({
  getFunctions: jest.fn(),
}));

const TestComponent = () => {
  const {log, logs} = useLogger();
  return (<>
    <div data-testid='logs'>
      {logs.map((l) => (
        <div key={l.timestamp}>{l.message}</div>
      ))}
    </div>
    <button onClick={() => {
      log({
	component: 'TestComponent',
	level: 'debug',
	message: 'hello world'
      });
    }}>
      Log
    </button>
  </>);
};

describe('Logger hook', () => {
  test('initializes with an empty array of logs', () => {
    render(
      <LoggerProvider>
        <TestComponent />
      </LoggerProvider>
    );

    const logsContainer = screen.getByTestId('logs');
    expect(logsContainer).toBeEmptyDOMElement();
  });

  test('updates logs when log is called', async () => {
    render(
      <LoggerProvider>
        <TestComponent />
      </LoggerProvider>
    );

    const button = screen.getByText('Log');
    await userEvent.click(button);

    const logsContainer = screen.getByTestId('logs');
    expect(logsContainer).toHaveTextContent('hello world');
  });
});
