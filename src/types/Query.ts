import { IOperation } from './Operation';

export enum QueryType {
  QUERY = 'query',
  MUTATION = 'mutation',
}

// export interface IQuery {
//     [QueryType.QUERY]?: IOperation
//     [QueryType.MUTATION]?: IOperation
// };

export interface IQuery {
  type: QueryType;
  name?: string;
  query: IOperation | IOperation[];
}
// export type IQuery = Record<QueryType, IOperation>
