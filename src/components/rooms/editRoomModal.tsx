import { useState } from "react";
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
  const { data: users } = api.users.all.useQuery(undefined, {
    staleTime: 10000,
  });

  const { handleChange, room } = props;

  const utils = api.useContext();

  const [error, setError] = useState<string>("");

  const editRoomMutation = api.rooms.update.useMutation({
    async onMutate(updatedRoom) {
      try {
        // cancel queries
        await utils.rooms.all.cancel();

        const room = utils.rooms.id.getData({
          id: updatedRoom.id,
        });

        if (!room) return;

        // fetch all clients
        const allRooms = await utils.rooms.all.fetch();

        if (!allRooms) return;

        // update all clients
        utils.rooms.all.setData(
          undefined,
          allRooms.map((m) => {
            if (m.id === room.id) {
              return {
                ...m,
                ...updatedRoom,
              };
            }
            return m;
          })
        );

        console.log(updatedRoom.userIds);

        const updatedUsers: User[] = updatedRoom.userIds?.map((id) =>
          users?.find((u) => u.id === id)
        ) as User[];

        // update client
        utils.rooms.id.setData(
          { id: room.id },
          {
            ...room,
            users: updatedUsers,
            ...updatedRoom,
          }
        );

        // close modal
        handleChange(false);

        // need to stringify user ids for form
        const updatedUserIds = updatedRoom.userIds?.map((id) =>
          JSON.stringify(users?.find((u) => u.id === id))
        );

        // reset form with updated data
        form.reset({
          ...room,
          ...updatedRoom,
          userIds: updatedUserIds,
        });
      } catch (error) {
        console.error(error);
      }
    },
    onError(error) {
      setError(error.message);
    },
    async onSuccess() {
      const res = await fetch(
        `/api/revalidate?secret=${process.env.NEXT_PUBLIC_MY_SECRET_TOKEN}&path=/admin/rooms/${room.id}`
      );
      console.log(res);
    },
  });

  const form = useZodForm({
    schema: editRoomValidationSchema,
    defaultValues: {
      ...room,
      userIds: room.users.map((u) => JSON.stringify(u)),
    },
  });

  // get dirty fields
  const dirtyFields = form.formState.dirtyFields;

  const handleSubmit = async (
    data: z.infer<typeof editRoomValidationSchema>
  ) => {
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

    await editRoomMutation.mutateAsync({
      id: room.id,
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
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormInput
              methods={form}
              attribute="location"
              placeholder="Location"
            />

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

            <ControlledMultiSelect
              name="userIds"
              control={form.control}
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
