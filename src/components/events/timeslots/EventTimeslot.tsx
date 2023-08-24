import { countIntervals } from "~/utils/events";
import { Prisma } from "@prisma/client";

export type EventWithChecks = Prisma.EventGetPayload<{
  include: {
    checks: {
      include: {
        client: {
          select: {
            firstName: true;
            lastName: true;
          };
        };
        trainer: {
          select: {
            firstName: true;
          };
        };
      };
    };
  };
}>;

const EventTimeslot = ({
  event,
}: {
  event: EventWithChecks;
  handleClick: () => void;
}) => {
  return (
    <td
      rowSpan={countIntervals(event.startTime, event.endTime)}
      className="bg-blue-500"
    >
      <p>
        {event?.checks[0]?.client?.firstName}{" "}
        {event?.checks[0]?.client?.lastName}
      </p>
      <p>{event?.checks[0]?.trainer?.firstName}</p>
    </td>
  );
};

export default EventTimeslot;
