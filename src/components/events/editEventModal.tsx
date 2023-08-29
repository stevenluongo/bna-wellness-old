/* eslint-disable @typescript-eslint/no-non-null-assertion */
import moment, { Moment } from "moment";
import FormModal from "../modal/formModal";
import { FormSubmit } from "../modal/formSubmit";
import MomentLocalizationProvider from "../library/MomentLocalizationProvider";
import ControlledTimePicker from "../library/ControlledTimePicker";
import ControlledSelect from "../library/ControlledSelect";
import { useZodForm } from "~/utils/useZodForm";
import { z } from "zod";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import { useEffect, useMemo } from "react";

type ModalProps = {
  open: boolean;
  handleChange: (v: boolean) => void;
  timeslot: Moment | null;
  roomId: string;
  event: Event | null;
};

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

const EditEventModal = (props: ModalProps) => {
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

  const { reset, handleSubmit, control } = useZodForm({
    schema: createEventValidationSchema,
    defaultValues: useMemo(() => {
      return {
        startTime: props.timeslot?.toDate(),
        endTime: props.timeslot?.clone().add(30, "minutes").toDate(),
        weekStart: moment().startOf("week").toDate(),
        roomId: props.roomId,
        trainerId: user.id,
        terminalId: terminal.id,
        clientId: "",
      };
    }, [props.timeslot, props.roomId, user, terminal]),
  });

  // reset form when room changes
  useEffect(() => {
    reset({
      startTime: props.timeslot?.toDate(),
      endTime: props.timeslot?.clone().add(30, "minutes").toDate(),
      weekStart: moment().startOf("week").toDate(),
      roomId: props.roomId,
      trainerId: user.id,
      terminalId: terminal.id,
      clientId: "",
    });
  }, [props.timeslot, reset, props.roomId, user, terminal]);

  return (
    <FormModal {...props}>
      <div className="w-full rounded-lg bg-white shadow dark:border dark:border-gray-700 dark:bg-gray-800  ">
        <div className="space-y-4 p-6 sm:p-8 md:space-y-6">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl">
            Create Event
          </h1>
          <form className="space-y-4 md:space-y-6">
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

export default EditEventModal;
