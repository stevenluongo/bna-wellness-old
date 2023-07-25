import { useState } from "react";
import { api } from "~/utils/api";
import { z } from "zod";
import { FormSubmit } from "../modal/formSubmit";
import { FormInput } from "../modal/formInput";
import FormModal from "../modal/formModal";
import { useZodForm } from "~/utils/useZodForm";
import { User } from "@prisma/client";

type ModalProps = {
  open: boolean;
  handleChange: (v: boolean) => void;
  user: Omit<User, "hash" | "salt">;
};

// validation schema is used by server
export const editUserValidationSchema = z.object({
  id: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export default function EditUserModal(props: ModalProps) {
  const { handleChange, user } = props;

  const utils = api.useContext();

  const [error, setError] = useState<string>("");

  const editUserMutation = api.users.update.useMutation({
    async onMutate(updatedUser) {
      try {
        // cancel queries
        await utils.users.all.cancel();

        const user = utils.users.id.getData({
          id: updatedUser.id,
        });

        if (!user) return;

        // fetch all clients
        const allUsers = await utils.users.all.fetch();

        if (!allUsers) return;

        // update all clients
        utils.users.all.setData(
          undefined,
          allUsers.map((m) => {
            if (m.id === user.id) {
              return {
                ...m,
                ...updatedUser,
              };
            }
            return m;
          })
        );

        // update client
        utils.users.id.setData(
          { id: user.id },
          {
            ...user,
            ...updatedUser,
          }
        );

        // close modal
        handleChange(false);

        // reset form with updated data
        form.reset({
          ...user,
          ...updatedUser,
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
    schema: editUserValidationSchema,
    defaultValues: {
      ...user,
    },
  });

  // get dirty fields
  const dirtyFields = form.formState.dirtyFields;

  const handleSubmit = async (
    data: z.infer<typeof editUserValidationSchema>
  ) => {
    // get updated fields
    const updatedFields = Object.fromEntries(
      Object.entries(data).filter(
        ([key]) =>
          dirtyFields[key as keyof z.infer<typeof editUserValidationSchema>]
      )
    );

    // if no fields are updated, close modal
    if (Object.keys(updatedFields).length === 0) return handleChange(false);

    await editUserMutation.mutateAsync({
      id: user.id,
      ...updatedFields,
    });
  };

  return (
    <FormModal {...props}>
      <div className="w-full rounded-lg bg-white shadow dark:border dark:border-gray-700 dark:bg-gray-800  ">
        <div className="space-y-4 p-6 sm:p-8 md:space-y-6">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl">
            Edit User
          </h1>
          <form
            className="space-y-4 md:space-y-6"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormInput
              methods={form}
              attribute="firstName"
              placeholder="First Name"
            />
            <FormInput
              methods={form}
              attribute="lastName"
              placeholder="Last Name"
            />

            <FormSubmit>Save Changes</FormSubmit>
            {error && <p className="text-red-700">{error}</p>}
          </form>
        </div>
      </div>
    </FormModal>
  );
}
