import { type NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { z } from "zod";
import { useState } from "react";
import { useZodForm } from "~/utils/useZodForm";
import { FormSubmit } from "~/components/modal/formSubmit";
import { FormInput } from "~/components/modal/formInput";

// validation schema is used by server
export const validationSchema = z.object({
  username: z.string().min(4),
  password: z.string().min(4),
});

const SignIn: NextPage = () => {
  const router = useRouter();
  const [error, setError] = useState<string>("");

  const { data: session } = useSession();

  const { callbackUrl } = router.query;

  const handleFormSubmit = async (data: z.infer<typeof validationSchema>) => {
    const res = await signIn("credentials", {
      ...data,
      redirect: false,
      callbackUrl: callbackUrl as string,
    });

    if (!res?.ok) {
      setError(res?.error as string);
      return;
    }

    router.push(res?.url as string);
  };

  const methods = useZodForm({
    schema: validationSchema,
    defaultValues: {
      username: "",
      password: "",
    },
  });

  if (session?.user) {
    router.push("/");
    return null;
  }

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
              <FormInput
                attribute="username"
                placeholder="Username"
                register={methods.register}
                errors={methods.formState.errors}
              />

              <FormInput
                attribute="password"
                placeholder="Password"
                register={methods.register}
                errors={methods.formState.errors}
                type="password"
              />

              <FormSubmit>Sign In</FormSubmit>
              {error && <p className="text-red-700">{error}</p>}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignIn;
