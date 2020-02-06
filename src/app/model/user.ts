import {AbstractEntity} from './abstract-entity';
import {AuthenticatedPrincipal} from '../security/authenticated-principal';

export class User extends AbstractEntity<User> implements AuthenticatedPrincipal {
  email: string;
  fullName: string;
  imageUrl: string;
  validUntilSeconds: number;

  getSubject(): string {
    return this.email;
  }

  getName(): string {
    return this.fullName;
  }

  getPicture(): string {
    return this.imageUrl;
  }

  isValid(): boolean {
    return this.validUntilSeconds && Math.round(Date.now() / 1000) < this.validUntilSeconds;
  }

  deserialize(input: any): User {
    this.email = input.email;
    this.fullName = input.fullName;
    this.imageUrl = input.imageUrl;
    this.validUntilSeconds = input.validUntilSeconds;
    return this;
  }

  clone(): User {
    const clone = new User();
    clone.email = this.email;
    clone.fullName = this.fullName;
    clone.imageUrl = this.imageUrl;
    clone.validUntilSeconds = this.validUntilSeconds;
    return clone;
  }
}
