/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Moment } from "moment";
import FormModal from "../modal/formModal";
import { FormSubmit } from "../modal/formSubmit";
import MomentLocalizationProvider from "../library/MomentLocalizationProvider";
import ControlledTimePicker from "../library/ControlledTimePicker";
import ControlledSelect from "../library/ControlledSelect";
import { useZodForm } from "~/utils/useZodForm";
import { z } from "zod";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { CreateCheckModalProps } from "./events";
import { Client } from "@prisma/client";

// validation schema is used by server
export const createCheckValidationSchema = z.object({
  startTime: z.date(),
  endTime: z.date(),
  weekStart: z.string(),
  roomId: z.string(),
  trainerId: z.string(),
  terminalId: z.string(),
  clientId: z.string(),
});

const CreateCheckModal: FC<CreateCheckModalProps> = (props) => {
  const { timeslot, roomId, weekStart, handleChange } = props;
  const [client, setClient] = useState<Client | null>(null);

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

  const createCheckMutation = api.checks.create.useMutation({
    async onMutate(data) {
      try {
        await utils.weeks.id.cancel();
        const week = utils.weeks.id.getData({
          weekStart,
          roomId,
        });
        if (!week) {
          return;
        }
        const updatedWeek = {
          ...week,
          createdAt: new Date(),
          checks: [
            ...week.checks,
            {
              ...data,
              clientId: data.clientId,
              id: `${Math.random()}`,
              createdAt: new Date(),
              updatedAt: new Date(),
              client: client!,
            },
          ],
        };
        utils.weeks.id.setData({ weekStart, roomId }, updatedWeek);
      } catch (error) {
        console.error(error);
      }
    },
  });

  const generateDefaultValues = useCallback(() => {
    return {
      weekStart,
      roomId,
      startTime: timeslot?.toDate(),
      endTime: timeslot?.clone().add(30, "minutes").toDate(),
      trainerId: user.id,
      terminalId: terminal.id,
      clientId: "",
    };
  }, [weekStart, roomId, timeslot, user, terminal]);

  const { reset, handleSubmit, control } = useZodForm({
    schema: createCheckValidationSchema,
    defaultValues: useMemo(() => {
      return generateDefaultValues();
    }, [generateDefaultValues]),
  });

  // reset form when room changes
  useEffect(() => {
    reset(generateDefaultValues());
  }, [generateDefaultValues, reset]);

  const createEvent = (data: z.infer<typeof createCheckValidationSchema>) => {
    setClient(JSON.parse(data.clientId));
    data = {
      ...data,
      clientId: JSON.parse(data.clientId).id,
    };
    // create check
    createCheckMutation.mutate(data);
    // close modal
    handleChange(false);
  };

  return (
    <FormModal {...props}>
      <div className="w-full rounded-lg bg-white shadow dark:border dark:border-gray-700 dark:bg-gray-800  ">
        <div className="space-y-4 p-6 sm:p-8 md:space-y-6">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl">
            Create Event
          </h1>
          <form
            className="space-y-4 md:space-y-6"
            onSubmit={handleSubmit(createEvent)}
          >
            <MomentLocalizationProvider>
              <div className="flex gap-4">
                <ControlledTimePicker
                  name="startTime"
                  control={control}
                  label="Start Time"
                  disabled
                />
                <ControlledTimePicker
                  name="endTime"
                  control={control}
                  label="End Time"
                />
              </div>
            </MomentLocalizationProvider>

            <ControlledSelect
              name="clientId"
              control={control}
              label="Client"
              labelId="client-label"
              selectId="client-select"
              values={clients}
              client
            />
            <FormSubmit>Create</FormSubmit>
          </form>
        </div>
      </div>
    </FormModal>
  );
};

export default CreateCheckModal;
