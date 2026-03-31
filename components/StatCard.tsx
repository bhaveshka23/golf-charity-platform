interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  highlight?: boolean
}

export default function StatCard({ label, value, sub, highlight }: StatCardProps) {
  return (
    <div className={`card-flat rounded-2xl p-6 ${highlight ? 'border-[#166534]/40' : ''}`}>
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className={`text-3xl font-black ${highlight ? 'text-[#166534]' : 'text-slate-900'}`}>{value}</div>
      {sub && <div className="text-xs text-gray-600 mt-1">{sub}</div>}
    </div>
  )
}
