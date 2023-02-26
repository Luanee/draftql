import { IVariable } from './Variable';

type OneOrMore<T> = T | T[];
export type Primitive = string | number | boolean;

export type IArgument = OneOrMore<Primitive | IVariable | any>;
export type IArguments = Record<string, IArgument>;
// export type IArgument = Record<string, OneOrMore<Primitive | IVariable>>;
