import { IArguments } from './Argument';
import { IOptions } from './Options';
import { IVariable } from './Variable';

export interface Schema {
  name: string;
  alias?: string;
  args?: IArguments;
  fields: (string | Schema)[];
  options?: IOptions;
  variables?: IVariable[];
}
