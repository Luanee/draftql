import { IArgument } from './Argument';
import { IOptions } from './Options';
import { IVariables } from './Variables';

export interface IOperation {
  name: string;
  alias?: string;
  args?: IArgument;
  fields: string[];
  options?: IOptions;
  variables?: IVariables;
}
