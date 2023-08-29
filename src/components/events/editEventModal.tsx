/* eslint-disable @typescript-eslint/no-non-null-assertion */
import FormModal from "../modal/formModal";
import { api } from "~/utils/api";
import { Check } from "@prisma/client";

type ModalProps = {
  open: boolean;
  handleChange: (v: boolean) => void;
  roomId: string;
  check: Check | null;
  weekStart: string;
};

const EditEventModal = (props: ModalProps) => {
  const { weekStart, roomId, check } = props;

  const utils = api.useContext();

  const deleteCheckMutation = api.checks.delete.useMutation({
    async onMutate(data) {
      try {
        await utils.weeks.id.cancel();
        const week = utils.weeks.id.getData({
          weekStart,
          roomId,
        });
        if (!week) {
          return;
        }
        const updatedChecks = week.checks.filter((c) => c.id !== data.id);
        const updatedWeek = {
          ...week,
          createdAt: new Date(),
          checks: updatedChecks,
        };
        utils.weeks.id.setData({ weekStart, roomId }, updatedWeek);
        // close modal
        props.handleChange(false);
      } catch (err) {
        console.error(err);
      }
    },
  });

  return (
    <FormModal {...props}>
      <div className="w-full rounded-lg bg-white shadow dark:border dark:border-gray-700 dark:bg-gray-800  ">
        <div className="space-y-4 p-6 sm:p-8 md:space-y-6">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl">
            Check
          </h1>
          <div className="flex">
            <button className="bg-[blue] p-2">View</button>
            <button
              onClick={() =>
                deleteCheckMutation.mutate({ id: check?.id as string })
              }
              className="bg-[red] p-2"
            >
              delete{" "}
            </button>
          </div>
        </div>
      </div>
    </FormModal>
  );
};

export default EditEventModal;
