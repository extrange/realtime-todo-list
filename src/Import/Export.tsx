import { ActionIcon, Tooltip } from "@mantine/core";
import { useCallback } from "react";
import { LuDownload } from "react-icons/lu";
import { useStore } from "../useStore";
import { downloadJson, exportData } from "./util";

export const Export = () => {
	const store = useStore();

	const handleExport = useCallback(() => {
		const data = exportData(store);
		downloadJson(data, "todos-export.json");
	}, [store]);

	return (
		<Tooltip label="Export Todos">
			<ActionIcon size="lg" onClick={handleExport} variant="light" ml={10}>
				<LuDownload />
			</ActionIcon>
		</Tooltip>
	);
};
