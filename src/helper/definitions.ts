import { IVariable } from '../types/Variable';

export function definition(obj: IVariable): string {
  const mark = obj.required ? '!' : '';
  return `${obj.name}: ${obj.type}${mark}`;
}

export function definitions(variables: IVariable[]): string {
  return `${variables.map((variable) => definition(variable)).join(', ')}`;
}
