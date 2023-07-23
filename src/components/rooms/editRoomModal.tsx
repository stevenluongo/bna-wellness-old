import { useState } from "react";
import { api } from "~/utils/api";
import { z } from "zod";
import { FormSubmit } from "../modal/formSubmit";
import { FormInput } from "../modal/formInput";
import FormModal from "../modal/formModal";
import { useZodForm } from "~/utils/useZodForm";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import "moment/locale/de";
import { Controller } from "react-hook-form";
import moment from "moment";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import { Room, User } from "@prisma/client";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

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
  const [personName, setPersonName] = useState<string[]>([]);

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

        // update client
        utils.rooms.id.setData(
          { id: room.id },
          {
            ...room,
            ...updatedRoom,
          }
        );

        // close modal
        handleChange(false);

        // reset form with updated data
        form.reset({
          ...room,
          ...updatedRoom,
        });
      } catch (error) {
        console.error(error);
      }
    },
    onError(error) {
      setError(error.message);
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

            <LocalizationProvider
              dateAdapter={AdapterMoment}
              adapterLocale="de"
            >
              <div className="flex gap-4">
                <Controller
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <TimePicker
                      label="Start Time"
                      ampm
                      value={moment(field.value)}
                      onChange={(date) =>
                        date && field.onChange(date.toDate() as Date)
                      }
                    />
                  )}
                />
                <Controller
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <TimePicker
                      label="End Time"
                      ampm
                      value={moment(field.value)}
                      onChange={(date) =>
                        date && field.onChange(date.toDate() as Date)
                      }
                    />
                  )}
                />
              </div>
            </LocalizationProvider>

            <Controller
              name="userIds"
              control={form.control}
              render={({ field }) => (
                <FormControl sx={{ width: "100%" }}>
                  <InputLabel id="demo-multiple-checkbox-label">
                    Users
                  </InputLabel>
                  <Select
                    labelId="demo-multiple-checkbox-label"
                    id="demo-multiple-checkbox"
                    multiple
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(e.target.value as string[]);
                    }}
                    input={<OutlinedInput label="Users" />}
                    renderValue={(selected) =>
                      selected
                        .map((s) => JSON.parse(s))
                        .map((s) => `${s.firstName} ${s.lastName}`)
                        .join(", ")
                    }
                    MenuProps={MenuProps}
                  >
                    {users?.map((user) => (
                      <MenuItem key={user.id} value={JSON.stringify(user)}>
                        <Checkbox
                          checked={
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            field.value!.indexOf(JSON.stringify(user)) > -1
                          }
                        />
                        <ListItemText
                          primary={`${user.firstName} ${user.lastName}`}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />

            <FormSubmit>Save Changes</FormSubmit>
            {error && <p className="text-red-700">{error}</p>}
          </form>
        </div>
      </div>
    </FormModal>
  );
}
