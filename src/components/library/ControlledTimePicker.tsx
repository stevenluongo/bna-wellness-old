import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { Control, Controller } from "react-hook-form";
import moment from "moment";

export default function ControlledTimePicker({
  control,
  name,
  label,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  name: string;
  label: string;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <TimePicker
          label={label}
          ampm
          value={moment(field.value)}
          onChange={(date) => date && field.onChange(date.toDate() as Date)}
        />
      )}
    />
  );
}
