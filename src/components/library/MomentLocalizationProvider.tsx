import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { FC, ReactNode } from "react";
import "moment/locale/de";

const MomentLocalizationProvider: FC<{ children: ReactNode }> = ({
  children,
}: {
  children: ReactNode;
}) => {
  return (
    <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="de">
      {children}
    </LocalizationProvider>
  );
};

export default MomentLocalizationProvider;
