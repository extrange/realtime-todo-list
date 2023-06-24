import { differenceInMilliseconds, startOfTomorrow } from "date-fns";
import { useEffect, useState } from "react";
import { formatDueDate } from "./util";

type InputProps = {
  dueDate: string;
};

/**Render the due date text for a TodoItem.
 * Rerenders automatically at midnight.
 */
export const DueDateString = ({ dueDate }: InputProps) => {
  const [time, setTime] = useState(Date.now());

  /* Repeatedly re-render at midnight */
  useEffect(() => {
    const secondsToMidnight = differenceInMilliseconds(startOfTomorrow(), time);
    const id = setTimeout(() => {
      setTime(Date.now());
    }, secondsToMidnight);
    return () => clearTimeout(id);
  }, [time]);

  return <span>{formatDueDate(Date.parse(dueDate))}</span>;
};
