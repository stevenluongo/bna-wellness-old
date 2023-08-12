import { useState } from "react";
import { api } from "~/utils/api";
import { z } from "zod";
import { FormSubmit } from "../modal/formSubmit";
import { FormInput } from "../modal/formInput";
import FormModal from "../modal/formModal";
import { useZodForm } from "~/utils/useZodForm";
import moment from "moment";
import ControlledMultiSelect from "../library/ControlledMultiSelect";
import ControlledTimePicker from "../library/ControlledTimePicker";
import MomentLocalizationProvider from "../library/MomentLocalizationProvider";

type ModalProps = {
  open: boolean;
  handleChange: (v: boolean) => void;
};

// validation schema is used by server
export const createRoomValidationSchema = z.object({
  startTime: z.date(),
  endTime: z.date(),
  conflictsAllowed: z.boolean(),
  location: z.string(),
  userIds: z.array(z.string()),
});

export default function CreateRoomModal(props: ModalProps) {
  const { handleChange } = props;
  const { data: users } = api.users.all.useQuery(undefined, {
    staleTime: 10000,
  });
  const utils = api.useContext();
  const [error, setError] = useState<string>("");

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useZodForm({
    schema: createRoomValidationSchema,
    defaultValues: {
      startTime: moment().hour(6).minute(30).second(0).millisecond(0).toDate(),
      endTime: moment().hour(20).minute(0).second(0).millisecond(0).toDate(),
      conflictsAllowed: false,
      location: "",
      userIds: [],
    },
  });

  const createRoomMutation = api.rooms.create.useMutation({
    async onMutate(room) {
      try {
        await utils.rooms.all.cancel();
        const allRooms = utils.rooms.all.getData();
        if (!allRooms) {
          return;
        }
        utils.rooms.all.setData(undefined, [
          ...allRooms,
          {
            createdAt: new Date(),
            id: `${Math.random()}`,
            updatedAt: new Date(),
            ...room,
          },
        ]);
        reset();
        handleChange(false);
      } catch (error) {
        console.error(error);
      }
    },
    onError(error) {
      setError(error.message);
    },
  });

  return (
    <FormModal {...props}>
      <div className="w-full rounded-lg bg-white shadow dark:border dark:border-gray-700 dark:bg-gray-800  ">
        <div className="space-y-4 p-6 sm:p-8 md:space-y-6">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl">
            Create Room
          </h1>
          <form
            className="space-y-4 md:space-y-6"
            onSubmit={handleSubmit((data) => {
              data = {
                ...data,
                userIds: data.userIds.map((u) => JSON.parse(u).id),
              };
              createRoomMutation.mutate(data);
            })}
          >
            <FormInput
              register={register}
              errors={errors}
              attribute="location"
              placeholder="Location"
            />

            <MomentLocalizationProvider>
              <div className="flex gap-4">
                <ControlledTimePicker
                  name="startTime"
                  control={control}
                  label="Start Time"
                />
                <ControlledTimePicker
                  name="endTime"
                  control={control}
                  label="End Time"
                />
              </div>
            </MomentLocalizationProvider>

            <ControlledMultiSelect
              name="userIds"
              control={control}
              label="Users"
              labelId="users-multiple-checkbox-label"
              selectId="users-multiple-checkbox"
              values={users}
            />

            <FormSubmit>Create</FormSubmit>
            {error && <p className="text-red-700">{error}</p>}
          </form>
        </div>
      </div>
    </FormModal>
  );
}
