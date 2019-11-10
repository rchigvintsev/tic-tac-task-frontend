export class TestAccessToken {
  static get VALID(): string {
    return 'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJwaWN0dXJlIjoiaHR0cDovL2V4YW1wbG'
      + 'UuY29tL3BpY3R1cmUifQ==';
  }

  static get EXPIRED(): string {
    return 'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjN9';
  }
}
