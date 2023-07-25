import { useEffect, useMemo, useState } from "react";
import { api } from "~/utils/api";
import { z } from "zod";
import { FormSubmit } from "../modal/formSubmit";
import { FormInput } from "../modal/formInput";
import FormModal from "../modal/formModal";
import { useZodForm } from "~/utils/useZodForm";
import { Room, User } from "@prisma/client";
import MomentLocalizationProvider from "../library/MomentLocalizationProvider";
import ControlledTimePicker from "../library/ControlledTimePicker";
import ControlledMultiSelect from "../library/ControlledMultiSelect";

interface RoomWithUsers extends Room {
  users: Omit<User, "hash" | "salt">[];
}

type ModalProps = {
  open: boolean;
  handleChange: (v: boolean) => void;
  room: RoomWithUsers;
};

// validation schema is used by server
export const editRoomValidationSchema = z.object({
  id: z.string(),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
  conflictsAllowed: z.boolean().optional(),
  location: z.string().optional(),
  userIds: z.array(z.string()).optional(),
});

export default function EditRoomModal(props: ModalProps) {
  const { handleChange } = props;
  const utils = api.useContext();
  const [error, setError] = useState<string>("");
  const { data: users } = api.users.all.useQuery(undefined, {
    staleTime: 10000,
  });

  const {
    reset,
    formState: { dirtyFields, errors },
    handleSubmit,
    control,
    register,
  } = useZodForm({
    schema: editRoomValidationSchema,
    defaultValues: useMemo(() => {
      return {
        ...props.room,
        userIds: props.room.users?.map((u) => JSON.stringify(u)),
      };
    }, [props.room]),
  });

  // reset form when room changes
  useEffect(() => {
    reset({
      ...props.room,
      userIds: props.room.users?.map((u) => JSON.stringify(u)),
    });
  }, [props.room, reset]);

  const editRoomMutation = api.rooms.update.useMutation({
    async onMutate(updatedRoom) {
      try {
        // cancel queries
        await utils.rooms.id.cancel();

        // fetch fresh data
        const room = utils.rooms.id.getData({
          id: updatedRoom.id,
        });

        // if no data, return
        if (!room) return;

        // update the room with the updated users
        const updatedUsers = updatedRoom.userIds?.map((id) =>
          users?.find((u) => u.id === id)
        ) as User[];

        // update the room with the updated data
        utils.rooms.id.setData(
          { id: room.id },
          {
            ...room,
            ...updatedRoom,
            users: updatedUsers,
          }
        );

        // close modal
        handleChange(false);
      } catch (error) {
        if (error instanceof Error) setError(error.message as string);
      }
    },
    onError(error) {
      setError(error.message);
    },
  });

  const onSubmit = (data: z.infer<typeof editRoomValidationSchema>) => {
    data = {
      ...data,
      userIds: data.userIds?.map((u) => JSON.parse(u).id),
    };
    // get updated fields
    const updatedFields = Object.fromEntries(
      Object.entries(data).filter(
        ([key]) =>
          dirtyFields[key as keyof z.infer<typeof editRoomValidationSchema>]
      )
    );

    // if no fields are updated, close modal
    if (Object.keys(updatedFields).length === 0) return handleChange(false);

    editRoomMutation.mutate({
      id: props.room.id,
      ...updatedFields,
    });
  };

  return (
    <FormModal {...props}>
      <div className="w-full rounded-lg bg-white shadow dark:border dark:border-gray-700 dark:bg-gray-800  ">
        <div className="space-y-4 p-6 sm:p-8 md:space-y-6">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl">
            Edit Room
          </h1>
          <form
            className="space-y-4 md:space-y-6"
            onSubmit={handleSubmit(onSubmit)}
          >
            <FormInput
              errors={errors}
              register={register}
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

            <FormSubmit>Save Changes</FormSubmit>
            {error && <p className="text-red-700">{error}</p>}
          </form>
        </div>
      </div>
    </FormModal>
  );
}
