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
import { lazy, useState } from "react";
import { FallbackProps } from "react-error-boundary";
import classes from "./Fallback.module.css";

type InputProps = {
	/**Whether to use DebugTools (will require StoreProvider to supply
	 * context higher up in the tree) */
	withDebugTools?: boolean;
};

const DebugTools = lazy(() => import("./DebugTools"));

const FallbackBase = ({
	error,
	resetErrorBoundary,
	withDebugTools,
}: FallbackProps & InputProps) => {
	// Don't render DebugTools by default, in case it is the source of app crashes.
	const [debug, setDebug] = useState(false);
	return (
		<Modal opened onClose={() => void 0} withCloseButton={false} size="xl">
			<Alert
				icon={<IconAlertCircle />}
				title="Oops, encountered an error"
				color="red"
			>
				<Code block className={classes.code}>
					{error.message}
				</Code>
			</Alert>

			<Accordion>
				<Accordion.Item value="stacktrace">
					<Accordion.Control>Stack Trace</Accordion.Control>
					<Accordion.Panel>
						<ScrollArea h={300}>
							<Code block className={classes.code}>
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
							{withDebugTools && !debug && (
								<Button
									leftSection={<IconAlertTriangle />}
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

export const Fallback = (props: FallbackProps) => {
	return <FallbackBase withDebugTools {...props} />;
};

export const FallbackWithoutDebugTools = (props: FallbackProps) => (
	<FallbackBase {...props} />
);
