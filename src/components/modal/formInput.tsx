import { z } from "zod";

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

type CreateMembershipValidation = z.infer<
  typeof createMembershipValidationSchema
>;

export const FormInput = ({
  methods,
  attribute,
  placeholder,
  type,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  methods: any;
  attribute: string;
  placeholder: string;
  type?: string;
}) => {
  return (
    <div>
      <label
        htmlFor={attribute}
        className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
      >
        {placeholder}
      </label>
      <input
        {...methods.register(attribute, {
          valueAsNumber: type == "number" && true,
        })}
        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-blue-600 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm"
        placeholder={placeholder}
        required
        type={type}
      />
      {methods.formState.errors[attribute]?.message && (
        <p className="text-red-700">
          {methods.formState.errors[attribute]?.message}
        </p>
      )}
    </div>
  );
};
