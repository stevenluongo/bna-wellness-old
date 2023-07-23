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
  const [personName, setPersonName] = useState<string[]>([]);

  const { data: users } = api.users.all.useQuery(undefined, {
    staleTime: 10000,
  });

  const { handleChange } = props;

  const utils = api.useContext();

  const [error, setError] = useState<string>("");

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

        handleChange(false);
        form.reset();
      } catch (error) {
        console.error(error);
      }
    },
    onError(error) {
      setError(error.message);
    },
  });

  const form = useZodForm({
    schema: createRoomValidationSchema,
    defaultValues: {
      startTime: moment().hour(6).minute(30).second(0).millisecond(0).toDate(),
      endTime: moment().hour(20).minute(0).second(0).millisecond(0).toDate(),
      conflictsAllowed: false,
      location: "",
      userIds: [],
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
            onSubmit={form.handleSubmit((data) => {
              const payload = {
                ...data,
                userIds: data.userIds.map((name) => {
                  const [firstName, lastName] = name.split(" ");
                  const user = users?.find(
                    (u) => u.firstName === firstName && u.lastName === lastName
                  );
                  return user!.id;
                }),
              };
              createRoomMutation.mutate(payload);
            })}
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
                    renderValue={(selected) => selected.join(", ")}
                    MenuProps={MenuProps}
                  >
                    {users?.map((user) => (
                      <MenuItem
                        key={user.id}
                        value={`${user.firstName} ${user.lastName}`}
                      >
                        <Checkbox
                          checked={
                            field.value.indexOf(
                              `${user.firstName} ${user.lastName}`
                            ) > -1
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

            <FormSubmit>Create</FormSubmit>
            {error && <p className="text-red-700">{error}</p>}
          </form>
        </div>
      </div>
    </FormModal>
  );
}
