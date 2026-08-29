function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error
}) {
  return (
    <div className="space-y-1">

      {label && (
        <label className="text-xs text-gray-500">
          {label}
        </label>
      )}

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`
          w-full px-3 py-3 rounded-lg border text-sm
          focus:outline-none focus:ring-2 focus:ring-yellow-500
          ${error ? "border-red-400" : "border-gray-300"}
        `}
      />

      {error && (
        <p className="text-xs text-red-500">
          {error}
        </p>
      )}

    </div>
  );
}

export default Input;