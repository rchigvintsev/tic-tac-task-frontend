export class PageRequest {
  constructor(public page = 0, public size = 20) {
  }

  toQueryParameters(): string {
    return `page=${this.page}&size=${this.size}`;
  }
}
