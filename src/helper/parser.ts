import { Schema, IQuery, IVariable, QueryType, isQueryType, IArgument, Primitive } from '../types';
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
  elements: string[] = [];
  variables?: Record<string, any>;

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

  build(options: { pretty: boolean } = { pretty: false }): {
    query: string;
    variables: Record<string, any> | undefined;
  } {
    if (!isQueryType(this.type)) {
      throw Error(`Query type must be one of: ${Object.values(QueryType).join(', ')}`);
    }
    this.buildV2(this.operations);
    console.log(this.elements);
    return {
      query: this.operation(this.operationFields(), this.operationArguments()),
      variables: this.builder.variables.variables(),
    };
  }

  buildV2(operations: Schema[], variables?: Record<string, any>) {
    operations.forEach((operation) => {
      this.elements.push(operation.name);
      if (operation.variables && operation.variables.length) {
        if (!this.variables) {
          this.variables = {};
        }

        this.builder.variables.addVariables(operation.name, operation.variables);

        console.log('variables', this.builder.variables.variables());
        // this.variables = { ...this.variables, ...this.builder.variables.variables() };
      }

      if (operation.args && Object.keys(operation.args).length) {
        if (!this.variables) {
          this.variables = {};
        }

        const argsAndVariables = Object.keys(operation.args).map((key) => {
          return operation.args![key];
        });

        const variables = argsAndVariables.filter(Validator.isVariable);
        const args = argsAndVariables.filter((arg) => !Validator.isVariable(arg));

        if (variables.length) {
          this.builder.variables.addVariables(operation.name, variables);
          console.log('args', variables);
          // this.variables = { ...this.variables, ...this.builder.variables.variables() };
        }

        if (args.length) {
          this.builder.variables.addDefinitions(operation.name, args);
          console.log('args', args);
          // this.variables = { ...this.variables, ...this.builder.variables.variables() };
        }
      }

      if (this.builder.variables.hasDefinitions(operation.name)) {
        this.elements.push(this.builder.variables.getDefinitions(operation.name));
      }

      this.elements.push('{');
      if (operation.fields.length) {
        operation.fields.forEach((field) => {
          if (Validator.isSchema(field)) {
            this.buildV2([field], variables);
          } else {
            this.elements.push(field);
          }
        });
      }
    });

    this.elements.push('}');
  }

  private operation(fields: string, definitions: string): string {
    const header = `${this.type}${this.name ? ' ' + this.name : ''}`;
    return `${header}${definitions}${fields}`;
  }

  private operationArguments(): string {
    return this.builder.variables.hasDefinitions() ? `(${this.builder.variables.definitions()})` : '';
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
  container: Record<string, Record<string, any>> = {};

  constructor() {}

  definitions(): string {
    return this.hasDefinitions() ? this.stringifyDefinitions(Object.values(this.definitionMap).flat()) : '';
  }

  variables(): Record<string, any> | undefined {
    return this.container ? this.sortVariables(this.container) : undefined;
  }

  hasDefinitions(name?: string): boolean {
    if (!name) {
      return !!Object.keys(this.definitionMap).length;
    }

    return !!(name in this.definitionMap);
  }

  getDefinitions(name?: string): string {
    if (!this.hasDefinitions(name)) {
      return '';
    }

    const definitions = !name ? Object.values(this.definitionMap).flat() : this.definitionMap[name];

    return `(${this.stringifyDefinitions(definitions)})`;
  }

  getVariables(name: string): Record<string, any> {
    if (!this.container || !(name in this.container)) {
      return {};
    }
    return this.sortVariables(this.container)[name];
  }

  addVariables(name: string, variables: IVariable[]): this {
    this.addDefinitions(name, variables);

    if (!(name in this.container)) {
      this.container[name] = {};
    }

    this.container[name] = {
      ...this.container[name],
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

  private buildDefinitions(variables: IArguments | IVariable[]): string[] {
    if (Array.isArray(variables)) {
      return variables.map((variable) => this.buildDefinition(variable));
    }

    return Object.entries(variables).map(([name, value]) => this.buildDefinition({ name, value }));
  }

  private buildDefinition(variable: { name: string; value: any } | IVariable): string {
    if (Validator.isVariable(variable)) {
      return `$${variable.name}: ${variable.type}${variable.required ? '!' : ''}`;
    }
    return `${variable.name}: ${variable.value}`;
    // const definitions = Object.entries(variable).map(([name, value]) => `$${name}: ${value}`);
    // return this.stringifyDefinitions(definitions);
  }
}

export class GraphQLFieldBuilder {
  static of(): GraphQLFieldBuilder {
    return new GraphQLFieldBuilder();
  }

  constructor() {}
}

export class Validator {
  public static isVariable(argument: unknown): argument is IVariable {
    const variable = argument as IVariable;
    return variable.name && variable.type && typeof variable.required === 'boolean' && variable.value;
  }

  public static isSchema(object: unknown): object is Schema {
    return (object as Schema).name !== undefined && (object as Schema).fields !== undefined;
  }
}
