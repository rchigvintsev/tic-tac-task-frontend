import {Router, UrlTree} from '@angular/router';

export class Routes {
  private constructor() {
  }

  static getNotFoundErrorPageUrl(router: Router, language: string): UrlTree {
    return router.createUrlTree([language, 'error', '404']);
  }

  static isError(url: string): boolean {
    return /^(\/[a-z]{2})?\/error(\/.*)?$/.test(url);
  }

  static isAdminArea(url: string): boolean {
    return /^(\/[a-z]{2})?\/admin(\/.*)?$/.test(url);
  }
}
