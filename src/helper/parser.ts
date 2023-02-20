import { Schema, IQuery, IVariable, QueryType, isQueryType, IArgument } from '../types';
import { definitions } from './definitions';

export function buildGraphQLQuery(graphql: IQuery): {
  query: string;
  variables?: Record<string, any>;
} {
  let query: string;
  const variables = undefined;

  query = buildGraphQLHead(graphql);

  return { query, variables };
}

function buildGraphQLHead(graphql: IQuery): string {
  let query: string = `${graphql.type}`;

  if (graphql.name) {
    query += ` ${graphql.name}`;
  }

  query += buildVariableDefinitions(graphql.operations);

  return query;
}

function buildVariableDefinitions(query: Schema | Schema[]): string {
  const variableDefinitions = Array.isArray(query)
    ? definitions(query.flatMap((schema) => schema.variables ?? []))
    : definitions(query.variables ?? []);

  return variableDefinitions.length ? `(${variableDefinitions})` : '';
}

export class GraphQLRequestBuilder {
  static of(graphql: IQuery): GraphQLRequestBuilder {
    return new GraphQLRequestBuilder(graphql);
  }

  type: QueryType;
  operations: Schema[] = [];
  name?: string;
  builder: {
    variables: GraphQLVariableBuilder;
    fields: GraphQLFieldBuilder;
  };

  constructor(graphql: IQuery) {
    this.type = graphql.type;
    this.name = graphql.name;
    this.builder = { variables: GraphQLVariableBuilder.of(), fields: GraphQLFieldBuilder.of() };

    if (Array.isArray(graphql.operations)) {
      this.operations.push(...graphql.operations);
    } else {
      this.operations.push(graphql.operations);
    }
  }

  build(): { query: string; variables: Record<string, any> | undefined } {
    if (!isQueryType(this.type)) {
      throw Error(`Query type must be one of: ${Object.values(QueryType).join(', ')}`);
    }
    this.buildd(this.operations);
    return {
      query: this.operation(this.operationFields(), this.operationArguments()),
      variables: this.builder.variables.variables(),
    };
  }

  buildd(operations: Schema[]) {
    operations.forEach((operation) => {
      if (operation.variables && operation.variables.length) {
        this.builder.variables.addVariables(operation.name, operation.variables);
      }

      if (operation.fields.length) {
        operation.fields.forEach((field) => {
          if (Validator.isSchema(field)) {
            this.buildd([field]);
          } else {
            console.log(field);
          }
        });
      }
    });
  }

  private operation(fields: string, definitions: string): string {
    const header = `${this.type}${this.name ? ' ' + this.name : ''}`;
    return `${header}${definitions}${fields}`;
  }

  private operationArguments(): string {
    return this.builder.variables.hasvariables() ? `(${this.builder.variables.definitions()})` : '';
  }

  private operationFields() {
    return ` {}`;
  }
}

export class GraphQLVariableBuilder {
  static of(): GraphQLVariableBuilder {
    return new GraphQLVariableBuilder();
  }

  definitionMap: Record<string, string[]> = {};
  container?: Record<string, any>;

  constructor() {}

  definitions(): string {
    return this.hasvariables() ? this.stringifyDefinitions(Object.values(this.definitionMap).flat()) : '';
  }

  variables(): Record<string, any> | undefined {
    return this.container ? this.sortVariables(this.container) : undefined;
  }

  hasvariables(): boolean {
    return !!Object.keys(this.definitionMap).length;
  }

  addVariables(name: string, variables: IVariable[]): this {
    this.addDefinitions(name, variables);

    this.container = {
      ...this.container,
      ...variables.reduce((con, obj) => {
        con[obj.name] = obj.value;
        return con;
      }, {} as Record<string, any>),
    };

    return this;
  }

  addDefinition(name: string, argument: IArgument | IVariable): this {
    this.definitionMap[name].push(this.buildDefinition(argument));

    return this;
  }

  addDefinitions(name: string, variables: IVariable[]): this {
    this.definitionMap[name] =
      name in this.definitionMap
        ? { ...this.definitionMap[name], ...this.buildDefinitions(variables) }
        : this.buildDefinitions(variables);

    return this;
  }

  private stringifyDefinitions(definitions: string[]): string {
    return this.sortDefinitions(definitions).join(', ');
  }

  private sortDefinitions(definitions: string[]): string[] {
    return definitions.sort((def1, def2) => def1.localeCompare(def2));
  }

  private sortVariables(variables: Record<string, any>): Record<string, any> {
    return Object.fromEntries(Object.entries(variables).sort(([key1], [key2]) => key1.localeCompare(key2)));
  }

  private buildDefinition(variable: IArgument | IVariable): string {
    if (Validator.isVariable(variable)) {
      return `$${variable.name}: ${variable.type}${variable.required ? '!' : ''}`;
    }

    const definitons = Object.entries(variable).map(([name, value]) => `$${name}: ${value}`);
    return this.stringifyDefinitions(definitons);
  }

  private buildDefinitions(variables: IVariable[]): string[] {
    return variables.map((variable) => this.buildDefinition(variable));
  }
}

export class GraphQLFieldBuilder {
  static of(): GraphQLFieldBuilder {
    return new GraphQLFieldBuilder();
  }

  constructor() {}
}

export class Validator {
  public static isVariable(argument: IArgument | IVariable): argument is IVariable {
    const variable = argument as IVariable;
    return variable.name && variable.type && typeof variable.required === 'boolean' && variable.value;
  }

  public static isSchema(object: unknown): object is Schema {
    return (object as Schema).name !== undefined && (object as Schema).fields !== undefined;
  }
}
