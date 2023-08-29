import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { Control, Controller } from "react-hook-form";
import moment from "moment";

export default function ControlledTimePicker({
  control,
  name,
  label,
  disabled,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  name: string;
  label: string;
  disabled?: boolean;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        return (
          <TimePicker
            label={label}
            disabled={disabled}
            ampm
            value={moment(field.value)}
            onChange={(date) => date && field.onChange(date.toDate() as Date)}
          />
        );
      }}
    />
  );
}
