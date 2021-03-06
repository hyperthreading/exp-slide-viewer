import React from "react";
import cn from "classnames";
import styles from "./ToolbarItem.module.css";

interface Props {
  children: string;
  selected?: boolean;
  focused?: boolean;
  onClick?: () => void;
}

export default (({ children, selected, focused, onClick }) => {
  return (
    <div
      className={cn(
        styles.toolbarItem,
        focused ? styles.focused : null,
        selected ? styles.selected : null
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}) as React.FC<Props>;
