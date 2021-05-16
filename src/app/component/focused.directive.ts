import {Directive, ElementRef, Input, OnChanges} from '@angular/core';

@Directive({selector: '[appFocused]'})
export class FocusedDirective implements OnChanges {
  @Input('appFocused') focused: boolean;

  constructor(private host: ElementRef) {
  }

  ngOnChanges(): void {
    if (this.focused) {
      this.host.nativeElement.focus();
    }
  }
}
