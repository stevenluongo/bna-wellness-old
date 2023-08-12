/* eslint-disable @typescript-eslint/no-non-null-assertion */
import withAuth from "~/hocs/withAuth";
import { api } from "~/utils/api";
import { Moment } from "moment";
import { ssgInit } from "~/server/ssg-init";
import { useRouter } from "next/router";
import { GetStaticPropsContext } from "next";
import { useState } from "react";
import {
  useBlockedTimes,
  useCurrentWeek,
  useScheduleTimes,
} from "~/utils/events";
import CreateEventModal from "~/components/events/createEventModal";
import EventTimeslot from "~/components/events/timeslots/EventTimeslot";
import EmptyTimeslot from "~/components/events/timeslots/EmptyTimeslot";

const Events = () => {
  const [timeslotModalOpen, setTimeslotModalOpen] = useState(false);
  const [currentTimeslot, setCurrentTimeslot] = useState<Moment | null>(null);

  const router = useRouter();
  const { data: roomData } = api.rooms.id.useQuery(
    { id: router.query.id as string },
    {
      staleTime: 10000,
    }
  );
  const room = roomData!;

  const scheduleTimes = useScheduleTimes(room);
  const blockedTimes = useBlockedTimes(room.events);
  const currentWeek = useCurrentWeek();

  const openTimeslotModal = (date: Moment) => {
    setTimeslotModalOpen(true);
    setCurrentTimeslot(date);
  };

  const handleTimeslotModalChange = (v: boolean) => {
    setTimeslotModalOpen(v);
    setCurrentTimeslot(null);
  };

  if (!room) {
    return <p>No Room</p>;
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl">{room.location} Room</h1>
      <table className="table">
        <thead>
          <tr className="table_row">
            <th className="table_header"></th>
            {currentWeek.map((date) => (
              <th className="table_header" key={date.toISOString()}>
                {date.format("dddd, MMMM D")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {scheduleTimes.map((time) => {
            return (
              <tr className="table_row" key={time.format("HH:mm")}>
                <th className="table_head">{time.format("h:mm A")}</th>
                {currentWeek.map((date) => {
                  // set the current date and time for this timeslot
                  const current = date
                    .clone()
                    .hour(time.hour())
                    .minute(time.minute());
                  // find event for this timeslot
                  const event = room.events.find(
                    (e) => e.startTime.toISOString() === current.toISOString()
                  );
                  // if event exists, render it
                  if (event) {
                    return <EventTimeslot key={event.id} event={event} />;
                  }
                  // if blocked, render nothing
                  if (blockedTimes.has(current.toISOString())) {
                    return null;
                  }
                  // if not blocked, render empty timeslot
                  return (
                    <EmptyTimeslot
                      key={current.toISOString()}
                      handleClick={() => openTimeslotModal(current)}
                    />
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <CreateEventModal
        open={timeslotModalOpen}
        handleChange={handleTimeslotModalChange}
        timeslot={currentTimeslot}
        roomId={room.id}
      />
    </div>
  );
};

export default withAuth(Events);

export const getStaticPaths = async () => {
  const ssg = ssgInit();
  const rooms = await ssg.rooms.ids.fetch();
  return {
    paths: rooms.map((m) => ({ params: { id: m.id } })),
    fallback: "blocking",
  };
};

export const getStaticProps = async (ctx: GetStaticPropsContext) => {
  const ssg = ssgInit();
  const room = await ssg.rooms.id.fetch({ id: ctx.params?.id as string });

  if (!room) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
    revalidate: 1,
  };
};
