import React from 'react';
import { fireEvent, render, cleanup } from '@testing-library/react';
import { CountView } from './CountView';

afterEach(cleanup);

it('CountView Test', () => {
  const { getByLabelText } = render(<CountView />);
  expect(getByLabelText('increase one count')).toBeTruthy();
  expect(getByLabelText('decrease one count')).toBeTruthy();
  expect(getByLabelText('alert current count')).toBeTruthy();
  expect(getByLabelText('count')).toBeTruthy();
  expect(getByLabelText('count')).toHaveTextContent('Count: 0');
  fireEvent.click(getByLabelText('increase one count'));
  expect(getByLabelText('count')).toHaveTextContent('Count: 1');
  fireEvent.click(getByLabelText('decrease one count'));
  expect(getByLabelText('count')).toHaveTextContent('Count: 0');
});
