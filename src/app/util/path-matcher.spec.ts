import {PathMatcher} from './path-matcher';

describe('PathMatcher', () => {
  it(`should return true when path matches`, () => {
    const urlTree = {root: {children: {primary: {segments: [{path: 'en'}, {path: 'foo'}]}}}} as any;
    const pathMatcher = PathMatcher.fromUrlTree(urlTree);
    expect(pathMatcher.matches('foo')).toBeTruthy();
  });

  it(`should return false when path does not match`, () => {
    const urlTree = {root: {children: {primary: {segments: [{path: 'en'}, {path: 'foo'}]}}}} as any;
    const pathMatcher = PathMatcher.fromUrlTree(urlTree);
    expect(pathMatcher.matches('bar')).toBeFalsy();
  });

  it(`should return false when fragment does not match`, () => {
    const urlTree = {
      root: {children: {primary: {segments: [{path: 'en'}, {path: 'foo'}]}}},
      fragment: 'first'
    } as any;
    const pathMatcher = PathMatcher.fromUrlTree(urlTree);
    expect(pathMatcher.matches('foo', 'second')).toBeFalsy();
  });
});
