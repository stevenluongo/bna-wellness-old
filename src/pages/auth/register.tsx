import { type NextPage } from "next";
import { z } from "zod";
import { useState } from "react";
import { api } from "~/utils/api";
import { UserRole } from "@prisma/client";
import { FormInput } from "~/components/modal/formInput";
import { useZodForm } from "~/utils/useZodForm";
import { signIn } from "next-auth/react";
import ControlledSelect from "~/components/library/ControlledSelect";
import { FormSubmit } from "~/components/modal/formSubmit";

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

  const registerMutation = api.auth.register.useMutation({
    onSuccess() {
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
      role: "DEFAULT",
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
                register={methods.register}
                errors={methods.formState.errors}
              />
              <FormInput
                attribute="lastName"
                placeholder="Last Name"
                register={methods.register}
                errors={methods.formState.errors}
              />
              <FormInput
                attribute="username"
                placeholder="Username"
                register={methods.register}
                errors={methods.formState.errors}
                autoComplete="new-password"
              />
              <FormInput
                attribute="password"
                placeholder="Password"
                register={methods.register}
                errors={methods.formState.errors}
                type="password"
                autoComplete="new-password"
              />

              <ControlledSelect
                name="role"
                control={methods.control}
                values={values}
                label="Role"
                labelId="role-label"
                selectId="role-select"
              />

              <FormSubmit>Register</FormSubmit>
              {error && <p className="text-red-700">{error}</p>}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;
