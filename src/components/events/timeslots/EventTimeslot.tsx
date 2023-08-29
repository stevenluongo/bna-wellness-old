import { countIntervals } from "~/utils/events";
import { Check, Prisma } from "@prisma/client";

const EventTimeslot = ({
  check,
  handleClick,
}: {
  check: Check;
  handleClick: () => void;
}) => {
  return (
    <td
      rowSpan={countIntervals(check?.startTime, check?.endTime)}
      className="bg-blue-500"
      onClick={handleClick}
    >
      <p>check</p>
    </td>
  );
};

export default EventTimeslot;
