import "../styles/globals.css";
import type { AppProps } from "next/app";
import {
  Button,
  ChakraProvider,
  Container,
  Heading,
  HStack,
  Input,
} from "@chakra-ui/react";
import Nav from "../src/components/common/nav";
import React from "react";
import Login from "../src/components/common/login";

interface ILoginContext {
  author: string;
  login: (author: string) => boolean;
  logout: () => void;
}

const LoginContext = React.createContext<ILoginContext | undefined>(undefined);

export function useLoginContext() {
  const context = React.useContext(LoginContext);
  if (!context)
    throw new Error(
      "The login context must be called within a login context provider"
    );

  return context;
}

function MyApp({ Component, pageProps }: AppProps) {
  const [author, setAuthor] = React.useState<string | null | undefined>();

  React.useEffect(() => {
    const author = localStorage.getItem("author");
    if (author) setAuthor(author);
  }, []);

  return (
    <ChakraProvider>
      <LoginContext.Provider
        value={{
          author: typeof author === "string" ? author : "",
          login: (author: string) => {
            if (["alexis", "valeria"].indexOf(author) !== -1) {
              localStorage.setItem("author", author);
              setAuthor(author);
              return true;
            } else {
              return false;
            }
          },
          logout: () => {
            localStorage.removeItem("author");
            setAuthor(null);
          },
        }}
      >
        {author ? (
          <>
            <Nav />
            <Component {...pageProps} />
          </>
        ) : (
          <Login />
        )}
      </LoginContext.Provider>
    </ChakraProvider>
  );
}

export default MyApp;
