const DonutLegend = ({ items }) => (
  <dl className="mt-2 space-y-2">
    {items.map((item) => (
      <div key={item.label} className="flex items-center gap-2">
        <span className="h-3 w-3 sm:h-4 sm:w-4 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
        <span className="text-xs sm:text-sm text-brand-text truncate">{item.label}</span>
        <span className="ml-auto font-semibold text-xs sm:text-sm text-brand-text shrink-0">{item.value}%</span>
      </div>
    ))}
  </dl>
)

export default DonutLegend