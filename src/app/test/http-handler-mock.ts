import {HttpEvent, HttpHandler, HttpRequest, HttpResponse} from '@angular/common/http';

import {Observable, of} from 'rxjs';

export class HttpHandlerMock extends HttpHandler {
  savedRequest: HttpRequest<any>;

  constructor(private responseFunction: () => Observable<HttpEvent<any>> = () => of(new HttpResponse())) {
    super();
  }

  handle(req: HttpRequest<any>): Observable<HttpEvent<any>> {
    this.savedRequest = req;
    return this.responseFunction();
  }
}
