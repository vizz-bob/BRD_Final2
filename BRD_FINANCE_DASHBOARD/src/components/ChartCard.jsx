const ChartCard = ({ title, subtitle, children, actions, compact }) => (
  <div className={`flex h-full flex-col rounded-2xl border border-brand-border bg-brand-panel ${compact ? 'p-3 sm:p-4' : 'p-4 sm:p-5'} shadow-glow`}>
    <div className={`${compact ? 'mb-2' : 'mb-3 sm:mb-4'} flex items-start justify-between gap-3`}>
      <div className="min-w-0 flex-1">
        <p className="text-base sm:text-lg font-semibold text-brand-text leading-tight">{title}</p>
        {subtitle ? <p className="text-xs sm:text-sm text-brand-text/60 mt-0.5">{subtitle}</p> : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
    <div className="flex-1 min-w-0">{children}</div>
  </div>
)

export default ChartCard