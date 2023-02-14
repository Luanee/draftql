import { definitions } from '../helper/definitions';
import { references } from '../helper/references';
import { IVariables } from '../types/Variables';
import { Variable } from './Variable';

export class Variables implements IVariables {
  static of(): Variables {
    return new Variables();
  }

  variables?: Variable[];

  constructor() {}

  references(): string {
    return this.variables ? definitions(this.variables) : '';
  }

  definitions(): string {
    return this.variables ? references(this.variables) : '';
  }

  addVariable(variable: Variable): this {
    if (!this.variables) {
      this.variables = [];
    }

    this.variables.push(variable);
    return this;
  }
}
