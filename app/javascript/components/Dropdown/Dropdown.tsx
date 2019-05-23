import * as React from "react";
import Downshift from "downshift";
import classnames from "classnames";

import "./Dropdown.scss";
import { ChevronUp, ChevronDown } from "react-feather";

type DropdownItem = { value: string; label: string };

interface DropdownProps {
  items: DropdownItem[];
  selectedItem: DropdownItem;
  onChange: (item: DropdownItem) => any;
}

const Dropdown: React.FunctionComponent<DropdownProps> = ({
  onChange,
  selectedItem,
  items
}) => {
  return (
    <Downshift
      onChange={onChange}
      itemToString={item => (item ? item.value : "")}
    >
      {({ getItemProps, getLabelProps, getMenuProps, isOpen, openMenu }) => (
        <div className="Dropdown">
          <label
            className="Dropdown_label"
            {...getLabelProps()}
            onClick={openMenu}
          >
            {selectedItem.label} {isOpen ? <ChevronUp /> : <ChevronDown />}
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
