import { gql } from "graphql-request";
import { graphcms } from "./api";

interface Expense {
  date: string;
  concept: string;
  amount: number;
  image?: string;
}
interface Income {
  amount: number;
  concept: string;
}

const expenseMutations = {
  create: async function (data: Expense) {
    const {
      createExpense: { id },
    } = await graphcms.request(
      gql`
        mutation MyMutation($data: ExpenseCreateInput!) {
          createExpense(data: $data) {
            id
          }
        }
      `,
      {
        data: {
          concept: data.concept,
          amount: data.amount,
          date: data.date,
          ...(data.date
            ? {
                image: {
                  connect: {
                    id: data.image,
                  },
                },
              }
            : {}),
        },
      }
    );

    await graphcms.request(gql`
      mutation {
        publishExpense(to: PUBLISHED, where: {id:"${id}"}) {
          id
        }
      } 
    `);

    return { id };
  },
};

const incomeMutations = {
  create: async function (data: Income) {
    const {
      createIncome: { id },
    } = await graphcms.request(
      gql`
        mutation MyMutation($data: IncomeCreateInput!) {
          createIncome(data: $data) {
            id
          }
        }
      `,
      {
        data,
      }
    );

    await graphcms.request(gql`
      mutation {
        publishIncome(to: PUBLISHED, where: {id:"${id}"}) {
          id
        }
      } 
    `);

    return { id };
  },
};

export const mutate = {
  expenses: expenseMutations,
  incomes: incomeMutations,
};

interface QueryParameters<OrderEnum> {
  skip: number;
  orderBy: OrderEnum;
  first: number;
}
type ExpensesOrder =
  | "id_ASC"
  | "id_DESC"
  | "createdAt_ASC"
  | "createdAt_DESC"
  | "updatedAt_ASC"
  | "updatedAt_DESC"
  | "publishedAt_ASC"
  | "publishedAt_DESC"
  | "concept_ASC"
  | "concept_DESC"
  | "amount_ASC"
  | "amount_DESC"
  | "date_ASC"
  | "date_DESC";
type IncomeOrder =
  | "id_ASC"
  | "id_DESC"
  | "createdAt_ASC"
  | "createdAt_DESC"
  | "updatedAt_ASC"
  | "updatedAt_DESC"
  | "publishedAt_ASC"
  | "publishedAt_DESC"
  | "amount_ASC"
  | "amount_DESC"
  | "concept_ASC"
  | "concept_DESC";
export const query = {
  expenses: {
    async all({
      skip = 0,
      orderBy = "date_DESC",
      first = 10,
    }: QueryParameters<ExpensesOrder>): Promise<{
      id: string;
      concept: string;
      amount: number;
      image: string;
      date: Date;
    }> {
      const {
        id,
        concept,
        date,
        amount,
        image: { url: image },
      } = await graphcms.request(gql`
        query {
          expenses(skip: ${skip}, orderBy: ${orderBy}, first: ${first}) {
            id
            concept
            amount
						date
            image {
              url
            }
          }
        }
      `);

      return {
        id,
        concept,
        amount: parseInt(amount),
        image,
        date: new Date(date),
      };
    },
  },
  incomes: {
    async all({
      skip = 0,
      orderBy = "createdAt_DESC",
      first = 10,
    }: QueryParameters<IncomeOrder>): Promise<{
      id: string;
      concept: string;
      amount: number;
      date: Date;
    }> {
      const {
        id,
        concept,
        amount,
        createdAt: date,
      } = await graphcms.request(gql`
        query {
          incomes(skip: ${skip}, orderBy: ${orderBy}, first: ${first}) {
            id
            concept
            amount
						createdAt
          }
        }
      `);

      return { id, concept, amount: parseInt(amount), date: new Date(date) };
    },
  },
};
