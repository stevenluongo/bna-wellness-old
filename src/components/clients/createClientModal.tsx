import { useState } from "react";
import { api } from "~/utils/api";
import { z } from "zod";
import FormModal from "../modal/formModal";
import { FormInput } from "../modal/formInput";
import { FormSubmit } from "../modal/formSubmit";
import { useZodForm } from "~/utils/useZodForm";
import ControlledAutocomplete from "../library/ControlledAutocomplete";

type ModalProps = {
  open: boolean;
  handleChange: (v: boolean) => void;
};

// validation schema is used by server
export const createClientValidationSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email().nullable(),
  age: z.number().nullable(),
  homePhone: z.string().nullable(),
  cellPhone: z.string().nullable(),
  notes: z.array(z.string()),
  image: z.string().nullable(),
});

export default function CreateClientModal(props: ModalProps) {
  const { handleChange } = props;
  const utils = api.useContext();
  const [error, setError] = useState<string>("");

  const methods = useZodForm({
    schema: createClientValidationSchema,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      age: 0,
      homePhone: "",
      cellPhone: "",
      notes: [],
      image: null,
    },
  });

  const createClientMutation = api.clients.create.useMutation({
    async onMutate(client) {
      await utils.clients.all.cancel();
      const allClients = utils.clients.all.getData();
      if (!allClients) {
        return;
      }
      utils.clients.all.setData(undefined, [
        ...allClients,
        {
          createdAt: new Date(),
          id: `${Math.random()}`,
          ...client,
        },
      ]);

      methods.reset();
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
            Create Client
          </h1>
          <form
            className="space-y-4 md:space-y-6"
            onSubmit={methods.handleSubmit((data) =>
              createClientMutation.mutate(data)
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

            <ControlledAutocomplete
              control={methods.control}
              name="notes"
              id="notes"
              options={[]}
              label="Notes"
            />

            <FormSubmit>Create</FormSubmit>
            {error && <p className="text-red-700">{error}</p>}
          </form>
        </div>
      </div>
    </FormModal>
  );
}
