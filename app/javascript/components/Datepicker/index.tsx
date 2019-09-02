import * as React from "react";

const LazyDatepicker: React.FC = React.lazy(() => import("./Datepicker"));

const Datepicker: React.FC = () => (
  <React.Suspense fallback={null}>
    <LazyDatepicker />
  </React.Suspense>
);

export default Datepicker;
