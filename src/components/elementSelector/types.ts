import { Emitter } from '../../eventEmitter';
import { defaultConf } from './elementSelector';

export type PickerProps<Type> = {
  onChange: (value: Type) => void;
};

export type Picker<Type> = React.FunctionComponent<PickerProps<Type>>;

export type RendererProps<Type> = {
  value: Type;
};
export type Renderer<Type> = React.FunctionComponent<RendererProps<Type>>;

export type FieldDefinition<Type> = {
  required?: boolean;
  message?: string;
  picker?: Picker<Type> | 'self';
  renderer?: Renderer<Type>;
  validator?: (value: Type) => string | true;
};

export type Retriever<Type> = Emitter<{
  update: Type[];
}> & { data?: Type[] };

export type ObjectOf<T> = { [K in keyof T]: T[K] };

export type SelectionRendererProps<T> = {
  currentSelection: ObjectOf<T>[];
};

export type SelectionRenderer<T> = (props: SelectionRendererProps<T>) => React.ReactElement;
export type TypeMap = Record<string, any>;

// Creator
export type ElementCreatorProps<T> = {
  label: string;
  fields: { [K in keyof T]: FieldDefinition<T[K]> };
  onCreate: (element: {
    [K in keyof T]: T[K];
  }) => Promise<true | string>;
  retrieve: Retriever<{ [K in keyof T]: T[K] }>;
  selectionRenderer?: SelectionRenderer<T>;
  Key: string & keyof T;
  canCreate?: boolean;
  conf?: Partial<typeof defaultConf>;
};

export interface ElementCreatorStateInterface<T extends TypeMap> {
  errors?: string[];
  focusAssigned?: boolean;
  isLoading?: boolean;
  properties?: {
    [K in keyof T]?: T[K];
  };
}

export type IsMultipleDefinition<T> =
  | {
      onSelect: (element: ObjectOf<T>) => void;
      multiple: false;
      value?: { [K in keyof T]: T[K] } | null;
    }
  | {
      onSelect: (element: ObjectOf<T>[]) => void;
      multiple?: true;
      value?: { [K in keyof T]: T[K] }[] | null;
    };

export type ElementPickerProps<T> = IsMultipleDefinition<T> & {} & ElementCreatorProps<T>;

export type ElementPickerState<T> = {
  elements: ObjectOf<T>[];
  currentSelectedIndex: number;
  selectedItems: number[];
};
