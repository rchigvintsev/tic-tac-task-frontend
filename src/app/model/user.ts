import {AbstractEntity} from './abstract-entity';
import {AuthenticatedPrincipal} from '../security/authenticated-principal';
import {Objects} from '../util/objects';

export class User extends AbstractEntity<User> implements AuthenticatedPrincipal {
  id: number;
  email: string;
  password: string;
  fullName: string;
  profilePictureUrl: string;
  validUntilSeconds: number;

  getId(): number {
    return this.id;
  }

  getEmail(): string {
    return this.email;
  }

  getName(): string {
    return this.fullName;
  }

  getProfilePictureUrl(): string {
    return this.profilePictureUrl;
  }

  isValid(): boolean {
    return this.validUntilSeconds && Math.round(Date.now() / 1000) < this.validUntilSeconds;
  }

  deserialize(input: any): User {
    this.id = input.id;
    this.email = input.email;
    this.password = input.password;
    this.fullName = input.fullName;
    this.profilePictureUrl = input.profilePictureUrl;
    this.validUntilSeconds = input.validUntilSeconds;
    return this;
  }

  clone(): User {
    const clone = new User();
    clone.id = this.id;
    clone.email = this.email;
    clone.password = this.password;
    clone.fullName = this.fullName;
    clone.profilePictureUrl = this.profilePictureUrl;
    clone.validUntilSeconds = this.validUntilSeconds;
    return clone;
  }

  equals(other: User): boolean {
    return Objects.equals(this.id, other.id)
      && Objects.equals(this.email, other.email)
      && Objects.equals(this.password, other.password)
      && Objects.equals(this.fullName, other.fullName)
      && Objects.equals(this.profilePictureUrl, other.profilePictureUrl)
      && Objects.equals(this.validUntilSeconds, other.validUntilSeconds);
  }
}
