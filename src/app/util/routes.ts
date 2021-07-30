import {Router, UrlTree} from '@angular/router';

export class Routes {
  private constructor() {
  }

  static getNotFoundErrorPageUrl(router: Router, language: string): UrlTree {
    return router.createUrlTree([language, 'error', '404']);
  }
}
