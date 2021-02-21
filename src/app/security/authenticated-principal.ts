export interface AuthenticatedPrincipal {
  getId(): number;

  getName(): string;

  getEmail(): string;

  getProfilePictureUrl(): string;

  isValid(): boolean;
}
