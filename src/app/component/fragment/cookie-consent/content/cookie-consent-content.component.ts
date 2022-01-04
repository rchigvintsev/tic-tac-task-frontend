import {Component, NgModule, OnInit} from '@angular/core';
import {MatSnackBarRef} from '@angular/material/snack-bar';
import {MatButtonModule} from '@angular/material/button';

import {FlexModule} from '@angular/flex-layout';
import {TranslateModule} from '@ngx-translate/core';

@Component({
  templateUrl: './cookie-consent-content.component.html',
  styleUrls: ['./cookie-consent-content.component.scss']
})
export class CookieConsentContentComponent implements OnInit {
  constructor(private snackBarRef: MatSnackBarRef<CookieConsentContentComponent>) {
  }

  ngOnInit(): void {
  }

  onOkButtonClick() {
    this.snackBarRef.dismissWithAction()
  }
}

@NgModule({
  imports: [
    MatButtonModule,
    FlexModule,
    TranslateModule
  ],
  declarations: [CookieConsentContentComponent]
})
class CookieConsentContentModule {
}
