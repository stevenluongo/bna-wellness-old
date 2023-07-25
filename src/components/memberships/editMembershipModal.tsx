import { useState } from "react";
import { api } from "~/utils/api";
import { z } from "zod";
import FormModal from "../modal/formModal";
import { FormInput } from "../modal/formInput";
import { FormSubmit } from "../modal/formSubmit";
import { useZodForm } from "~/utils/useZodForm";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Client, Membership, MembershipIntervalType } from "@prisma/client";
import { InputBase, InputLabel, MenuItem, Select } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Switch } from "@headlessui/react";

const BootstrapInput = styled(InputBase)(({ theme }) => ({
  "& .MuiInputBase-input": {
    borderRadius: "0.5rem",
    position: "relative",
    backgroundColor: "rgb(249 250 251)",
    border: "1px solid rgb(209 213 219)",
    color: "rgb(17 24 39)",
    padding: "0.625rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    width: "100%",
    transition: theme.transitions.create(["border-color", "box-shadow"]),
    // Use the system font instead of the default Roboto font.
    "&:focus": {
      borderRadius: 4,
      borderColor: "#80bdff",
      boxShadow: "0 0 0 0.2rem rgba(0,123,255,.25)",
    },
  },
}));

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
  const { handleChange, membership } = props;

  const utils = api.useContext();

  const [error, setError] = useState<string>("");

  const editProductMutation = api.products.update.useMutation();

  const updateMembershipMutation = api.memberships.update.useMutation({
    async onMutate(updatedMembership) {
      // cancel queries
      await utils.memberships.all.cancel();

      const membership = utils.memberships.id.getData({
        id: updatedMembership.id,
      });

      if (!membership) return;

      // fetch all clients
      const allMemberships = await utils.memberships.all.fetch();

      if (!allMemberships) return;

      // update all clients
      utils.memberships.all.setData(
        undefined,
        allMemberships.map((m) => {
          if (m.id === membership.id) {
            return {
              ...m,
              ...updatedMembership,
            };
          }
          return m;
        })
      );

      // update client
      utils.memberships.id.setData(
        { id: membership.id },
        {
          ...membership,
          ...updatedMembership,
        }
      );

      // close modal
      handleChange(false);

      // reset form with updated data
      methods.reset({
        ...membership,
        ...updatedMembership,
      });
    },
    onError(error) {
      setError(error.message);
    },
  });

  const methods = useZodForm({
    schema: editMembershipValidationSchema,
    defaultValues: {
      id: membership.id,
      name: membership.name,
      description: membership.description,
    },
  });

  // get dirty fields
  const dirtyFields = methods.formState.dirtyFields;

  const handleSubmit = async (
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

    await editProductMutation.mutateAsync({
      id: membership.stripeProductId,
      ...updatedFields,
    });

    await updateMembershipMutation.mutateAsync({
      id: membership.id,
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
            onSubmit={methods.handleSubmit(handleSubmit)}
          >
            <FormInput
              attribute="name"
              placeholder="Name"
              register={methods.register}
              errors={methods.formState.errors}
            />
            <FormInput
              attribute="description"
              placeholder="Description"
              register={methods.register}
              errors={methods.formState.errors}
            />
            <FormSubmit>Save</FormSubmit>
            {error && <p className="text-red-700">{error}</p>}
          </form>
        </div>
      </div>
    </FormModal>
  );
}

function CustomSelect({
  label,
  methods,
  attribute,
  options,
}: {
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  methods: any;
  attribute: string;
  options: { value: string; placeholder: string }[];
}) {
  return (
    <div>
      <label
        htmlFor="label"
        className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
      >
        {label}
      </label>
      <Select
        {...methods.register(attribute)}
        input={<BootstrapInput />}
        labelId="label"
        id="select"
        value={...methods.watch(attribute)}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.placeholder}
          </MenuItem>
        ))}
      </Select>
    </div>
  );
}
