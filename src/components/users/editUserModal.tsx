import { useEffect, useMemo, useState } from "react";
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

  const {
    reset,
    formState: { errors, dirtyFields },
    handleSubmit,
    register,
  } = useZodForm({
    schema: editUserValidationSchema,
    defaultValues: useMemo(() => {
      return user;
    }, [user]),
  });

  // reset form when user changes
  useEffect(() => {
    reset(user);
  }, [user, reset]);

  const editUserMutation = api.users.update.useMutation({
    async onMutate(updatedUser) {
      try {
        await utils.users.id.cancel();
        const user = await utils.users.id.getData({
          id: updatedUser.id,
        });
        if (!user) return;

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
      } catch (error) {
        console.error(error);
      }
    },
    onError(error) {
      setError(error.message);
    },
  });

  const onSubmit = async (data: z.infer<typeof editUserValidationSchema>) => {
    // get updated fields
    const updatedFields = Object.fromEntries(
      Object.entries(data).filter(
        ([key]) =>
          dirtyFields[key as keyof z.infer<typeof editUserValidationSchema>]
      )
    );

    // if no fields are updated, close modal
    if (Object.keys(updatedFields).length === 0) return handleChange(false);

    editUserMutation.mutate({
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
            onSubmit={handleSubmit(onSubmit)}
          >
            <FormInput
              errors={errors}
              register={register}
              attribute="firstName"
              placeholder="First Name"
            />
            <FormInput
              errors={errors}
              register={register}
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
