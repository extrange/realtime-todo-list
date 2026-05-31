import {
	ActionIcon,
	Button,
	Center,
	Group,
	JsonInput,
	Loader,
	Modal,
	Progress,
	Stack,
	Text,
	Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconFile, IconX } from "@tabler/icons-react";
import type React from "react";
import { useCallback, useId, useRef, useState } from "react";
import { LuImport } from "react-icons/lu";
import { z } from "zod";
import { useIsReadOnly } from "../useIsReadOnly";
import { useStore } from "../useStore";
import { importData, type SerializedNode } from "./util";

type InputProps = {
	closeNav: () => void;
};

type Phase = "idle" | "importing" | "done";

type Summary = {
	listCount: number;
	todoCount: number;
	userCount: number;
	total: number;
};

const ContentNodeSchema: z.ZodType<SerializedNode> = z.lazy(() =>
	z.object({
		type: z.string(),
		attrs: z.record(z.string(), z.unknown()).optional(),
		children: z.array(ContentNodeSchema).optional(),
		delta: z
			.array(
				z.object({
					insert: z.string().optional(),
					delete: z.number().optional(),
					retain: z.number().optional(),
					attributes: z.record(z.string(), z.unknown()).optional(),
				}),
			)
			.optional(),
		text: z.string().optional(),
	}),
);

const ExportSchema = z.object({
	lists: z
		.array(
			z.object({
				name: z.string(),
				id: z.string(),
				sortOrder: z.string(),
			}),
		)
		.optional(),
	todos: z
		.array(
			z.object({
				id: z.string(),
				sortOrder: z.string(),
				completed: z.boolean().optional(),
				modified: z.number().optional(),
				by: z.string().optional(),
				created: z.number().optional(),
				content: z.array(ContentNodeSchema).optional(),
				focus: z.boolean().optional(),
				focusSortOrder: z.string().optional(),
				listId: z.string().optional(),
				dueDate: z.string().optional(),
				repeatDays: z.number().optional(),
			}),
		)
		.optional(),
	storedUsers: z
		.record(
			z.string(),
			z.object({
				user: z
					.object({
						name: z.string().optional(),
						color: z.string().optional(),
					})
					.optional(),
				lastActive: z.number().optional(),
			}),
		)
		.optional(),
});

type ParsedData = z.infer<typeof ExportSchema>;

function parseSummary(textContent: string): Summary | null {
	try {
		const raw = JSON.parse(textContent);
		const result = ExportSchema.safeParse(raw);
		if (!result.success) return null;
		const { lists, todos, storedUsers } = result.data;
		const listCount = lists?.length ?? 0;
		const todoCount = todos?.length ?? 0;
		const userCount = storedUsers ? Object.keys(storedUsers).length : 0;
		return {
			listCount,
			todoCount,
			userCount,
			total: listCount + todoCount + userCount,
		};
	} catch {
		return null;
	}
}

function formatETA(seconds: number): string {
	if (seconds <= 0) return "calculating…";
	if (seconds < 60) return `${seconds}s`;
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	if (m < 60) return `${m}m ${s}s`;
	const h = Math.floor(m / 60);
	return `${h}h ${m % 60}m`;
}

export const Import = ({ closeNav }: InputProps) => {
	const [opened, { open, close }] = useDisclosure(false);
	const [phase, setPhase] = useState<Phase>("idle");
	const store = useStore();
	const { isReadOnly } = useIsReadOnly();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const fileInputId = useId();

	const [jsonText, setJsonText] = useState("");
	const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
	const [parseError, setParseError] = useState<string | null>(null);
	const [parsedData, setParsedData] = useState<ParsedData | null>(null);

	const [summary, setSummary] = useState<Summary | null>(null);
	const [progress, setProgress] = useState(0);
	const [imported, setImported] = useState(0);
	const [totalCount, setTotalCount] = useState(0);
	const [etaText, setEtaText] = useState("calculating…");
	const startTimeRef = useRef(0);

	const resetState = useCallback(() => {
		setPhase("idle");
		setJsonText("");
		setUploadedFileName(null);
		setParseError(null);
		setParsedData(null);
		setSummary(null);
		setProgress(0);
		setImported(0);
		setTotalCount(0);
		setEtaText("calculating…");
	}, []);

	const onClickOpen = useCallback(() => {
		resetState();
		open();
		closeNav();
	}, [closeNav, open, resetState]);

	const onClose = useCallback(() => {
		if (phase === "importing") return;
		close();
	}, [close, phase]);

	const updateJson = useCallback((text: string) => {
		setJsonText(text);
		setParseError(null);
		const parsed = parseSummary(text);
		setSummary(parsed);
		if (text.trim()) {
			try {
				const raw = JSON.parse(text);
				const result = ExportSchema.safeParse(raw);
				if (result.success) {
					setParsedData(result.data);
					setParseError(null);
				} else {
					setParsedData(null);
				}
			} catch {
				setParsedData(null);
				if (!parsed) {
					setParseError("Invalid JSON");
				}
			}
		} else {
			setParsedData(null);
		}
	}, []);

	const handleFileChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const fileList = e.target.files;
			if (!fileList?.length) return;

			const file = fileList[0];
			setUploadedFileName(file.name);

			file
				.text()
				.then((t) => {
					updateJson(t);
				})
				.catch(() => {
					setParseError("Failed to read file");
				});
		},
		[updateJson],
	);

	const clearFile = useCallback(() => {
		setUploadedFileName(null);
		setJsonText("");
		setSummary(null);
		setParsedData(null);
		setParseError(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	}, []);

	const importTodos = useCallback(async () => {
		if (!parsedData) return;

		const { lists, todos, storedUsers } = parsedData;
		const total =
			(lists?.length ?? 0) +
			(todos?.length ?? 0) +
			(storedUsers ? Object.keys(storedUsers).length : 0);

		setTotalCount(total);
		setImported(0);
		setProgress(0);
		setPhase("importing");
		startTimeRef.current = performance.now();

		await importData(parsedData, store, (p) => {
			const done = Math.round(p * total);
			setImported(done);
			setProgress(Math.round(p * 100));

			const elapsed = (performance.now() - startTimeRef.current) / 1000;
			const rate = done / Math.max(elapsed, 0.001);
			const remaining = (total - done) / Math.max(rate, 0.001);
			setEtaText(formatETA(Math.round(remaining)));
		});

		setProgress(100);
		setImported(total);
		setPhase("done");
	}, [parsedData, store]);

	const handleCloseDone = useCallback(() => {
		close();
	}, [close]);

	const isUploaded = uploadedFileName !== null;

	const modalTitle =
		phase === "importing"
			? "Importing…"
			: phase === "done"
				? "Import Complete"
				: "Import Todos";

	return (
		<>
			<Tooltip label="Import Todos">
				<ActionIcon size="lg" onClick={onClickOpen} variant="light" ml={10}>
					<LuImport />
				</ActionIcon>
			</Tooltip>
			<Modal
				opened={opened}
				onClose={onClose}
				title={modalTitle}
				size="lg"
				closeOnClickOutside={phase !== "importing"}
			>
				{phase === "idle" && (
					<Stack>
						{isUploaded ? (
							<Group align="center">
								<IconFile size={20} />
								<Text size="sm" style={{ flex: 1 }}>
									{uploadedFileName}
								</Text>
								<ActionIcon
									variant="subtle"
									color="gray"
									size="sm"
									onClick={clearFile}
								>
									<IconX size={16} />
								</ActionIcon>
							</Group>
						) : (
							<>
								<Button
									onClick={() => fileInputRef.current?.click()}
									variant="light"
								>
									Upload JSON file
								</Button>
								<input
									onChange={handleFileChange}
									ref={fileInputRef}
									type="file"
									id={fileInputId}
									accept="text/plain, application/json"
									style={{ display: "none" }}
								/>
								<Text size="sm" c="dimmed">
									Or paste JSON below:
								</Text>
							</>
						)}

						<JsonInput
							minRows={isUploaded ? 18 : 14}
							value={jsonText}
							onChange={updateJson}
							disabled={isUploaded}
							placeholder='{ "lists": [...], "todos": [...] }'
						/>

						{parseError && (
							<Text size="sm" c="red">
								{parseError}
							</Text>
						)}

						{summary && (
							<Stack gap={2}>
								<Text size="sm" fw={500}>
									Import summary:
								</Text>
								<Text size="sm">
									{summary.listCount} lists, {summary.todoCount} todos,{" "}
									{summary.userCount} users
								</Text>
								<Text size="sm" c="dimmed">
									{summary.total} items total
								</Text>
							</Stack>
						)}

						<Tooltip
							label="Import is disabled in read-only mode"
							disabled={!isReadOnly}
						>
							<Button
								onClick={importTodos}
								disabled={isReadOnly || !summary || summary.total === 0}
							>
								Import
							</Button>
						</Tooltip>
					</Stack>
				)}

				{phase === "importing" && (
					<Stack pt="md">
						<Center>
							<Loader size="lg" />
						</Center>
						<Center>
							<Text size="lg" fw={500}>
								{imported} / {totalCount} imported
							</Text>
						</Center>
						<Progress value={progress} size="lg" animated />
						<Group justify="space-between">
							<Text size="sm" c="dimmed">
								{progress}%
							</Text>
							<Text size="sm" c="dimmed">
								ETA: {etaText}
							</Text>
						</Group>
					</Stack>
				)}

				{phase === "done" && (
					<Stack pt="md" align="center">
						<Text size="lg" fw={500} c="green">
							Import completed successfully
						</Text>
						<Text>
							Imported {summary?.listCount ?? 0} lists,{" "}
							{summary?.todoCount ?? 0} todos, {summary?.userCount ?? 0} users.
						</Text>
						<Button onClick={handleCloseDone} mt="md">
							Close
						</Button>
					</Stack>
				)}
			</Modal>
		</>
	);
};
