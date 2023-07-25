import { useState, Fragment } from "react";
import { api } from "~/utils/api";
import { z } from "zod";
import { FormSubmit } from "../modal/formSubmit";
import { FormInput } from "../modal/formInput";
import FormModal from "../modal/formModal";
import { Listbox, Transition } from "@headlessui/react";
import { MembershipIntervalType } from "@prisma/client";
import { Controller } from "react-hook-form";
import { useZodForm } from "~/utils/useZodForm";
import ControlledSelect from "../library/ControlledSelect";

const values = Object.keys(MembershipIntervalType);

type ModalProps = {
  open: boolean;
  handleChange: (v: boolean) => void;
};

// validation schema is used by server
export const createMembershipValidationSchema = z.object({
  name: z.string(),
  description: z.string(),
  unitAmount: z.number(),
  interval: z.enum(["day", "week", "month", "year"]),
  intervalCount: z.number(),
  stripeProductId: z.string(),
  stripePriceId: z.string(),
});

export default function CreateMembershipModal(props: ModalProps) {
  const { handleChange } = props;
  const utils = api.useContext();
  const [error, setError] = useState<string>("");
  const [selected, setSelected] = useState(values[0]);
  const createProductMutation = api.products.create.useMutation();

  const form = useZodForm({
    schema: createMembershipValidationSchema,
    defaultValues: {
      name: "",
      description: "",
      unitAmount: 0,
      interval: "month",
      intervalCount: 0,
      stripeProductId: "",
      stripePriceId: "",
    },
  });

  const createMembershipMutation = api.memberships.create.useMutation({
    async onMutate(membership) {
      try {
        await utils.memberships.all.cancel();
        const allMemberships = utils.memberships.all.getData();
        if (!allMemberships) {
          return;
        }
        utils.memberships.all.setData(undefined, [
          ...allMemberships,
          {
            createdAt: new Date(),
            id: `${Math.random()}`,
            isActive: true,
            ...membership,
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

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      const product = await createProductMutation.mutateAsync({
        ...data,
        currency: "usd",
      });

      createMembershipMutation.mutate({
        ...data,
        stripeProductId: product.id,
        stripePriceId: product.default_price as string,
      });
    } catch (e) {
      console.error(e);
    }
  });

  return (
    <FormModal {...props}>
      <div className="w-full rounded-lg bg-white shadow dark:border dark:border-gray-700 dark:bg-gray-800  ">
        <div className="space-y-4 p-6 sm:p-8 md:space-y-6">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl">
            Create Membership
          </h1>
          <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
            <FormInput
              attribute="name"
              placeholder="Name"
              register={form.register}
              errors={form.formState.errors}
            />
            <FormInput
              attribute="description"
              placeholder="Description"
              register={form.register}
              errors={form.formState.errors}
            />
            <FormInput
              attribute="unitAmount"
              placeholder="Unit Amount"
              type="number"
              register={form.register}
              errors={form.formState.errors}
            />

            <ControlledSelect
              name="interval"
              control={form.control}
              label="Interval"
              labelId="interval-label"
              selectId="interval-select"
              values={values}
            />

            <FormInput
              attribute="intervalCount"
              placeholder="Interval Count"
              type="number"
              register={form.register}
              errors={form.formState.errors}
            />

            <FormSubmit>Create</FormSubmit>
            {error && <p className="text-red-700">{error}</p>}
          </form>
        </div>
      </div>
    </FormModal>
  );
}
