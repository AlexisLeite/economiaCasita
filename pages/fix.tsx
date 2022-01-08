import type { NextPage } from "next";
import React from "react";
import { mutate, query } from "../src/api/operations";

const Home: NextPage = () => {
  const [fixed, setFixed] = React.useState(false);
  React.useEffect(() => {
    async function fix() {
      const expenses = await query.expenses.all();
      const incomes = await query.incomes.all();

      const newTotal = [
        ...expenses.map((expense) => ({ kind: "Expense", ...expense })),
        ...incomes.map((income) => ({ kind: "Income", ...income })),
      ].reduce((total, operation) => {
        if (operation.kind === "Expense") {
          return total - operation.amount;
        }
        return total + operation.amount;
      }, 0);

      console.log({ expenses, incomes, newTotal });

      await mutate.total.update(newTotal);

      setFixed(true);
    }
    fix();
  }, []);
  return <>{fixed ? "Ready" : "Fixing"}</>;
};

export default Home;
