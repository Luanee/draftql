import { IVariable } from './Variable';

type Primitive = string | number | boolean;
type OneOrMore<T> = T | T[];

export type IArguments = Record<string, OneOrMore<Primitive | IVariable | any>>;
export type IArgument = IArgument[];
// export type IArgument = Record<string, OneOrMore<Primitive | IVariable>>;
