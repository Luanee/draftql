import { IVariable } from './Variable';

type Primitive = string | number | boolean;
type OneOrMore<T> = T | T[];

export type IArgument = Record<string, OneOrMore<Primitive>>;
export type IArguments = (IArgument | IVariable)[];
// export type IArgument = Record<string, OneOrMore<Primitive | IVariable>>;
