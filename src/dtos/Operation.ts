import { IArgument } from '../types/Argument';
import { IOperation } from '../types/Operation';

export class Operation implements IOperation {
  static of(name: string, alias?: string): Operation {
    return new Operation(name, alias);
  }

  name: string;
  alias?: string;
  args: IArgument = {};
  fields: string[] = [];
  options: Record<string, string> = {};

  constructor(name: string, alias?: string) {
    this.name = name;
    this.alias = alias;
  }
}
