import { Grid, Box, VStack } from "@chakra-ui/layout";
import * as React from "react";
import { useMergedState } from "../util/mergedStatus";
import { Button, Input, Progress } from "@chakra-ui/react";
import EventEmitter from "../util/eventEmitter";
import { authToken, gql, graphcms } from "../api/api";

export type UploadImage = { file?: File; name?: string; type?: string };

interface ImageUploaderProps {
  images: UploadImage[];
}

export class ImageUploader extends EventEmitter<{
  progress: number;
  finish: string[];
  start: undefined;
  info: string;
}> {
  images: UploadImage[] = [];

  constructor({ images }: ImageUploaderProps) {
    super();

    this.images = images;
  }

  addImages(images: UploadImage[]) {
    this.images.push(...images);
  }

  async start() {
    this.emit("start", undefined);
    const ids: string[] = [];
    this.emit("info", "Starting upload process");
    for (let i = 0; i < this.images.length; i++) {
      const image = this.images[i];
      const result = await fetch(
        `https://www.filestackapi.com/api/store/S3?key=AuQyA92rKReqlwwiSMug5z`,
        {
          method: "POST",
          headers: {
            "Content-type": image.type as string,
          },
          body: image.file,
        }
      );
      this.emit(
        "info",
        `[${i * 2 + 1}/${this.images.length * 2}] Fetching images server`
      );
      const json = await result.json();
      this.emit("progress", ((i * 2 + 1) * 100) / (this.images.length * 2));

      const secondResult = await fetch(
        `https://api-sa-east-1.graphcms.com/v2/ckxqqwsze0lsf01xsh5xj3xgj/master/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `url=${encodeURIComponent(json.url)}`,
        }
      );

      this.emit(
        "info",
        `[${i * 2 + 2}/${this.images.length * 2}] Fetching graphcms server`
      );
      const { id } = await secondResult.json();

      ids.push(id);
      this.emit("progress", ((i * 2 + 2) * 100) / (this.images.length * 2));
    }

    this.emit("info", `Getting everything done`);
    const result = await graphcms.request(gql`
      mutation MyMutation {
        publishManyAssets(
          where: { id_in: [${ids.map((id) => `"${id}"`).join(",")}] }
        ) {
          count
        }
      }
    `);

    this.emit("finish", ids);
    return result;
  }
}

export type Image = UploadImage & HTMLImageElement;

function FilesInput(props: {
  onChange: (images: Image[]) => void;
  multiple?: boolean;
}) {
  return (
    <Input
      type="file"
      p={4}
      h={16}
      onChange={(ev: React.ChangeEvent<HTMLInputElement>) => {
        if (!ev.target.files) return;
        const images = [];

        for (let i = 0; i < ev.target.files.length; i++) {
          const img: Image = document.createElement("img");
          const url = URL.createObjectURL(ev.target.files[i]);
          img.onload = function () {
            URL.revokeObjectURL(url);
          };
          img.src = url;
          img.file = ev.target.files[i];
          img.type = ev.target.files[i].type;
          img.name = ev.target.files[i].name;
          images.push(img);
        }
        props.onChange(images);
      }}
      multiple={props.multiple === false ? undefined : true}
      accept="image/*"
    ></Input>
  );
}

export type AssetsUploaderControl = () => Promise<string[]>;

interface IUploadProps {
  getControl?: ({ start }: { start: AssetsUploaderControl }) => void;
  onChange: (ids: string[]) => void;
  onSelect?: (length: number) => void; // Just to get noticed about the event
  kind: "small" | "complete";
  multiple?: boolean;
}

interface UploadState {
  images: Image[];
  uploading?: boolean;
  progress?: number;
  eventEmitter: UploaderEmitter;
  currentUploadInfo?: string;
}

class UploaderEmitter extends EventEmitter<{
  upload: undefined;
  finish: string[];
}> {}

const AssetsUploader = React.forwardRef<HTMLDivElement, IUploadProps>(
  (props, ref) => {
    const { kind = "small" } = props;
    const [state, setState] = useMergedState<UploadState>({
      images: [],
      progress: 0,
      eventEmitter: new UploaderEmitter(),
    });

    React.useEffect(() => {
      props.getControl &&
        props.getControl({
          start: () => {
            state.eventEmitter.emit("upload", undefined);
            return new Promise<string[]>((resolve) => {
              state.eventEmitter.on("finish", (ids) => {
                resolve(ids);
              });
            });
          },
        });
    }, []);

    React.useEffect(() => {
      function handleEmit() {
        upload();
      }
      state.eventEmitter.on("upload", handleEmit);
      return () => state.eventEmitter.off("upload", handleEmit);
    });

    function upload() {
      const uploader = new ImageUploader({ images: state.images });
      uploader.on("start", () => {
        setState({
          uploading: true,
          progress: 0,
        });
      });
      uploader.on("info", (currentUploadInfo) => {
        setState({ currentUploadInfo });
      });
      uploader.on("progress", (progress) => {
        setState({ progress: Math.ceil(progress) });
      });
      uploader.on("finish", (ids) => {
        setState({ uploading: false, progress: 100 });
        state.eventEmitter.emit("finish", ids);
        props.onChange && props.onChange(ids);
      });

      uploader.start();
    }

    const OwnFilesInput = () => (
      <FilesInput
        multiple={props.multiple}
        onChange={(images) => {
          setState({ images });
          props.onSelect && props.onSelect(images.length);
        }}
      />
    );
    return kind === "small" ? (
      <Box ref={ref}>
        {state.images.length === 0 && <OwnFilesInput />}
        {state.images.length > 0 && !state.uploading && state.progress !== 100 && (
          <>
            {state.images.length} images.{" "}
            <Button onClick={upload} colorScheme="blue">
              Upload
            </Button>
            <Button
              onClick={() => {
                setState({ images: [] });
              }}
              ml={1}
            >
              Cancel
            </Button>
          </>
        )}
        {state.uploading && (
          <VStack>
            <Box textAlign="left" w="100%">
              {state.currentUploadInfo}
            </Box>
            <Progress h="15px" w="100%" value={state.progress} />
          </VStack>
        )}
        {!state.uploading && state.progress === 100 && "Upload complete"}
      </Box>
    ) : (
      <Box ref={ref} my={4} py={4}>
        <OwnFilesInput />
        {state.images.length > 0 && (
          <VStack p={4} mt={4} border="1px solid #ccc" borderRadius={6}>
            <Grid
              wrap="wrap"
              templateColumns="repeat(5, 1fr)"
              w="100%"
              gap={10}
            >
              {state.images.map((image) => (
                <img src={image.src} />
              ))}
            </Grid>
            {state.uploading && (
              <Progress h="30px" w="100%" value={state.progress} />
            )}
            <Button onClick={upload}>Upload</Button>
          </VStack>
        )}
      </Box>
    );
  }
);

export default AssetsUploader;
