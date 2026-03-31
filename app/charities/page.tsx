import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Heart, ArrowLeft } from 'lucide-react'

export default async function CharitiesPage() {
  const supabase = await createClient()
  const { data: charities } = await supabase.from('charities').select('*').order('name')

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-slate-900 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
        <h1 className="text-4xl font-black text-slate-900 mb-2">Our Charities</h1>
        <p className="text-gray-500 mb-12">Every subscription supports one of these causes.</p>
        <div className="grid md:grid-cols-2 gap-6">
          {charities?.map((c) => (
            <div key={c.id} className="card-flat rounded-2xl p-6">
              <div className="w-12 h-12 rounded-full bg-[#166534]/20 flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-[#166534]" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">{c.name}</h2>
              <p className="text-gray-500 leading-relaxed mb-4">{c.description}</p>
              <div className="text-[#166534] font-bold">£{Number(c.total_donations).toLocaleString()} raised</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
