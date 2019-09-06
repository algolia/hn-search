import * as React from "react";
import { DatePickerProps } from "./Datepicker";

const LazyDatepicker: React.FC = React.lazy(() => import("./Datepicker"));

const Datepicker: React.FC<DatePickerProps> = props => {
  if (!props.isOpen) return null;

  return (
    <React.Suspense fallback={null}>
      <LazyDatepicker {...props} />
    </React.Suspense>
  );
};

export default Datepicker;
