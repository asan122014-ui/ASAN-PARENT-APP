import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

function FloatingInput({
  label,
  value,
  onChange,
  type = "text",
  icon: Icon,
  isPassword = false
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">

      {/* ICON */}
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
      )}

      {/* INPUT */}
      <input
        type={isPassword ? (showPassword ? "text" : "password") : type}
        value={value}
        onChange={onChange}
        placeholder=" "
        className="peer w-full border border-gray-300 rounded-xl pl-10 pr-12 pt-6 pb-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
      />

      {/* LABEL */}
      <label
        className="absolute left-10 top-2 text-sm text-gray-500 transition-all
        peer-placeholder-shown:top-4 
        peer-placeholder-shown:text-base
        peer-focus:top-2 
        peer-focus:text-sm 
        peer-focus:text-yellow-500"
      >
        {label}
      </label>

      {/* PASSWORD TOGGLE */}
      {isPassword && (
        <div
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </div>
      )}
    </div>
  );
}

export default FloatingInput;