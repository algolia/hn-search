import * as React from "react";
import Downshift from "downshift";
import classnames from "classnames";

import "./Dropdown.scss";

import ChevronUp from "react-feather/dist/icons/chevron-up";
import ChevronDown from "react-feather/dist/icons/chevron-down";

type DropdownItem = { value: string; label: React.ReactChild };

interface DropdownProps {
  items: DropdownItem[];
  onChange: (item: DropdownItem) => any;
  selectedItem?: DropdownItem;
}

const Dropdown: React.FunctionComponent<DropdownProps> = ({
  onChange,
  selectedItem,
  items,
  children
}) => {
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
            className="Dropdown_label"
            {...getLabelProps()}
            onClick={() => (isOpen ? closeMenu() : openMenu())}
          >
            {selectedItem ? selectedItem.label : children}{" "}
            {isOpen ? <ChevronUp /> : <ChevronDown />}
          </label>
          <ul
            className={classnames(
              "Dropdown_list",
              isOpen && "Dropdown_list--open"
            )}
            {...getMenuProps()}
          >
            {isOpen
              ? items.map((item, index) => (
                  <li
                    {...getItemProps({
                      key: item.value,
                      index,
                      item
                    })}
                  >
                    {item.label}
                  </li>
                ))
              : null}
          </ul>
        </div>
      )}
    </Downshift>
  );
};

export default Dropdown;
