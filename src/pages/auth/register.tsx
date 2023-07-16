import { type NextPage } from "next";
import { z } from "zod";
import { useState, Fragment } from "react";
import { api } from "~/utils/api";
import { Listbox, Transition } from "@headlessui/react";
import { UserRole } from "@prisma/client";
import { Controller } from "react-hook-form";
import { FormInput } from "~/components/modal/formInput";
import { useZodForm } from "~/utils/useZodForm";
import { signIn } from "next-auth/react";

const values = Object.keys(UserRole);

// validation schema is used by server
export const validationSchema = z.object({
  username: z.string().min(4),
  password: z.string().min(4),
  firstName: z.string().min(4),
  lastName: z.string().min(4),
  role: z.enum(["ADMIN", "DEFAULT"]),
});

const Register: NextPage = () => {
  const [error, setError] = useState<string>("");
  const [selected, setSelected] = useState(values[0]);

  const registerMutation = api.auth.register.useMutation({
    onSuccess(payload) {
      console.log(payload);
      signIn();
      methods.reset();
    },
    onError(error) {
      setError(error.message);
    },
  });
  const methods = useZodForm({
    schema: validationSchema,
    defaultValues: {
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "ADMIN",
    },
  });

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto flex flex-col items-center justify-center px-6 py-8 md:h-screen lg:py-0">
        <div className="w-full rounded-lg bg-white shadow dark:border dark:border-gray-700 dark:bg-gray-800 sm:max-w-md md:mt-0 xl:p-0">
          <div className="space-y-4 p-6 sm:p-8 md:space-y-6">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl">
              Register your account
            </h1>
            <form
              className="space-y-4 md:space-y-6"
              onSubmit={methods.handleSubmit((data) =>
                registerMutation.mutate(data)
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
              <FormInput
                attribute="username"
                placeholder="Username"
                methods={methods}
              />
              <FormInput
                attribute="password"
                placeholder="Password"
                methods={methods}
                type="password"
              />

              <Controller
                name="role"
                control={methods.control}
                render={({ field: { onChange } }) => (
                  <Listbox
                    as="div"
                    value={selected}
                    onChange={(e) => {
                      onChange(e as UserRole);
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
                          {Object.keys(UserRole).map((person, personIdx) => (
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
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </Listbox>
                )}
              />

              <button
                type="submit"
                className="mt-4 w-full rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Register
              </button>
              {error && <p className="text-red-700">{error}</p>}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;
