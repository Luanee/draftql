import { definition } from '../helper/definitions';
import { reference } from '../helper/references';
import { IVariable } from '../types/Variable';

export class Variable implements IVariable {
  static of(name: string, value: any, type: string): Variable {
    return new Variable(name, value, type);
  }

  name: string;
  value: any;
  type: string;
  required: boolean = false;

  constructor(name: string, value: any, type: string) {
    this.name = name;
    this.value = value;
    this.type = type;
  }

  definition(): string {
    return definition(this);
  }

  reference(): string {
    return reference(this);
  }

  isRequired(): this {
    this.required = true;
    return this;
  }
}
