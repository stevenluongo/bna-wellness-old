import { useState } from "react";
import { api } from "~/utils/api";
import { z } from "zod";
import FormModal from "../modal/formModal";
import { FormInput } from "../modal/formInput";
import { FormSubmit } from "../modal/formSubmit";
import { useZodForm } from "~/utils/useZodForm";

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

  const methods = useZodForm({
    schema: createClientValidationSchema,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: null,
      age: null,
      homePhone: null,
      cellPhone: null,
      notes: [],
      image: null,
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
            <FormInput
              attribute="firstName"
              placeholder="First Name"
              methods={methods}
            />
            <FormInput
              attribute="lastName"
              placeholder="Last Name"
              methods={methods}
            />
            <FormSubmit>Create</FormSubmit>
            {error && <p className="text-red-700">{error}</p>}
          </form>
        </div>
      </div>
    </FormModal>
  );
}
