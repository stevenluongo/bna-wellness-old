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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
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
