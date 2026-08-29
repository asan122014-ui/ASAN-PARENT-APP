function SummaryCard({
  title,
  value,
  icon: Icon,
  color = "yellow",
  subtitle,
  trend,
  trendValue,
  className = ""
}) {

  const colorStyles = {
    yellow: "bg-yellow-400 text-black",
    blue: "bg-blue-500 text-white",
    green: "bg-green-500 text-white",
    red: "bg-red-500 text-white",
    purple: "bg-purple-500 text-white",
    orange: "bg-orange-500 text-white",
  };

  const borderColors = {
    yellow: "border-yellow-400",
    blue: "border-blue-400",
    green: "border-green-400",
    red: "border-red-400",
    purple: "border-purple-400",
    orange: "border-orange-400",
  };

  const textColors = {
    yellow: "text-yellow-700",
    blue: "text-blue-700",
    green: "text-green-700",
    red: "text-red-700",
    purple: "text-purple-700",
    orange: "text-orange-700",
  };

  const trendColors = {
    up: "text-green-600 bg-green-100",
    down: "text-red-600 bg-red-100",
    neutral: "text-gray-600 bg-gray-100",
  };

  const trendArrow = {
    up: "↑",
    down: "↓",
    neutral: "→",
  };

  return (
    <div
  className={`bg-red-500 rounded-2xl p-5 border-[10px] border-black ${className}`}
>
      {/* Top Section - Title & Icon */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {title}
        </p>
        {Icon && (
          <div className={`p-2 rounded-xl ${colorStyles[color] || colorStyles.yellow}`}>
            <Icon size={16} />
          </div>
        )}
      </div>

      {/* Value Section */}
      <div className="flex items-end justify-between">
        <div>
          <p className={`text-2xl font-bold ${textColors[color] || textColors.yellow}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {/* Trend Indicator */}
        {trend && (
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${trendColors[trend] || trendColors.neutral}`}>
            <span>{trendArrow[trend] || "→"}</span>
            <span>{trendValue || "0%"}</span>
          </div>
        )}
      </div>

      {/* Progress Bar (Optional) */}
      {trendValue && trend === "up" && (
        <div className="mt-3 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-yellow-400 rounded-full transition-all duration-500"
            style={{ width: trendValue }}
          />
        </div>
      )}
    </div>
  );
}

export default SummaryCard;