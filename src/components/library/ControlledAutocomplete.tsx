/* eslint-disable @typescript-eslint/no-explicit-any */
import { Autocomplete, TextField } from "@mui/material";
import { Controller } from "react-hook-form";

export default function ControlledAutocomplete({
  control,
  name,
  id,
  options,
  label,
}: {
  control: any;
  name: string;
  id: string;
  options: any[];
  label: string;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Autocomplete
          multiple
          id={id}
          value={field.value}
          options={options}
          onChange={(e, value) => field.onChange(value)}
          freeSolo
          renderInput={(params) => (
            <TextField {...params} label={label} placeholder={label} />
          )}
        />
      )}
    />
  );
}
