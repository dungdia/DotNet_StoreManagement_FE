import React from "react";

export function useToggle(initialValue = false) {
  const [value, setValue] = React.useState(initialValue);
  const toggle = () => setValue((prevValue) => !prevValue);
  return { value, toggle };
}
