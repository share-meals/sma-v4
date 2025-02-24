import React from 'react';
import {render} from '@testing-library/react';
import {PageNotFound} from './PageNotFound';

describe('PageNotFound page', () => {
  test('renders', () => {
    const {baseElement} = render(<PageNotFound />);
    expect(baseElement).toBeDefined();
  });
});
