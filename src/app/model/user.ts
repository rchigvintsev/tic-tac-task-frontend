import {AbstractEntity} from './abstract-entity';
import {Objects} from '../util/objects';

export class User extends AbstractEntity<User> {
  id: number;
  email: string;
  password: string;
  fullName: string;
  profilePictureUrl: string;
  admin: boolean;
  validUntilSeconds: number;

  isValid(): boolean {
    return this.validUntilSeconds && Math.round(Date.now() / 1000) < this.validUntilSeconds;
  }

  deserialize(input: any): User {
    this.id = input.id;
    this.email = input.email;
    this.password = input.password;
    this.fullName = input.fullName;
    this.profilePictureUrl = input.profilePictureUrl;
    this.admin = input.admin;
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
    clone.admin = this.admin;
    clone.validUntilSeconds = this.validUntilSeconds;
    return clone;
  }

  equals(other: User): boolean {
    return Objects.equals(this.id, other.id)
      && Objects.equals(this.email, other.email)
      && Objects.equals(this.password, other.password)
      && Objects.equals(this.fullName, other.fullName)
      && Objects.equals(this.profilePictureUrl, other.profilePictureUrl)
      && Objects.equals(this.admin, other.admin)
      && Objects.equals(this.validUntilSeconds, other.validUntilSeconds);
  }
}
