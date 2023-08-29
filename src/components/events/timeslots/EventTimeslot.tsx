import { countIntervals } from "~/utils/events";
import { Check, Prisma } from "@prisma/client";

const EventTimeslot = ({
  check,
}: {
  check: Check;
  handleClick: () => void;
}) => {
  return (
    <td
      rowSpan={countIntervals(check?.startTime, check?.endTime)}
      className="bg-blue-500"
    >
      <p>check</p>
    </td>
  );
};

export default EventTimeslot;
