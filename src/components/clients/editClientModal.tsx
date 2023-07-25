import { useEffect, useMemo, useState } from "react";
import { api } from "~/utils/api";
import { z } from "zod";
import FormModal from "../modal/formModal";
import { FormInput } from "../modal/formInput";
import { FormSubmit } from "../modal/formSubmit";
import { useZodForm } from "~/utils/useZodForm";
import { Client } from "@prisma/client";
import ControlledAutocomplete from "../library/ControlledAutocomplete";

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
  const { handleChange } = props;
  const utils = api.useContext();
  const [error, setError] = useState<string>("");

  const {
    reset,
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = useZodForm({
    schema: editClientValidationSchema,
    defaultValues: useMemo(() => {
      return props.client;
    }, [props.client]),
  });

  // reset form when client changes
  useEffect(() => {
    reset(props.client);
  }, [props.client, reset]);

  const updateClientMutation = api.clients.update.useMutation({
    async onMutate(newClient) {
      // cancel queries
      await utils.clients.id.cancel();
      const client = await utils.clients.id.getData({
        id: newClient.id,
      });
      if (!client) return;

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

  return (
    <FormModal {...props}>
      <div className="w-full rounded-lg bg-white shadow dark:border dark:border-gray-700 dark:bg-gray-800  ">
        <div className="space-y-4 p-6 sm:p-8 md:space-y-6">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl">
            Edit Client
          </h1>
          <form
            className="space-y-4 md:space-y-6"
            onSubmit={handleSubmit((data) => updateClientMutation.mutate(data))}
          >
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                attribute="firstName"
                placeholder="First Name"
                register={register}
                errors={errors}
                required
              />
              <FormInput
                attribute="lastName"
                placeholder="Last Name"
                register={register}
                errors={errors}
                required
              />
            </div>
            <div className="grid grid-cols-[9fr_3fr] gap-4">
              <FormInput
                attribute="email"
                placeholder="Email Address"
                register={register}
                errors={errors}
              />

              <FormInput
                attribute="age"
                placeholder="Age"
                register={register}
                errors={errors}
                type="number"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                attribute="homePhone"
                placeholder="Home Number"
                register={register}
                errors={errors}
              />

              <FormInput
                attribute="cellPhone"
                placeholder="Cell Number"
                register={register}
                errors={errors}
              />
            </div>

            <ControlledAutocomplete
              control={control}
              name="notes"
              id="notes"
              options={[]}
              label="Notes"
            />

            <FormSubmit>Save</FormSubmit>
            {error && <p className="text-red-700">{error}</p>}
          </form>
        </div>
      </div>
    </FormModal>
  );
}
