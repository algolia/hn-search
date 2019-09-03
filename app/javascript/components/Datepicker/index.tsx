import * as React from "react";
import { DatePickerProps } from "./DatePicker";

const LazyDatepicker: React.FC = React.lazy(() => import("./Datepicker"));

const Datepicker: React.FC<DatePickerProps> = props => (
  <React.Suspense fallback={null}>
    <LazyDatepicker {...props} />
  </React.Suspense>
);

export default Datepicker;
