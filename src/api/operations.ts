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
    const total = await query.total();
    mutate.total.update(total - data.amount);

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
    const total = await query.total();
    mutate.total.update(total + data.amount);

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

const totalMutations = {
  update: async (newTotal: number) => {
    await graphcms.request(gql`
      mutation {
        updateTotal(
          data: { total: ${newTotal} }
          where: { id: "cky6c8n480y5z0b77o0roxb22" }
        ) {
          id
        }
      }
    `);

    graphcms.request(gql`
      mutation {
        publishTotal(
          to: PUBLISHED
          where: { id: "cky6c8n480y5z0b77o0roxb22" }
        ) {
          id
        }
      }
    `);
  },
};

export const mutate = {
  expenses: expenseMutations,
  incomes: incomeMutations,
  total: totalMutations,
};

interface QueryParameters<OrderEnum> {
  skip?: number;
  orderBy?: OrderEnum;
  first?: number;
  where?: string;
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

const defaultQueryParameters = {
  skip: 0,
  orderBy: "date_DESC",
  first: 0,
};

export const query = {
  expenses: {
    async all(
      parameters?: QueryParameters<ExpensesOrder>
    ): Promise<(Omit<Expense, "date"> & { date: Date })[]> {
      const { skip, first, orderBy, where } = Object.assign(
        {},
        defaultQueryParameters,
        parameters
      );
      const firstString = `${first > 0 ? `, first: ${first.toString()}` : ""}`;
      const whereString = where ? `, where: {${where}}` : "";

      const {
        expenses,
      }: {
        expenses: (Omit<Expense, "image"> & { image?: { url: string } })[];
      } = await graphcms.request(gql`
        query {
          expenses(skip: ${skip}, orderBy: ${orderBy} ${firstString} ${whereString}) {
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
      parameters?: QueryParameters<IncomeOrder>
    ): Promise<(Omit<Income, "createdAt"> & { date: Date })[]> {
      const { skip, first, orderBy, where } = Object.assign(
        {},
        defaultQueryParameters,
        { orderBy: "createdAt_DESC" },
        parameters
      );
      const firstString = `${first > 0 ? `, first: ${first.toString()}` : ""}`;
      const whereString = where ? `, where: {${where}}` : "";

      const {
        incomes,
      }: {
        incomes: Income[];
      } = await graphcms.request(gql`
        query {
          incomes(skip: ${skip}, orderBy: ${orderBy} ${firstString} ${whereString}) {
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
  total: async () => {
    const {
      total: { total },
    } = await graphcms.request(gql`
      query {
        total(where: { id: "cky6c8n480y5z0b77o0roxb22" }) {
          total
        }
      }
    `);

    return total as number;
  },
};
