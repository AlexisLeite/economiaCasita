import { Box, Button, HStack, Link } from "@chakra-ui/react";
import { CSSObject } from "@emotion/react";
import NextLink from "next/link";
import React, { ReactElement } from "react";
import { useLoginContext } from "../../../pages/_app";

interface Props {}

export default function Nav({}: Props): ReactElement | null {
  const { logout, author } = useLoginContext();

  const linksSx: CSSObject = {
    border: "1px solid black",
    borderTop: "none",
    borderBottomLeftRadius: "4px",
    borderBottomRightRadius: "4px",
    padding: "5px 15px",
    ":hover": {
      background: "#fffffa",
    },
  };

  return author ? (
    <HStack
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 2,
        mb: 8,
      }}
    >
      <NextLink passHref href="/">
        <Link sx={linksSx}>Transacciones</Link>
      </NextLink>
      <NextLink passHref href="/history">
        <Link sx={linksSx}>Historial</Link>
      </NextLink>
      <Button
        sx={{ display: "inline-block", ml: 1 }}
        size="sm"
        onClick={() => logout()}
      >
        Salir
      </Button>
    </HStack>
  ) : null;
}
