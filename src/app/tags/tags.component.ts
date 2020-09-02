import {Component, OnInit} from '@angular/core';

import {Tag} from '../model/tag';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.styl']
})
export class TagsComponent implements OnInit {
  tags: Array<Tag>;

  constructor() {
  }

  ngOnInit() {
  }

  onTagListScroll() {
  }
}
