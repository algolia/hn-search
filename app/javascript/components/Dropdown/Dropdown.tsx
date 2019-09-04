import * as React from "react";
import Downshift from "downshift";
import classnames from "classnames";

import "./Dropdown.scss";

import ChevronUp from "react-feather/dist/icons/chevron-up";
import ChevronDown from "react-feather/dist/icons/chevron-down";
import { CSSTransition } from "react-transition-group";

type DropdownItem = { value: string; label: React.ReactChild };

interface DropdownProps {
  items: DropdownItem[];
  onChange: (item: DropdownItem) => any;
  selectedItem?: DropdownItem;
  fixed?: boolean;
}

const Dropdown: React.FunctionComponent<DropdownProps> = ({
  onChange,
  selectedItem,
  fixed,
  items,
  children
}) => {
  const labelRef = React.useRef<HTMLLabelElement>();

  const getStyleProps = (): React.CSSProperties => {
    if (fixed && labelRef.current) {
      const coordinates = labelRef.current.getBoundingClientRect();
      return {
        position: "fixed",
        left: coordinates.left + coordinates.width,
        top: coordinates.top + coordinates.height,
        zIndex: 50
      };
    }
    return { position: "absolute" };
  };

  return (
    <Downshift
      onChange={onChange}
      itemToString={item => (item ? item.value : "")}
    >
      {({
        getItemProps,
        getLabelProps,
        getMenuProps,
        isOpen,
        openMenu,
        closeMenu
      }) => (
        <div className="Dropdown">
          <label
            {...getLabelProps()}
            ref={labelRef}
            tabIndex="0"
            className="Dropdown_label"
            onClick={() => (isOpen ? closeMenu() : openMenu())}
          >
            {selectedItem ? selectedItem.label : children}{" "}
            {isOpen ? <ChevronUp /> : <ChevronDown />}
          </label>
          <CSSTransition
            classNames="DropdownAnimation"
            in={isOpen}
            timeout={0}
            exit={false}
          >
            <ul
              className={classnames(
                "Dropdown_list",
                isOpen && "Dropdown_list--open"
              )}
              {...getMenuProps()}
              style={getStyleProps()}
            >
              {isOpen
                ? items.map((item, index) => (
                    <li
                      {...getItemProps({
                        key: item.value,
                        index,
                        item
                      })}
                      tabIndex="1"
                    >
                      <button>{item.label}</button>
                    </li>
                  ))
                : null}
            </ul>
          </CSSTransition>
        </div>
      )}
    </Downshift>
  );
};

export default Dropdown;
