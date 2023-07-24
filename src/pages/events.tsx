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
  const router = useRouter();

  const utils = api.useContext();

  const { data: rooms } = api.rooms.all.useQuery(undefined, {
    staleTime: 10000,
  });

  const { data: terminalData } = api.terminal.active.useQuery(undefined, {
    staleTime: 10000,
  });

  const { data: clients } = api.clients.all.useQuery(undefined, {
    staleTime: 10000,
  });

  const createEventMutation = api.events.create.useMutation({
    onSuccess: (event) => {
      console.log(event);
    },
  });

  const { data: session } = useSession();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = session!.user;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const terminal = terminalData!;

  const form = useZodForm({
    schema: createEventValidationSchema,
    defaultValues: {
      startTime: moment().hour(6).minute(30).second(0).millisecond(0).toDate(),
      endTime: moment().hour(20).minute(0).second(0).millisecond(0).toDate(),
      weekStart: moment().startOf("week").toDate(),
      roomId: rooms?.[0]?.id,
      trainerId: user.id,
      terminalId: terminal.id,
      clientId: "",
    },
  });

  if (!rooms) {
    return null;
  }

  // select room from query or default to first room
  const room = rooms?.find((r) => r.id === router.query.id) || rooms[0];

  if (!room) {
    return <p>No Room</p>;
  }

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
        />

        <button type="submit">Create check</button>
      </form>
    </div>
  );
};

export default withAuth(Events);

export const getServerSideProps = async () => {
  const ssg = ssgInit();
  await ssg.rooms.all.prefetch();
  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
  };
};
