/* eslint-disable @typescript-eslint/no-explicit-any */
import { Control, Controller } from "react-hook-form";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
    },
  },
};

export default function ControlledMultiSelect({
  control,
  label,
  name,
  labelId,
  selectId,
  values,
}: {
  control: Control<any>;
  label: string;
  name: string;
  labelId: string;
  selectId: string;
  values: any[] | undefined;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControl sx={{ width: "100%" }}>
          <InputLabel id={labelId}>{label}</InputLabel>
          <Select
            labelId={labelId}
            id={selectId}
            multiple
            value={field.value}
            onChange={(e) => {
              field.onChange(e.target.value as string[]);
            }}
            input={<OutlinedInput label={label} />}
            renderValue={(selected) =>
              selected
                .map((s: any) => JSON.parse(s))
                .map((s: any) => `${s.firstName} ${s.lastName}`)
                .join(", ")
            }
            MenuProps={MenuProps}
          >
            {values?.map((v) => (
              <MenuItem key={v.id} value={JSON.stringify(v)}>
                <Checkbox
                  checked={field.value.indexOf(JSON.stringify(v)) > -1}
                />
                <ListItemText primary={`${v.firstName} ${v.lastName}`} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    />
  );
}
