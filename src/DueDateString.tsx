import { useRerenderDaily } from "./useRerenderDaily";
import { formatDueDate } from "./util";

type InputProps = {
	dueDate: string;
};

/**
 * Render the due date text for a TodoItem.
 * Rerenders automatically at midnight.
 */
export const DueDateString = ({ dueDate }: InputProps) => {
	useRerenderDaily();

	return <span>{formatDueDate(Date.parse(dueDate))}</span>;
};
