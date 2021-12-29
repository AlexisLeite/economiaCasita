/* eslint-disable react/display-name */
import {
  Alert,
  AlertIcon,
  Button,
  Heading,
  Input,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Table,
  Tbody,
  Td,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import React from "react";
import Key from "../../utils/key";
import { useMergedState } from "../../utils/mergedStatus";
import { Unsuscribe } from "../../utils/suscribers";
import { Picker } from "./elementSelector";
import { ElementCreatorProps, ElementCreatorStateInterface } from "./types";

export function ElementCreator<T>(props: ElementCreatorProps<T>) {
  const [state, setState, replaceState] = useMergedState<
    ElementCreatorStateInterface<T>
  >({
    focusAssigned: false,
    properties: {},
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const ref = React.useRef<HTMLInputElement>(null);

  const submit = async () => {
    let errors = [];
    for (let key of Object.keys(props.fields)) {
      if (!(key in state) && props.fields[key as keyof T].required === true) {
        errors.push(
          props.fields[key as keyof T].message || `${key} was not supplied.`
        );
      } else if (props.fields[key as keyof T].validator) {
        const value = (state as any)[key];
        const validation = props.fields[key as keyof T].validator!(value);
        if (validation !== true) {
          errors.push(validation);
        }
      }
    }
    if (errors.length > 0) {
      setState({ errors });
      return;
    }

    delete state["errors"];

    setState({ isLoading: true });

    const { isLoading, focusAssigned, ...elementFields } = state;
    const result = await props.onCreate(elementFields as any);
    if (result === true) {
      replaceState({});
      onClose();
    } else {
      setState({
        errors: [result],
      });
    }
    setState({ isLoading: false });
  };

  React.useEffect(() => {
    if (isOpen) {
      if (!state.focusAssigned) {
        setState({ focusAssigned: true });
        setTimeout(() => {
          ref.current?.focus();
        }, 10);
      }
    }
  });

  React.useEffect(() => {
    if (!isOpen) {
      setState({ focusAssigned: false });
    } else {
    }
  }, [isOpen, setState]);

  React.createElement;

  return isOpen ? (
    <Modal isCentered isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form
          action=""
          onSubmit={(ev) => {
            console.log("submit");
            ev.preventDefault();
            submit();
          }}
        >
          <ModalCloseButton />
          <ModalHeader>Create {props.label}</ModalHeader>
          <ModalBody>
            <Table>
              <Tbody>
                {state.errors &&
                  Array.isArray(state.errors) &&
                  state.errors.length > 0 && (
                    <Tr>
                      <Td>
                        <Alert status="error" mb={2}>
                          <AlertIcon />
                          <List>
                            {state.errors.map((error) => (
                              <ListItem key={error}>{error}</ListItem>
                            ))}
                          </List>
                        </Alert>
                      </Td>
                    </Tr>
                  )}

                {Object.keys(props.fields).map((key, i) => {
                  const refObject = i === 0 ? { ref } : {};
                  let element;
                  if (props.fields[key as keyof T].picker) {
                    let CurrentPicker = props.fields[key as keyof T].picker!;

                    if (CurrentPicker === "self") {
                      CurrentPicker = (props: any) => (
                        <Picker {...props} canCreate={false} />
                      );
                    }

                    element = (
                      <CurrentPicker
                        {...props}
                        {...refObject}
                        onChange={(ev) => setState({ [key]: ev })}
                      />
                    );
                  } else
                    element = (
                      <Input
                        {...(refObject as any)}
                        onChange={(ev) =>
                          setState({ [key]: ev.target.value } as any)
                        }
                      />
                    );

                  return (
                    <Tr key={key}>
                      <Td>
                        <Heading size="xs" mb={1}>
                          {key.toUpperCase()}
                        </Heading>
                        {element}
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              onClick={submit}
              ml={2}
              isLoading={state.isLoading}
            >
              Create
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  ) : (
    <Button colorScheme="blue" onClick={onOpen}>
      Create {props.label}
    </Button>
  );
}
