import * as React from "react";
import classnames from "classnames";

interface LoaderProps {
  size?: "small" | "regular";
}

const Loader: React.SFC<LoaderProps> = ({ size = "regular" }) => {
  return <div className={classnames("Loader", `Loader-${size}`)} />;
};

export default Loader;
