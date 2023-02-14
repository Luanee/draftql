import { IVariable } from '../types/Variable';

export function reference(variable: IVariable): string {
  return `$${variable.name}`;
}

export function references(variables: IVariable[]): string {
  return variables.map((variable) => reference(variable)).join(', ');
}
