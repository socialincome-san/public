import "./button.css";

export const createButton = ({
  primary = false,
  size = "medium",
  label,
  onClick,
}) => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.innerText = label;
  btn.addEventListener("click", onClick);

  const mode = primary
    ? "bg-so-primary text-xl"
    : "storybook-button--secondary";
  btn.className = ["storybook-button", `storybook-button--${size}`, mode].join(
    " "
  );

  return btn;
};
