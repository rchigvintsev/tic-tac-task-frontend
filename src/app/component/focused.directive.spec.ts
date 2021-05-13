import {ElementRef} from '@angular/core';

import {FocusedDirective} from './focused.directive';

describe('FocusedDirective', () => {
  let targetElement: ElementRef;
  let directive: FocusedDirective;

  beforeEach(() => {
    targetElement = {nativeElement: {focus: jasmine.createSpy('focus')}} as any;
    directive = new FocusedDirective(targetElement);
  });

  it('should give focus to target element when "focused" attribute is set to true', () => {
    directive.focused = true;
    directive.ngOnChanges();
    expect(targetElement.nativeElement.focus).toHaveBeenCalled();
  });

  it('should not give focus to target element when "focused" attribute is set to false', () => {
    directive.focused = false;
    directive.ngOnChanges();
    expect(targetElement.nativeElement.focus).not.toHaveBeenCalled();
  });
});
