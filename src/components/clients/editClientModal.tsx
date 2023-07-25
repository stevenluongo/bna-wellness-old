import { useState } from "react";
import { api } from "~/utils/api";
import { z } from "zod";
import FormModal from "../modal/formModal";
import { FormInput } from "../modal/formInput";
import { FormSubmit } from "../modal/formSubmit";
import { useZodForm } from "~/utils/useZodForm";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Client } from "@prisma/client";

type ModalProps = {
  open: boolean;
  handleChange: (v: boolean) => void;
  client: Client;
};

// validation schema is used by server
export const editClientValidationSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email().nullable(),
  age: z.number().nullable(),
  homePhone: z.string().nullable(),
  cellPhone: z.string().nullable(),
  notes: z.array(z.string()),
  image: z.string().nullable(),
});

export default function EditClientModal(props: ModalProps) {
  const [notes, setNotes] = useState<string[]>([]);

  const { handleChange, client } = props;

  const utils = api.useContext();

  const [error, setError] = useState<string>("");

  const updateClientMutation = api.clients.update.useMutation({
    async onMutate(newClient) {
      // cancel queries
      await utils.clients.all.cancel();

      const client = utils.clients.id.getData({
        id: newClient.id,
      });

      if (!client) return;

      // fetch all clients
      const allClients = await utils.clients.all.fetch();

      if (!allClients) return;

      // update all clients
      utils.clients.all.setData(
        undefined,
        allClients.map((c) => {
          if (c.id === client.id) {
            return {
              ...c,
              ...newClient,
            };
          }
          return c;
        })
      );

      // update client
      utils.clients.id.setData(
        { id: client.id },
        {
          ...client,
          ...newClient,
        }
      );

      // close modal
      handleChange(false);
    },
    onError(error) {
      setError(error.message);
    },
  });

  const methods = useZodForm({
    schema: editClientValidationSchema,
    defaultValues: {
      id: client.id,
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      age: client.age,
      homePhone: client.homePhone,
      cellPhone: client.cellPhone,
      notes: client.notes,
      image: client.image,
    },
  });

  return (
    <FormModal {...props}>
      <div className="w-full rounded-lg bg-white shadow dark:border dark:border-gray-700 dark:bg-gray-800  ">
        <div className="space-y-4 p-6 sm:p-8 md:space-y-6">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl">
            Edit Client
          </h1>
          <form
            className="space-y-4 md:space-y-6"
            onSubmit={methods.handleSubmit((data) =>
              updateClientMutation.mutate(data)
            )}
          >
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                attribute="firstName"
                placeholder="First Name"
                register={methods.register}
                errors={methods.formState.errors}
              />
              <FormInput
                attribute="lastName"
                placeholder="Last Name"
                register={methods.register}
                errors={methods.formState.errors}
              />
            </div>
            <div className="grid grid-cols-[9fr_3fr] gap-4">
              <FormInput
                attribute="email"
                placeholder="Email Address"
                register={methods.register}
                errors={methods.formState.errors}
              />

              <FormInput
                attribute="age"
                placeholder="Age"
                register={methods.register}
                errors={methods.formState.errors}
                type="number"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                attribute="homePhone"
                placeholder="Home Number"
                register={methods.register}
                errors={methods.formState.errors}
              />

              <FormInput
                attribute="cellPhone"
                placeholder="Cell Number"
                register={methods.register}
                errors={methods.formState.errors}
              />
            </div>

            <Autocomplete
              multiple
              id="tags-filled"
              value={notes}
              {...methods.register("notes")}
              options={[]}
              onChange={(e, value) => setNotes(value)}
              freeSolo
              renderInput={(params) => (
                <TextField {...params} label="Notes" placeholder="Notes" />
              )}
            />

            <FormSubmit>Save</FormSubmit>
            {error && <p className="text-red-700">{error}</p>}
          </form>
        </div>
      </div>
    </FormModal>
  );
}
