import { differenceInMilliseconds, startOfTomorrow } from "date-fns";
import { useEffect, useState } from "react";

/** Triggers a re-render at midnight.
 *
 * Returns the current time on calling.
 */
export const useRerenderDaily = () => {
  const [time, setTime] = useState(Date.now());

  useEffect(() => {
    const secondsToMidnight = differenceInMilliseconds(startOfTomorrow(), time);
    const id = setTimeout(() => {
      setTime(Date.now());
    }, secondsToMidnight);
    return () => clearTimeout(id);
  }, [time]);

  return time;
};
