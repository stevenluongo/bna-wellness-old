import { type NextPage } from "next";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormProps } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";

// validation schema is used by server
export const validationSchema = z.object({
  username: z.string().min(4),
  password: z.string().min(4),
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

const SignIn: NextPage = (): JSX.Element => {
  const router = useRouter();
  const [error, setError] = useState<string>("");

  const { callbackUrl } = router.query;

  const handleFormSubmit = async ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) => {
    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
      callbackUrl: callbackUrl as string,
    });

    if (!res?.ok) {
      // handle error
      console.error(res);
      setError(res?.error as string);
      return;
    }

    void router.push(res?.url as string);
  };

  const methods = useZodForm({
    schema: validationSchema,
    defaultValues: {
      username: "",
      password: "",
    },
  });

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto flex flex-col items-center justify-center px-6 py-8 md:h-screen lg:py-0">
        <div className="w-full rounded-lg bg-white shadow dark:border dark:border-gray-700 dark:bg-gray-800 sm:max-w-md md:mt-0 xl:p-0">
          <div className="space-y-4 p-6 sm:p-8 md:space-y-6">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl">
              Sign in to your account
            </h1>
            <form
              className="space-y-4 md:space-y-6"
              onSubmit={methods.handleSubmit(handleFormSubmit)}
            >
              <div>
                <label
                  htmlFor="username"
                  className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Username
                </label>
                <input
                  {...methods.register("username")}
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-blue-600 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm"
                  placeholder="name@company.com"
                  required
                />
                {methods.formState.errors.username?.message && (
                  <p className="text-red-700">
                    {methods.formState.errors.username?.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Password
                </label>
                <input
                  {...methods.register("password")}
                  placeholder="••••••••"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-blue-600 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm"
                  required
                  type="password"
                />
                {methods.formState.errors.password?.message && (
                  <p className="text-red-700">
                    {methods.formState.errors.password?.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="mt-4 w-full rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Sign in
              </button>
              {error && <p className="text-red-700">{error}</p>}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignIn;
