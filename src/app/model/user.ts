import {Serializable} from './serializable';
import {AuthenticatedPrincipal} from '../security/authenticated-principal';

export class User implements AuthenticatedPrincipal, Serializable<User> {
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
}
