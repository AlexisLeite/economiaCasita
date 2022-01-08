import { Box, Container, Heading, HStack } from "@chakra-ui/react";
import React, { ReactElement } from "react";
import { query } from "../src/api/operations";

interface Props {}

export default function History({}: Props): ReactElement {
  const [state, setState] = React.useState<{
    history: (
      | {
          id: string;
          date: Date;
          concept: string;
          amount: number;
          image?: string | undefined;
          author: string;
          kind: string;
        }
      | {
          id: string;
          concept: string;
          amount: number;
          author: string;
          date: Date;
          kind: string;
        }
    )[];
    total: number;
  }>();

  React.useEffect(() => {
    async function fetch() {
      const expenses = await query.expenses.all({
        where: `createdAt_gte: "${new Date(
          Date.now() - 1000 * 60 * 60 * 24 * 5
        ).toISOString()}"`,
      });
      const incomes = await query.incomes.all({
        where: `createdAt_gte: "${new Date(
          Date.now() - 1000 * 60 * 60 * 24 * 5
        ).toISOString()}"`,
      });
      const history = [
        ...expenses.map((expense) => ({ kind: "Expense", ...expense })),
        ...incomes.map((income) => ({ kind: "Income", ...income })),
      ].sort((a, b) => (a.date < b.date ? 1 : -1));
      const total = await query.total();
      setState({ history, total });
    }
    fetch();
  }, []);

  if (!state?.history)
    return (
      <Container maxW="container.sm">
        <Heading size="md">Cargando...</Heading>
      </Container>
    );

  const { history, total } = state;

  return (
    <Container maxW="container.sm">
      {history && history.length === 0 && (
        <Heading size="md">No hay nada para mostrar</Heading>
      )}
      {history &&
        history.length > 0 &&
        history.map((transaction) => {
          const sx =
            transaction.concept === "Redondeo"
              ? { background: "red", padding: 2, color: "white" }
              : {};
          return (
            <HStack key={transaction.id}>
              <Heading
                size="md"
                flexBasis="100%"
                textAlign={transaction.kind === "Expense" ? "right" : "left"}
                sx={sx}
              >
                <Box as="span" sx={{ color: "#4ab44a" }}>
                  [{transaction.author.charAt(0).toUpperCase()}]
                </Box>
                <Box as="span" sx={{ color: "#b73cca", mr: 4 }}>
                  [
                  {transaction.date.toLocaleDateString("es-LA", {
                    year: "numeric",
                    month: "numeric",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                  })}
                  ]
                </Box>
                {transaction.concept}
              </Heading>
              <Heading
                size="lg"
                flexBasis="130px"
                flexShrink="0"
                textAlign="right"
              >
                <Box
                  as="span"
                  sx={{
                    color: transaction.kind === "Income" ? "green" : "red",
                  }}
                >
                  {transaction.amount}
                </Box>
              </Heading>
            </HStack>
          );
        })}
      <Heading
        size="lg"
        sx={{
          display: "flex",
          justifyContent: "end",
          mt: 10,
        }}
      >
        Total: {total}
      </Heading>
    </Container>
  );
}
