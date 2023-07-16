import { ReactNode } from "react";

export const FormSubmit = ({ children }: { children: ReactNode }) => {
  return (
    <button
      type="submit"
      className="mt-4 w-full rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
    >
      {children}
    </button>
  );
};
