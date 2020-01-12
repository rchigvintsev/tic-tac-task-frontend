export interface AuthenticatedPrincipal {
  getName(): string;

  getSubject(): string;

  getPicture(): string;

  isValid(): boolean;
}
