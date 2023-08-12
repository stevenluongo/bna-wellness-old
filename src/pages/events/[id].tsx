/* eslint-disable @typescript-eslint/no-non-null-assertion */
import withAuth from "~/hocs/withAuth";
import { api } from "~/utils/api";
import { z } from "zod";
import { useZodForm } from "~/utils/useZodForm";
import moment from "moment";
import { ssgInit } from "~/server/ssg-init";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import MomentLocalizationProvider from "~/components/library/MomentLocalizationProvider";
import ControlledTimePicker from "~/components/library/ControlledTimePicker";
import ControlledSelect from "~/components/library/ControlledSelect";
import { GetStaticPropsContext } from "next";
import { useState } from "react";
import {
  countIntervals,
  useBlockedTimes,
  useCurrentWeek,
  useScheduleTimes,
} from "~/utils/events";

// validation schema is used by server
export const createEventValidationSchema = z.object({
  startTime: z.date(),
  endTime: z.date(),
  weekStart: z.date(),
  roomId: z.string(),
  trainerId: z.string(),
  terminalId: z.string(),
  clientId: z.string(),
});

const Events = () => {
  const [timeslotModalOpen, setTimeslotModalOpen] = useState(false);

  const router = useRouter();
  const { data: roomData } = api.rooms.id.useQuery(
    { id: router.query.id as string },
    {
      staleTime: 10000,
    }
  );
  const room = roomData!;
  const { data: terminalData } = api.terminal.active.useQuery(undefined, {
    staleTime: 10000,
  });
  const terminal = terminalData!;
  const { data: clients } = api.clients.all.useQuery(undefined, {
    staleTime: 10000,
  });
  const { data: session } = useSession();
  const user = session!.user;

  const utils = api.useContext();

  const scheduleTimes = useScheduleTimes(room);
  const blockedTimes = useBlockedTimes(room.events);
  const currentWeek = useCurrentWeek();

  const createEventMutation = api.events.create.useMutation({
    async onSuccess(event) {
      // cancel queries
      await utils.rooms.id.cancel();
      const freshRoom = await utils.rooms.id.getData({
        id: room.id,
      });
      if (!freshRoom) return;

      utils.rooms.id.setData(
        { id: freshRoom.id },
        {
          ...freshRoom,
          events: [...freshRoom.events, event],
        }
      );
    },
  });

  const form = useZodForm({
    schema: createEventValidationSchema,
    defaultValues: {
      startTime: moment().hour(6).minute(30).second(0).millisecond(0).toDate(),
      endTime: moment().hour(20).minute(0).second(0).millisecond(0).toDate(),
      weekStart: moment().startOf("week").toDate(),
      roomId: room.id,
      trainerId: user.id,
      terminalId: terminal.id,
      clientId: "",
    },
  });

  const handleFormSubmit = (
    data: z.infer<typeof createEventValidationSchema>
  ) => {
    //need to parse the passed client id
    data = {
      ...data,
      clientId: JSON.parse(data.clientId).id,
    };
    createEventMutation.mutate(data);
  };

  const openTimeslotModal = () => {
    setTimeslotModalOpen(true);
  };

  if (!room) {
    return <p>No Room</p>;
  }

  return (
    <div>
      <h1>Events</h1>
      <h1 className="mb-4 text-2xl">Current Room: {room.location}</h1>

      <form onSubmit={form.handleSubmit(handleFormSubmit)}>
        <MomentLocalizationProvider>
          <div className="flex gap-4">
            <ControlledTimePicker
              name="startTime"
              control={form.control}
              label="Start Time"
            />
            <ControlledTimePicker
              name="endTime"
              control={form.control}
              label="End Time"
            />
          </div>
        </MomentLocalizationProvider>

        <ControlledSelect
          name="clientId"
          control={form.control}
          label="Client"
          labelId="client-label"
          selectId="client-select"
          values={clients}
          client
        />

        <button type="submit">Create check</button>
      </form>
      <table className="table">
        <thead>
          <tr className="table_row">
            <th className="table_header"></th>
            {currentWeek.map((date) => (
              <th
                className="table_header"
                key={moment(date).format("YYYY-MM-DD")}
              >
                {moment(date).format("dddd, MMMM D")}
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
                  const current = date
                    .clone()
                    .hour(time.hour())
                    .minute(time.minute());
                  const event = room.events.find(
                    (e) => e.startTime.toISOString() === current.toISOString()
                  );
                  if (event) {
                    const intervals = countIntervals(
                      event.startTime,
                      event.endTime
                    );
                    return (
                      <td
                        rowSpan={intervals}
                        key={date.format("YYYY-MM-DD")}
                        style={{ background: "blue" }}
                      >
                        <p>
                          {event?.checks[0]?.client?.firstName}{" "}
                          {event?.checks[0]?.client?.lastName}
                        </p>
                        <p>{event?.checks[0]?.trainer?.firstName}</p>
                      </td>
                    );
                  }
                  if (blockedTimes.has(current.toISOString())) {
                    return null;
                  }
                  return (
                    <td
                      key={date.format("YYYY-MM-DD")}
                      onClick={openTimeslotModal}
                      className="border border-gray-300"
                    ></td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default withAuth(Events);

export const getStaticPaths = async () => {
  const ssg = ssgInit();
  const rooms = await ssg.rooms.ids.fetch();
  // We'll pre-render only these paths at build time.
  // { fallback: 'blocking' } will server-render pages
  // on-demand if the path doesn't exist.
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
