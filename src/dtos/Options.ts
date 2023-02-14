import { IOptions } from '../types/Options';

export class Options implements IOptions {
  static of(): Options {
    return new Options();
  }

  ignoreFields?: string[];

  constructor() {}

  addIgnoreField(field: string): this {
    if (!this.ignoreFields) {
      this.ignoreFields = [];
    }

    this.ignoreFields.push(field);

    return this;
  }

  addIgnoreFields(fields: string[]): this {
    if (!this.ignoreFields) {
      this.ignoreFields = [];
    }

    this.ignoreFields.push(...fields);
    return this;
  }
}
