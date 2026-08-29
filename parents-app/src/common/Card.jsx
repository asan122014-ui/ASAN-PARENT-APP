function Card({
  children,
  className = "",
  hover = true
}) {
  return (
    <div
      className={`
        bg-white rounded-xl p-4 shadow-sm
        ${hover ? "hover:shadow-md transition" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export default Card;