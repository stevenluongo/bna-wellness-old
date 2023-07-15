import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormProps } from "react-hook-form";

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

function useZodForm<TSchema extends z.ZodType>(
  props: Omit<UseFormProps<TSchema["_input"]>, "resolver"> & {
    schema: TSchema;
  }
) {
  const form = useForm<TSchema["_input"]>({
    ...props,
    resolver: zodResolver(props.schema, undefined),
  });

  return form;
}

export default function CreateClientModal(props: ModalProps) {
  const { open, handleChange } = props;
  const cancelButtonRef = useRef(null);

  const router = useRouter();
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
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={() => handleChange(false)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
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
                      <div>
                        <label
                          htmlFor="firstName"
                          className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                        >
                          First Name
                        </label>
                        <input
                          {...methods.register("firstName")}
                          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-blue-600 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm"
                          placeholder="First Name"
                          required
                        />
                        {methods.formState.errors.firstName?.message && (
                          <p className="text-red-700">
                            {methods.formState.errors.firstName?.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="lastName"
                          className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Last Name
                        </label>
                        <input
                          {...methods.register("lastName")}
                          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-blue-600 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm"
                          placeholder="Last Name"
                          required
                        />
                        {methods.formState.errors.lastName?.message && (
                          <p className="text-red-700">
                            {methods.formState.errors.lastName?.message}
                          </p>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="mt-4 w-full rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                      >
                        Create
                      </button>
                      {error && <p className="text-red-700">{error}</p>}
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
