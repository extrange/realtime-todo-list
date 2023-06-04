import {
  Accordion,
  Alert,
  Button,
  Code,
  Modal,
  ScrollArea,
  Stack,
} from "@mantine/core";
import { IconAlertCircle, IconAlertTriangle } from "@tabler/icons-react";
import { useState } from "react";
import { FallbackProps } from "react-error-boundary";
import { DebugTools } from "./DebugTools";

/**This component requires StoreProvider (due to debug tools) */
export const Fallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  // Don't render DebugTools by default, in case it is the source of app crashes.
  const [debug, setDebug] = useState(false);

  return (
    <Modal opened onClose={() => void 0} withCloseButton={false} size="xl">
      <Alert
        icon={<IconAlertCircle />}
        title="Oops, encountered an error"
        color="red"
      >
        <Code block sx={{ whiteSpace: "pre-wrap" }}>
          {error.message}
        </Code>
      </Alert>

      <Accordion>
        <Accordion.Item value="stacktrace">
          <Accordion.Control>Stack Trace</Accordion.Control>
          <Accordion.Panel>
            <ScrollArea h={300}>
              <Code block sx={{ whiteSpace: "pre-wrap" }}>
                {error.stack}
              </Code>
            </ScrollArea>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="debugging">
          <Accordion.Control>Debugging</Accordion.Control>
          <Accordion.Panel>
            <Stack>
              <Button variant="subtle" onClick={resetErrorBoundary}>
                Reset Error Boundary
              </Button>
              {!debug && (
                <Button
                  leftIcon={<IconAlertTriangle />}
                  variant="subtle"
                  onClick={() => setDebug(true)}
                  color={"yellow"}
                >
                  Enable debugging tools (dangerous!)
                </Button>
              )}
              {debug && <DebugTools />}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Modal>
  );
};
