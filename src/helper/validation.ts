import { IOperation, IVariable, IVariables } from '../types';

export function isVariable(variable: object): variable is IVariable {
  return (variable as IVariable).value && (variable as IVariable).required;
}

/**
 * Checks if a given variable is not existent in the query
 * @param {string} varName Variable name without $
 * @param {queryType} query The JSON-Like Query
 */
function isInvalid(variable: IVariable, variables: IVariables) {
  return (
    !variables ||
    !variables[variable.name] ||
    !isVariable(variables[variable.name]) ||
    variable.value === undefined
  );
}
