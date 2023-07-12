import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { api } from "~/utils/api";
import { inferProcedureOutput } from "@trpc/server";
import { AppRouter } from "~/server/api/root";

type Message = inferProcedureOutput<AppRouter["message"]["all"]>[number];

type ModalProps = {
  open: boolean;
  handleChange: (v: boolean) => void;
  message: Message;
};

export default function Modal(props: ModalProps) {
  const { open, message, handleChange } = props;
  const [value, setValue] = useState<string>("");
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    if (message) {
      setValue(message.body);
    }
  }, [message]);

  const utils = api.useContext();

  const updateMessage = api.message.update.useMutation({
    async onMutate(updatedMessage) {
      await utils.message.all.cancel();
      const allMessages = utils.message.all.getData();
      if (!allMessages) {
        return;
      }
      // update the message in the cache
      utils.message.all.setData(
        undefined,
        allMessages.map((t) =>
          t.id === updatedMessage.id
            ? {
                ...t,
                ...updatedMessage,
              }
            : t
        )
      );
      // close modal
      handleChange(false);
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 w-full text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <Dialog.Title
                        as="h3"
                        className="text-base font-semibold leading-6 text-gray-900"
                      >
                        Update Message
                      </Dialog.Title>
                      <div className="mt-2 w-full">
                        <textarea
                          id="message"
                          rows={4}
                          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                          placeholder="Write your thoughts here..."
                          value={value}
                          onChange={(e) => setValue(e.target.value)}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                    onClick={() =>
                      updateMessage.mutate({
                        id: message.id,
                        body: value,
                      })
                    }
                  >
                    Save
                  </button>

                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => handleChange(false)}
                    ref={cancelButtonRef}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
