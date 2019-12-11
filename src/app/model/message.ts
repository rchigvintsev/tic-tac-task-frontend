export class Message {
  type: MessageType;
  text: string;

  constructor(type: MessageType, text: string) {
    this.type = type;
    this.text = text;
  }

  isInfo(): boolean {
    return this.type === MessageType.INFO;
  }

  isWarning(): boolean {
    return this.type === MessageType.WARNING;
  }

  isError(): boolean {
    return this.type === MessageType.ERROR;
  }
}

export enum MessageType {INFO, WARNING, ERROR}
