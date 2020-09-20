import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {ConfigService} from './config.service';
import {Tag} from '../model/tag';

const commonHttpOptions = {withCredentials: true};

@Injectable({
  providedIn: 'root'
})
export class TagService {
  readonly baseUrl: string;

  constructor(private http: HttpClient, private config: ConfigService) {
    this.baseUrl = `${this.config.apiBaseUrl}/tags`;
  }

  getTags(): Observable<Tag[]> {
    return this.http.get<any>(this.baseUrl, commonHttpOptions).pipe(
      map(response => {
        const tags = [];
        for (const json of response) {
          tags.push(new Tag().deserialize(json));
        }
        return tags;
      })
    );
  }
}
