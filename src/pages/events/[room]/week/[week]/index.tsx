/* eslint-disable @typescript-eslint/no-non-null-assertion */
import withAuth from "~/hocs/withAuth";
import { api } from "~/utils/api";
import moment, { Moment } from "moment";
import { ssgInit } from "~/server/ssg-init";
import { useRouter } from "next/router";
import { GetStaticPropsContext } from "next";
import { useEffect, useState } from "react";
import {
  setMomentTime,
  useBlockedTimes,
  useCurrentWeek,
  useScheduleTimes,
} from "~/utils/events";
import CreateCheckModal from "~/components/events/createCheckModal";
import EventTimeslot from "~/components/events/timeslots/EventTimeslot";
import EmptyTimeslot from "~/components/events/timeslots/EmptyTimeslot";
import { useIsMutating } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import EditEventModal from "~/components/events/editEventModal";
import { Check } from "@prisma/client";

const Events = () => {
  const [timeslotModalOpen, setTimeslotModalOpen] = useState(false);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [currentTimeslot, setCurrentTimeslot] = useState<Moment | null>(null);
  const [currentCheck, setCurrentCheck] = useState<Check | null>(null);

  const createWeekMutation = api.weeks.create.useMutation({
    async onMutate(data) {
      utils.weeks.id.setData(
        { weekStart: data.weekStart, roomId: data.roomId },
        {
          start: data.weekStart,
          checks: [],
          createdAt: new Date(),
        }
      );
    },
  });

  const router = useRouter();

  const { data: week } = api.weeks.id.useQuery(
    {
      weekStart: router.query.week as string,
      roomId: router.query.room as string,
    },
    {
      staleTime: 10000,
    }
  );

  const { data: roomData } = api.rooms.id.useQuery(
    { id: router.query.room as string },
    {
      staleTime: 10000,
    }
  );

  const room = roomData!;

  const { data: session } = useSession();
  const user = session!.user;

  const scheduleTimes = useScheduleTimes(room);
  const blockedTimes = useBlockedTimes({
    checks: week?.checks,
    trainerId: user.id,
  });
  const { dates: currentWeek } = useCurrentWeek();

  const openTimeslotModal = (date: Moment) => {
    setTimeslotModalOpen(true);
    setCurrentTimeslot(date);
  };

  const handleTimeslotModalChange = (v: boolean) => {
    setTimeslotModalOpen(v);
    setCurrentTimeslot(null);
  };

  const openCheckModal = (check: Check) => {
    setEventModalOpen(true);
    setCurrentCheck(check);
  };

  const handleCheckModalChange = (v: boolean) => {
    setEventModalOpen(v);
    setCurrentCheck(null);
  };

  const utils = api.useContext();
  const number = useIsMutating();

  useEffect(() => {
    if (!week) {
      createWeekMutation.mutate({
        weekStart: router.query.week as string,
        roomId: router.query.room as string,
      });
    }
  }, [router.query.week]);

  useEffect(() => {
    // invalidate queries when mutations have settled
    // doing this here rather than in `onSettled()`
    // to avoid race conditions if you're clicking fast
    if (number === 0) {
      void utils.weeks.id.invalidate();
    }
  }, [number, utils]);

  if (!week) {
    return <p>no Week</p>;
  }

  const handleWeekAfter = () =>
    router.push(
      `/events/${router.query.room}/week/${moment(router.query.week)
        .add(7, "days")
        .toISOString()}`
    );

  const handleWeekBefore = () =>
    router.push(
      `/events/${router.query.room}/week/${moment(router.query.week)
        .subtract(7, "days")
        .toISOString()}`
    );

  return (
    <div>
      <button className="bg-[red] p-8" onClick={handleWeekBefore}>
        Back
      </button>
      <button className="bg-[blue] p-8" onClick={handleWeekAfter}>
        Next
      </button>
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
                  const current = setMomentTime(date, time);
                  // find check for this timeslot
                  const check = week.checks?.find(
                    (c) =>
                      c.startTime.toISOString() === current.toISOString() &&
                      c.trainerId === user.id
                  );
                  // if event exists, render it
                  if (check) {
                    return (
                      <EventTimeslot
                        key={check.id}
                        check={check}
                        handleClick={() => openCheckModal(check)}
                      />
                    );
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
      <CreateCheckModal
        open={timeslotModalOpen}
        handleChange={handleTimeslotModalChange}
        timeslot={currentTimeslot}
        roomId={room.id}
        weekStart={week.start}
      />
      <EditEventModal
        open={eventModalOpen}
        handleChange={handleCheckModalChange}
        check={currentCheck}
        roomId={room.id}
        weekStart={week.start}
      />
    </div>
  );
};

export default withAuth(Events);

export const getStaticPaths = async () => {
  const ssg = ssgInit();
  const rooms = await ssg.rooms.all.fetch();
  const paths: { params: { week: string; room: string } }[] = [];

  for (const room of rooms) {
    for (const week of room.weeks) {
      paths.push({
        params: {
          week: week.start,
          room: room.id,
        },
      });
    }
  }

  return { paths, fallback: "blocking" };
};

export const getStaticProps = async (ctx: GetStaticPropsContext) => {
  const ssg = ssgInit();
  const room = await ssg.rooms.id.fetch({ id: ctx.params?.room as string });

  await ssg.weeks.id.prefetch({
    weekStart: ctx.params?.week as string,
    roomId: ctx.params?.room as string,
  });

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
