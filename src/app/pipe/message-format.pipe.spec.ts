import {getTestBed, TestBed} from '@angular/core/testing';

import {MessageFormatPipe} from './message-format.pipe';

describe('MessageFormat', () => {
  let injector: TestBed;
  let pipe: MessageFormatPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [MessageFormatPipe]});
    injector = getTestBed();
    pipe = injector.inject(MessageFormatPipe);
  });

  it('should be created', () => {
    const result: MessageFormatPipe = TestBed.inject(MessageFormatPipe);
    expect(result).toBeTruthy();
  });

  it('should ignore null value', () => {
    expect(pipe.transform(null)).toBeNull();
  });

  it('should ignore empty string value', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('should return original value when arguments are not provided', () => {
    const value = 'Hi {0}!';
    expect(pipe.transform(value)).toBe(value);
  });

  it('should format message', () => {
    expect(pipe.transform('Cow {0} says: {1}, {1}, {1}!', 'Daisy', 'moo')).toBe('Cow Daisy says: moo, moo, moo!')
  });

  it('should ignore invalid argument index', () => {
    const value = 'Hi {1}!';
    expect(pipe.transform(value, 'Alice')).toBe(value);
  });
});
