import { IVariable } from './Variable';

type Primitive = string | number | boolean;
type OneOrMore<T> = T | T[];

export type IArgument = Record<string, OneOrMore<Primitive | IVariable>>;
