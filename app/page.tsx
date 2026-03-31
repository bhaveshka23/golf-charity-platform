import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Trophy, Heart, TrendingUp, ChevronRight, Star, ArrowRight, ShieldCheck, CreditCard, ChevronDown } from 'lucide-react'
import LandingNav from '@/components/LandingNav'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: charities } = await supabase
    .from('charities')
    .select('*')
    .limit(3)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-[#166534]/20">
      <LandingNav />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center pt-32 pb-20 px-6 z-10">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/hero-golf-sunrise.jpg" 
            alt="Premium Golf Course Sunrise" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0F172A]/50 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-l from-[#0F172A]/90 via-[#0F172A]/50 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full flex justify-end">
          <div className="max-w-2xl text-left md:pr-12">
            <div className="inline-flex items-center gap-2 bg-[#D4AF37]/20 border border-[#D4AF37]/40 rounded-full px-4 py-1.5 text-xs md:text-sm font-semibold text-[#D4AF37] mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <Star className="w-3.5 h-3.5" />
              <span>The Premium Charity Golf Platform</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6 tracking-tight animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Drive Your Game.<br/>
              <span className="text-[#D4AF37]">Make An Impact.</span>
            </h1>
            <p className="text-base md:text-lg text-slate-200 mb-8 font-medium leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              Track your Stableford scores, compete in exclusive automated prize draws, and effortlessly support the causes that matter to you with every swing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <Link href="/signup" className="bg-[#D4AF37] hover:bg-[#B3922D] text-[#0F172A] px-6 py-3.5 rounded-full font-bold text-base inline-flex items-center justify-center gap-2 shadow-lg transition-all">
                Become a Member <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="#how-it-works" className="bg-transparent border-2 border-white text-white px-6 py-3.5 rounded-full font-bold text-base hover:bg-white hover:text-[#0F172A] transition-all text-center">
                Discover How
              </Link>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-white/50" />
        </div>
      </section>

      {/* Stats Divider (#F1F5F9) */}
      <section className="bg-slate-100 border-b border-slate-200 realtive z-20">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col sm:flex-row items-center justify-center gap-12 text-center sm:text-left divide-y sm:divide-y-0 sm:divide-x divide-slate-300">
          {[
            { value: '£40K+', label: 'Monthly Prize Pool' },
            { value: 'Automated', label: 'Draw System' },
            { value: 'Premium', label: 'Score Tracking' },
          ].map((s, i) => (
            <div key={s.label} className={i !== 0 ? 'sm:pl-12 pt-6 sm:pt-0' : ''}>
              <div className="text-3xl font-black text-[#166534]">{s.value}</div>
              <div className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works (#F8FAFC) */}
      <section id="how-it-works" className="bg-slate-50 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">Engineered for Excellence.</h2>
            <p className="text-lg text-slate-500">A seamless three-step process to transform your golf game into charitable impact and exclusive rewards.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: TrendingUp, step: '01', title: 'Track Your Scores', desc: 'Securely enter your last 5 Stableford scores. Our algorithm tracks your rolling average to determine your monthly draw tier.' },
              { icon: Trophy, step: '02', title: 'Enter Monthly Draws', desc: 'Automated entry into our tier-based monthly draws. Match 3, 4, or 5 numbers for premium payout tiers. Unclaimed jackpots rollover.' },
              { icon: Heart, step: '03', title: 'Support a Charity', desc: 'Set it and forget it. A minimum of 10% of your subscription is automatically routed to your selected vetted charity partner.' },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="card-flat p-8 relative overflow-hidden group bg-white hover:border-[#166534]/50">
                <div className="absolute top-0 right-0 p-8 text-8xl font-black text-slate-100 transition-transform duration-500 group-hover:-translate-y-4 group-hover:translate-x-4">
                  {step}
                </div>
                <div className="w-14 h-14 bg-[#166534]/10 rounded-2xl flex items-center justify-center mb-6 relative z-10 border border-[#166534]/20 group-hover:bg-[#166534]/20 transition-colors">
                  <Icon className="w-7 h-7 text-[#166534]" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 relative z-10">{title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm relative z-10">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prize Pool (#F1F5F9) */}
      <section className="bg-slate-100 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-32">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">Transparent Prize Structure</h2>
            <p className="text-lg text-slate-500">Our automated payout distribution algorithm ensures fair and consistent prize allocation directly funded by subscriptions.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { match: '5 Numbers', share: '40% Pool', desc: 'Top tier match requirement. Extremely rare. Unclaimed prize pool rolls over to the next month.', icon: ShieldCheck, accent: 'text-[#D4AF37]', bgAccent: 'bg-[#D4AF37]/10', borderAccent: 'border-[#D4AF37]/30' },
              { match: '4 Numbers', share: '35% Pool', desc: 'Second tier. Evenly distributed among all winners in the tier based on available funds.', icon: Trophy, accent: 'text-[#166534]', bgAccent: 'bg-[#166534]/10', borderAccent: 'border-[#166534]/20' },
              { match: '3 Numbers', share: '25% Pool', desc: 'Base tier. Accessible algorithmic payout distributed across the widest winner base.', icon: CreditCard, accent: 'text-slate-600', bgAccent: 'bg-slate-200', borderAccent: 'border-slate-300' },
            ].map(({ match, share, desc, icon: Icon, accent, bgAccent, borderAccent }) => (
              <div key={match} className="card-flat p-10 text-center flex flex-col items-center bg-white hover:shadow-xl">
                 <div className={`w-16 h-16 rounded-full ${bgAccent} flex items-center justify-center mb-6 border ${borderAccent}`}>
                    <Icon className={`w-8 h-8 ${accent}`} />
                 </div>
                <div className="text-4xl font-black text-slate-900 mb-2">{share}</div>
                <div className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-4">{match}</div>
                <p className="text-sm text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing / CTA (#F8FAFC) */}
      <section className="bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 py-32 flex flex-col items-center justify-center">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">Ready to elevate your impact?</h2>
            <p className="text-lg text-slate-500">Join the premier platform where your performance on the course translates to real-world charitable impact and exclusive platform rewards.</p>
          </div>
          
          <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8">
            {[
              { plan: 'Monthly Member', price: '£9.99', period: '/month', highlight: false },
              { plan: 'Annual Member', price: '£89.99', period: '/year', highlight: true, saving: 'Save 25%' },
            ].map((p) => (
              <div key={p.plan} className={`card-flat p-10 border-2 ${p.highlight ? 'border-[#166534] shadow-xl relative scale-100 md:scale-105 z-10' : 'border-slate-200 bg-white scale-100'}`}>
                {p.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#166534] text-white px-4 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm">
                    {p.saving} Recommended
                  </div>
                )}
                <div className="font-bold text-xl mb-2 text-slate-900">{p.plan}</div>
                <div className="text-5xl font-black text-[#166534] mb-1">{p.price}</div>
                <div className="text-sm font-medium text-slate-500 mb-8">{p.period}</div>
                
                <ul className="space-y-4 mb-10 border-t border-slate-100 pt-8">
                   {[
                     'Full Score Tracking Dashboard',
                     'Automated Monthly Draw Entry',
                     'Minimum 10% Charity Contribution',
                     'Verified Winner Payouts'
                   ].map((feature, i) => (
                     <li key={i} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                       <div className="w-5 h-5 rounded-full bg-[#166534]/10 flex items-center justify-center shrink-0">
                         <Star className="w-3 h-3 text-[#166534] shrink-0" /> 
                       </div>
                       {feature}
                     </li>
                   ))}
                </ul>
                <Link href="/signup" className={`w-full py-4 rounded-full text-center font-bold text-sm block transition-all ${
                  p.highlight ? 'bg-[#166534] text-white hover:bg-[#14532D] shadow-md hover:shadow-xl' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                }`}>
                  Join the Club
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Multi-column Footer (#0F172A) */}
      <footer className="bg-[#0F172A] pt-20 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-[#D4AF37] flex items-center justify-center text-sm font-black text-[#0F172A]">G</div>
                <span className="font-bold text-white text-xl tracking-tight">GolfGives</span>
              </Link>
              <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
                Empowering the golf community to make a difference through automated charitable contributions and competitive rewards.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Platform</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><Link href="#how-it-works" className="hover:text-[#D4AF37] transition-colors">How it Works</Link></li>
                <li><Link href="/charities" className="hover:text-[#D4AF37] transition-colors">Charities</Link></li>
                <li><Link href="/signup" className="hover:text-[#D4AF37] transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Portal</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><Link href="/login" className="hover:text-[#D4AF37] transition-colors">Subscriber Login</Link></li>
                <li><Link href="/admin-login" className="hover:text-[#D4AF37] transition-colors">Admin Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Legal</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><Link href="#" className="hover:text-[#D4AF37] transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-[#D4AF37] transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 font-medium">
            <div>© {new Date().getFullYear()} GolfGives Platform. All rights reserved.</div>
            <div className="flex items-center gap-2">Designed for the Fairway</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
