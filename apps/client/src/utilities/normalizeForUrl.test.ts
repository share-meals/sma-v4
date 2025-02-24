import {
  describe,
  expect,
  test,
} from 'vitest'
import {normalizeForUrl} from './normalizeForUrl';


describe('normalizeForUrl', () => {
  test('converts string to lowercase', () => {
    expect(normalizeForUrl('HelloWorld')).toBe('helloworld');
  });

  test('replaces spaces with hyphens', () => {
    expect(normalizeForUrl('Hello World')).toBe('hello-world');
  });

  test('removes special characters', () => {
    expect(normalizeForUrl('Hello, World!')).toBe('hello-world');
  });

  test('replaces mulitple hyphens with a single hyphen', () => {
    expect(normalizeForUrl('Hello---World')).toBe('hello-world');
  });

  test('removes leading and trailing hyphens', () => {
    expect(normalizeForUrl('--Hello World--')).toBe('hello-world');
  });
});
