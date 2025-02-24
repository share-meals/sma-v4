// @ts-nocheck
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
import { vi } from 'vitest';

import * as React from 'react';
global.React = React;

// Mock matchmedia
window.matchMedia = window.matchMedia || function() {
  return {
      matches: false,
      addListener: function() {},
      removeListener: function() {}
  };
};

vi.mock('firebase/app');
vi.mock('firebase/auth');
vi.mock('firebase/firestore');
vi.mock('firebase/storage');
vi.mock('firebase/functions');

vi.mock("react-intl", () => ({
  ...vi.importActual("react-intl"), // Keep the real implementation for other functions
  useIntl: () => ({
    formatMessage: ({ id }, values) => id, // Returns the message ID instead of translation
    locale: "en",
  }),
  defineMessages: (messages) => messages, // Keep message definitions the same
  FormattedMessage: ({ id, defaultMessage }) => defaultMessage || id, // Mock component
}));
