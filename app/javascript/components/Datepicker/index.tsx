import * as React from "react";
import { DatePickerProps } from "./DatePicker";

const Datepicker: React.FC<DatePickerProps> = props => {
  if (!props.isOpen) return null;
  const LazyDatepicker: React.FC = React.lazy(() => import("./Datepicker"));

  return (
    <React.Suspense fallback={null}>
      <LazyDatepicker {...props} />
    </React.Suspense>
  );
};

export default Datepicker;
