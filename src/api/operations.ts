import { gql } from "graphql-request";
import { graphcms } from "./api";

interface Expense {
  id: string;
  date: string | Date;
  concept: string;
  amount: number;
  image?: string;
  author: string;
}
interface Income {
  id: string;
  amount: number;
  concept: string;
  author: string;
  createdAt: Date;
}

const expenseMutations = {
  create: async function (data: Omit<Expense, "id">) {
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
          author: data.author,
          ...(data.image
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
  create: async function (data: Omit<Income, "id" | "createdAt">) {
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
    async all(
      { skip, first, orderBy }: QueryParameters<ExpensesOrder> = {
        skip: 0,
        orderBy: "date_DESC",
        first: 10,
      }
    ): Promise<(Omit<Expense, "date"> & { date: Date })[]> {
      const {
        expenses,
      }: {
        expenses: (Omit<Expense, "image"> & { image?: { url: string } })[];
      } = await graphcms.request(gql`
        query {
          expenses(skip: ${skip}, orderBy: ${orderBy}, first: ${first}) {
            id
            concept
            amount
						date
            author
            image {
              url
            }
          }
        }
      `);

      return expenses.map((expense) => ({
        author: expense.author,
        id: expense.id,
        concept: expense.concept,
        amount: expense.amount,
        image: expense.image ? expense.image.url : undefined,
        date: new Date(expense.date),
      }));
    },
  },
  incomes: {
    async all(
      { skip, first, orderBy }: QueryParameters<IncomeOrder> = {
        skip: 0,
        orderBy: "createdAt_DESC",
        first: 10,
      }
    ): Promise<(Omit<Income, "createdAt"> & { date: Date })[]> {
      const {
        incomes,
      }: {
        incomes: Income[];
      } = await graphcms.request(gql`
        query {
          incomes(skip: ${skip}, orderBy: ${orderBy}, first: ${first}) {
            id
            concept
            amount
						createdAt
            author
          }
        }
      `);

      return incomes.map((income) => ({
        author: income.author,
        id: income.id,
        concept: income.concept,
        amount: income.amount,
        date: new Date(income.createdAt),
      }));
    },
  },
};
