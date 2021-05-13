import {Directive, ElementRef, Input} from '@angular/core';
import {OnChanges} from '@angular/core/src/metadata/lifecycle_hooks';

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
