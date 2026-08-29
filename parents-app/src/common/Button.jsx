function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  full = false
}) {

  const variants = {
    primary: "bg-yellow-500 text-white hover:bg-yellow-600",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    outline: "border text-gray-700 hover:bg-gray-50"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant] || variants.primary}
        ${full ? "w-full" : ""}
        px-4 py-2 rounded-lg text-sm font-medium
        transition active:scale-[0.97]
        disabled:opacity-60
      `}
    >
      {children}
    </button>
  );
}

export default Button;