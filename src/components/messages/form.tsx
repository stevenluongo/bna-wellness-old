import { api } from "~/utils/api";
import { z } from "zod";
import { useZodForm } from "~/utils/useZodForm";
import { useSession } from "next-auth/react";

const MessageForm = () => {
  const utils = api.useContext();

  const { data: session } = useSession();

  const createMessageMutation = api.message.create.useMutation({
    async onMutate(message) {
      /**
       * Optimistically update the data
       * with the newly added task
       */
      await utils.message.all.cancel();
      const allMessages = utils.message.all.getData();
      if (!allMessages) {
        return;
      }
      utils.message.all.setData(undefined, [
        ...allMessages,
        {
          ...message,
          createdAt: new Date(),
          id: `${Math.random()}`,
        },
      ]);
      // reset form inputs
      methods.reset();
    },
  });

  const methods = useZodForm({
    schema: z.object({
      body: z.string().min(4),
    }),
    defaultValues: {
      body: "",
    },
  });

  return (
    <form
      className="w-[500px] space-y-4"
      onSubmit={methods.handleSubmit(({ body }) =>
        createMessageMutation.mutate({
          body,
          authorId: session?.user.id as string,
        })
      )}
    >
      <input
        {...methods.register("body")}
        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-blue-600 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm"
        placeholder="Message Title"
        required
      />
      {methods.formState.errors.body?.message && (
        <p className="text-red-700">{methods.formState.errors.body?.message}</p>
      )}
      <button
        type="submit"
        className=" w-full rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        Create Message
      </button>
    </form>
  );
};

export default MessageForm;
