import { Button, Container, Heading, VStack, Input } from "@chakra-ui/react";
import React, { ReactElement } from "react";
import { useLoginContext } from "../../../pages/_app";

interface Props {}

export default function Login({}: Props): ReactElement {
  const [error, setError] = React.useState<string | undefined>();
  const { login } = useLoginContext();

  return (
    <Container
      maxW="container.sm"
      sx={{
        display: "flex",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <form
        onSubmit={(ev) => {
          ev.preventDefault();
          const author = (
            document.getElementById("NameLogin") as HTMLInputElement
          ).value.toLowerCase();
          if (!login(author)) {
            setError("Usuario incorrecto");
          }
        }}
      >
        <VStack gap={2}>
          <Input id="NameLogin" placeholder="Nombre" />
          {error && (
            <Heading size="sm" color="red" textAlign="left">
              {error}
            </Heading>
          )}
          <Button type="submit">Ingresar</Button>
        </VStack>
      </form>
    </Container>
  );
}
