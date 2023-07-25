import { useEffect, useMemo, useState } from "react";
import { api } from "~/utils/api";
import { z } from "zod";
import FormModal from "../modal/formModal";
import { FormInput } from "../modal/formInput";
import { FormSubmit } from "../modal/formSubmit";
import { useZodForm } from "~/utils/useZodForm";
import { Membership } from "@prisma/client";

type ModalProps = {
  open: boolean;
  handleChange: (v: boolean) => void;
  membership: Membership;
};

// validation schema is used by server
export const editMembershipValidationSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  unitAmount: z.number().optional(),
  interval: z.enum(["day", "week", "month", "year"]).optional(),
  intervalCount: z.number().optional(),
  stripeProductId: z.string().optional(),
  stripePriceId: z.string().optional(),
});

export default function EditMembershipModal(props: ModalProps) {
  const { handleChange } = props;
  const utils = api.useContext();
  const [error, setError] = useState<string>("");
  const editProductMutation = api.products.update.useMutation();

  const {
    formState: { dirtyFields, errors },
    register,
    handleSubmit,
    reset,
  } = useZodForm({
    schema: editMembershipValidationSchema,
    defaultValues: useMemo(() => {
      return props.membership;
    }, [props.membership]),
  });

  // reset form when membership changes
  useEffect(() => {
    reset(props.membership);
  }, [props.membership, reset]);

  const updateMembershipMutation = api.memberships.update.useMutation({
    async onMutate(updatedMembership) {
      // cancel queries
      await utils.memberships.id.cancel();
      const membership = await utils.memberships.id.getData({
        id: updatedMembership.id,
      });

      if (!membership) return;

      // update membership
      utils.memberships.id.setData(
        { id: membership.id },
        {
          ...membership,
          ...updatedMembership,
        }
      );
      // close modal
      handleChange(false);
    },
    onError(error) {
      setError(error.message);
    },
  });

  const onSubmit = async (
    data: z.infer<typeof editMembershipValidationSchema>
  ) => {
    // get updated fields
    const updatedFields = Object.fromEntries(
      Object.entries(data).filter(
        ([key]) =>
          dirtyFields[
            key as keyof z.infer<typeof editMembershipValidationSchema>
          ]
      )
    );

    // if no fields are updated, close modal
    if (Object.keys(updatedFields).length === 0) return handleChange(false);

    editProductMutation.mutate({
      id: props.membership.stripeProductId,
      ...updatedFields,
    });

    updateMembershipMutation.mutate({
      id: props.membership.id,
      ...updatedFields,
    });
  };
  return (
    <FormModal {...props}>
      <div className="w-full rounded-lg bg-white shadow dark:border dark:border-gray-700 dark:bg-gray-800  ">
        <div className="space-y-4 p-6 sm:p-8 md:space-y-6">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl">
            Edit Membership
          </h1>
          <form
            className="space-y-4 md:space-y-6"
            onSubmit={handleSubmit(onSubmit)}
          >
            <FormInput
              attribute="name"
              placeholder="Name"
              register={register}
              errors={errors}
            />
            <FormInput
              attribute="description"
              placeholder="Description"
              register={register}
              errors={errors}
            />
            <FormSubmit>Save</FormSubmit>
            {error && <p className="text-red-700">{error}</p>}
          </form>
        </div>
      </div>
    </FormModal>
  );
}
