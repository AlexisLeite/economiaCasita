import { Button } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalCloseButton,
} from "@chakra-ui/modal";
import { Table, Tbody, Td, Tfoot, Th, Thead, Tr } from "@chakra-ui/table";
import * as React from "react";
import { useMergedState } from "../../util/mergedStatus";
import Key from "../../util/key";
import { Unsuscribe } from "../../util/suscribers";
import {
  ElementCreatorProps,
  ElementPickerProps,
  ElementPickerState,
  IsMultipleDefinition,
  ObjectOf,
  Retriever,
  SelectionRenderer,
  SelectionRendererProps,
  TypeMap,
} from "./types";
import { ElementCreator } from "./elementCreator";
import { Box } from "@chakra-ui/react";
import {
  focusNextElement,
  focusPreviousElement,
} from "../../util/focusControl";

/*
 
Tasks to acomplish:

- Show the current items
  - Structure
  - Retriever function
    - The retriever function must implement a data emitter interface, in order to be always updated with the information
      - on: callback
      - off: callback

- Create new items
  - Structure
  - Creator function

- Select multiple elements at once
- Use arrows to navigate and enter to select
- Accept properties to customize the colors, etc
- Mark the selected options different

********************** EVERYTHING DONE UNTIL NOW

What follows:

- Accept a value property in order to control the component

*/

// This renderer will be used when no other renderer is supplied
function DefaultRenderer<T>({ currentSelection }: SelectionRendererProps<T>) {
  return (
    <>{currentSelection.map((element) => JSON.stringify(element)).join(", ")}</>
  );
}

export const defaultConf = {
  noItemsLabel: "There are no items available",
  selectedColor: "#fafaff",
  highlightColor: "#f8f8ff",
};

// The picker
export function Picker<T extends TypeMap>(props: ElementPickerProps<T>) {
  const SelectionRenderer = props.selectionRenderer ?? DefaultRenderer;
  const conf = Object.assign({}, defaultConf, props.conf ?? {});
  const [state, setState] = useMergedState<ElementPickerState<T>>({
    elements: (props.retrieve && props.retrieve.data) ?? [],
    currentSelectedIndex: 0,
    selectedItems: [],
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const ref = React.useRef<HTMLAnchorElement>(null);
  const finalFocusRef = React.useRef();

  // This function selects an element by its position in the array of elements
  function selectItem(id: number) {
    if (props.multiple === false) {
      props.onSelect(state.elements[id]);
      setState({ selectedItems: [id] });
      onClose();
    } else {
      const index = state.selectedItems.indexOf(id);
      let selectedItems: typeof state.selectedItems;
      if (index === -1) {
        selectedItems = [...state.selectedItems, id];
      } else {
        state.selectedItems.splice(index, 1);
        selectedItems = [...state.selectedItems];
      }
      props.onSelect(
        state.elements.filter((el, i) => selectedItems.indexOf(i) !== -1)
      );
      setState({ selectedItems });
    }
  }

  // Control the selector with the keys up and down and update the items in the list
  React.useEffect(() => {
    function handleUpdates(elements: ObjectOf<T>[]) {
      const currentSelectedIndex =
        state.currentSelectedIndex > elements.length - 1
          ? elements.length - 1
          : state.currentSelectedIndex;
      setState({ elements, currentSelectedIndex });
    }
    props.retrieve.on("update", handleUpdates);

    const unsuscribers = [() => props.retrieve.off("update", handleUpdates)];

    if (isOpen) {
      unsuscribers.push(
        Key.down("arrowup", () => {
          focusPreviousElement((element) => {
            return element.tagName === "TABLE";
          });
        }),
        Key.down("arrowdown", () => {
          focusNextElement((element) => element.tagName === "TABLE");
        })
      );
    }

    return Unsuscribe(...unsuscribers);
  }, [state, isOpen]);

  // Set the focus when the modal is opened or when the focus changes
  React.useEffect(() => {
    if (isOpen) setTimeout(() => ref.current?.focus(), 10);
  }, [state.currentSelectedIndex, isOpen]);

  // Change the current selected items when the props.value changes
  React.useEffect(() => {
    if (props.value === null) {
      setState({ selectedItems: [] });
    } else if (props.value) {
      // If the object is not an object, there is no problem, we compare it directly
      let value = (Array.isArray(props.value) ? props.value : [props.value])
        .map((el) => {
          for (let i = 0; i < state.elements.length; i++) {
            if (state.elements[i][props.Key] === el[props.Key]) return i;
          }
          return -1;
        })
        .filter((el) => el >= 0);

      setState({ selectedItems: value });
    }
  }, [props.value, state.elements, props.Key]);

  return (
    <>
      <Box>
        {state.selectedItems.length > 0 && (
          <SelectionRenderer
            currentSelection={state.elements.filter(
              (el, i) => state.selectedItems.indexOf(i) !== -1
            )}
          />
        )}
      </Box>
      <Button onClick={onOpen} ref={finalFocusRef as any}>
        Select {props.label}
      </Button>
      <Modal
        finalFocusRef={finalFocusRef as any}
        isCentered
        size="xl"
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent maxW="90vw" overflowX="auto">
          <ModalCloseButton />
          <ModalHeader>Select {props.label}</ModalHeader>
          <ModalBody>
            {state.elements.length === 0 ? (
              conf.noItemsLabel
            ) : (
              <Table>
                <Thead>
                  <Tr>
                    {Object.keys(props.fields).map((field) => (
                      <Th key={field}>{field}</Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {state.elements.map((element, i) => (
                    <Tr
                      background={
                        state.selectedItems.indexOf(i) !== -1
                          ? conf.selectedColor
                          : undefined
                      }
                      key={i}
                      _hover={{
                        background: conf.highlightColor,
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        selectItem(i);
                      }}
                    >
                      {Object.keys(props.fields).map((field, fieldIndex) => {
                        let value: string | JSX.Element = element[field];
                        if (props.fields[field].renderer !== undefined) {
                          const Renderer: any = props.fields[field].renderer;
                          value = <Renderer value={value} />;
                        }

                        const refObject =
                          i === state.currentSelectedIndex && 0 === fieldIndex
                            ? { ref }
                            : {};

                        return (
                          <Td key={fieldIndex}>
                            <a
                              title={field}
                              tabIndex={fieldIndex === 0 ? 1 : undefined}
                              {...refObject}
                              onKeyPress={(ev) => {
                                if (ev.key === "Enter" || ev.key === " ")
                                  selectItem(i);
                              }}
                            >
                              {value}
                            </a>
                          </Td>
                        );
                      })}
                    </Tr>
                  ))}
                </Tbody>
                <Tfoot></Tfoot>
              </Table>
            )}
          </ModalBody>
          <ModalFooter>
            {props.canCreate !== false && <ElementCreator {...props} />}{" "}
            <Button ml={2} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
