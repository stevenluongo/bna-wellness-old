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
            <FormInput methods={form} attribute="name" placeholder="Name" />
            <FormInput
              methods={form}
              attribute="description"
              placeholder="Description"
            />
            <FormInput
              methods={form}
              attribute="unitAmount"
              placeholder="Unit Amount"
              type="number"
            />

            <Controller
              name="interval"
              control={form.control}
              render={({ field: { onChange } }) => (
                <Listbox
                  as="div"
                  value={selected}
                  onChange={(e) => {
                    onChange(e as MembershipIntervalType);
                    setSelected(e);
                  }}
                >
                  <div className="relative mt-1">
                    <Listbox.Button className="relative w-full cursor-default rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-left focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                      <span className="block truncate">{selected}</span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"></span>
                    </Listbox.Button>
                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {Object.keys(MembershipIntervalType).map(
                          (person, personIdx) => (
                            <Listbox.Option
                              key={personIdx}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                  active
                                    ? "bg-amber-100 text-amber-900"
                                    : "text-gray-900"
                                }`
                              }
                              value={person}
                            >
                              {({ selected }) => (
                                <>
                                  <span
                                    className={`block truncate ${
                                      selected ? "font-medium" : "font-normal"
                                    }`}
                                  >
                                    {person}
                                  </span>
                                  {selected ? (
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600"></span>
                                  ) : null}
                                </>
                              )}
                            </Listbox.Option>
                          )
                        )}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </Listbox>
              )}
            />

            <FormInput
              methods={form}
              attribute="intervalCount"
              placeholder="Interval Count"
              type="number"
            />

            <FormSubmit>Create</FormSubmit>
            {error && <p className="text-red-700">{error}</p>}
          </form>
        </div>
      </div>
    </FormModal>
  );
}
