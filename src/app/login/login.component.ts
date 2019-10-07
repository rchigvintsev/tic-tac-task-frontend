import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material/icon';

import {TranslateService} from '@ngx-translate/core';

import {AbstractComponent} from '../abstract-component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.styl']
})
export class LoginComponent extends AbstractComponent {
  constructor(router: Router, translate: TranslateService, iconRegistry: MatIconRegistry, domSanitizer: DomSanitizer) {
    super(router, translate);
    iconRegistry.addSvgIcon('logo-google',
      domSanitizer.bypassSecurityTrustResourceUrl('../assets/img/btn_google_light_normal.svg'));
  }
}
