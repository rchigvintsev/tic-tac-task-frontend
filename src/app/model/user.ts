import * as moment from 'moment';

import {AbstractEntity} from './abstract-entity';
import {Objects} from '../util/objects';

export class User extends AbstractEntity {
  id: number;
  email: string;
  password: string;
  fullName: string;
  profilePictureUrl: string;
  admin: boolean;
  enabled: boolean;
  validUntilSeconds: number;
  createdAt: Date;

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
    this.enabled = input.enabled;
    this.validUntilSeconds = input.validUntilSeconds;
    if (input.createdAt) {
      this.createdAt = moment.utc(input.createdAt, moment.HTML5_FMT.DATETIME_LOCAL_MS).toDate();
    }
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
    clone.enabled = this.enabled;
    clone.validUntilSeconds = this.validUntilSeconds;
    clone.createdAt = this.createdAt;
    return clone;
  }

  equals(other: User): boolean {
    if (!other) {
      return false;
    }
    return Objects.equal(this.id, other.id)
      && Objects.equal(this.email, other.email)
      && Objects.equal(this.password, other.password)
      && Objects.equal(this.fullName, other.fullName)
      && Objects.equal(this.profilePictureUrl, other.profilePictureUrl)
      && Objects.equal(this.admin, other.admin)
      && Objects.equal(this.enabled, other.enabled)
      && Objects.equal(this.validUntilSeconds, other.validUntilSeconds)
      && Objects.equal(this.createdAt, other.createdAt);
  }
}
