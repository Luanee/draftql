import { IQuery, QueryType } from './src';
import { GraphQLRequestBuilder, buildGraphQLQuery } from './src/helper/parser';

const customersQuery: IQuery = {
  type: QueryType.QUERY,
  name: 'GetCustomers',
  operations: {
    name: 'customers',
    args: {
      offset: 0,
      sort: { name: 'asc' },
    },
    fields: [
      {
        name: 'results',
        fields: [
          'id',
          'key',
          'name',
          {
            name: 'custom',
            args: {
              includeNames: ['custom1', 'custom2'],
            },
            fields: ['name', 'value'],
          },
        ],
      },
    ],
    variables: [
      {
        name: 'where',
        type: 'String',
        value: 'd',
        required: false,
      },
      {
        name: 'storeKey',
        type: 'String',
        value: 'DE',
        required: true,
      },
      {
        name: 'limit',
        type: 'Long',
        value: 1,
        required: true,
      },
    ],
  },
};

const updateProductMutation: IQuery = {
  type: QueryType.MUTATION,
  name: 'AddProductVariant',
  operations: {
    name: 'updateProduct',
    args: {
      version: 1,
      id: {
        name: 'id',
        type: 'String',
        value: 'ID',
        required: true,
      },
      actions: {
        name: 'actions',
        type: 'Actions',
        value: [
          {
            addVariant: {
              sku: 'myProductVariantSKU',
              key: 'my-product-variant-key',
              staged: false,
            },
          },
        ],
        required: true,
      },
    },
    fields: [
      'id',
      'version',
      {
        name: 'masterData',
        fields: [
          {
            name: 'current',
            fields: [
              {
                name: 'allVariants',
                fields: ['key', 'sku'],
              },
            ],
          },
        ],
      },
    ],
  },
};

function logGraphQLRequest(graphql: IQuery) {
  const { query, variables } = GraphQLRequestBuilder.of(graphql).build();
  console.log(query);
  console.log(variables);
  console.log('----------------');
}

logGraphQLRequest(customersQuery);
logGraphQLRequest(updateProductMutation);
