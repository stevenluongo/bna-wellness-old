import { Event } from "@prisma/client";
import { countIntervals } from "~/utils/events";

interface EventWithChecks extends Event {
  checks: {
    client: {
      firstName: string;
      lastName: string;
    };
    trainer: {
      firstName: string;
    };
  }[];
}

const EventTimeslot = ({ event }: { event: EventWithChecks }) => {
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
