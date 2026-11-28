export function SummaryRing({ value, total, label }: { value: number; total: number; label: string }) {
  const percent = total ? Math.round(value / total * 100) : 0;
  return <div className="summary-ring" style={{ backgroundImage: `conic-gradient(#387965 ${percent}%, #e8eeeb 0)` }}>
    <div><strong>{percent}<small>%</small></strong><span>{label}</span></div>
  </div>;
}
