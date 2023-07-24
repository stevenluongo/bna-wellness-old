import { FormControl, ListItemText } from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { Control, Controller } from "react-hook-form";

export default function ControlledSelect({
  name,
  control,
  label,
  labelId,
  selectId,
  values,
}: {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  label: string;
  labelId: string;
  selectId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: any[] | undefined;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControl fullWidth>
          <InputLabel id={labelId}>{label}</InputLabel>
          <Select
            labelId={labelId}
            id={selectId}
            value={field.value}
            label={label}
            onChange={(e) => field.onChange(e.target.value)}
          >
            {values?.map((v) => (
              <MenuItem key={v.id} value={JSON.stringify(v)}>
                <ListItemText primary={`${v.firstName} ${v.lastName}`} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    />
  );
}
