import { api } from "~/utils/api";
import { AppRouter } from "~/server/api/root";
import Modal from "~/components/messages/message/modal";
import { useState } from "react";
import { inferProcedureOutput } from "@trpc/server";

type Message = inferProcedureOutput<AppRouter["message"]["all"]>[number];

const Message = (props: { message: Message }) => {
  const [open, setOpen] = useState<boolean>(false);

  const { message } = props;

  const utils = api.useContext();

  const deleteMessageMutation = api.message.delete.useMutation({
    async onMutate() {
      await utils.message.all.cancel();
      const allMessages = utils.message.all.getData();
      if (!allMessages) {
        return;
      }
      utils.message.all.setData(
        undefined,
        allMessages.filter((m) => m.id != message?.id)
      );
    },
  });

  const handleChange = (v: boolean) => {
    setOpen(v);
  };

  return (
    <div
      className="flex w-[500px] items-center justify-between"
      key={message.id}
    >
      <p>{message.body}</p>
      <span className="space-x-2">
        <button
          className="rounded-lg bg-blue-600 px-2 py-1 text-xs text-white"
          onClick={() => handleChange(true)}
        >
          Edit
        </button>
        <button
          className="rounded-lg bg-red-600 px-2 py-1 text-xs text-white"
          onClick={() => deleteMessageMutation.mutate({ id: message.id })}
        >
          Delete
        </button>
      </span>
      <Modal open={open} handleChange={handleChange} message={message} />
    </div>
  );
};

export default Message;
