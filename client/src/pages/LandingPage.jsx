import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiDroplet, FiUsers, FiActivity, FiClock, FiHeart, FiShield, FiArrowRight } from 'react-icons/fi'

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.1 } }
}

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

export default function LandingPage() {
  return (
    <div className="bg-[#080808]">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
        >
          <source src="/blood.mp4" type="video/mp4" />
        </video>

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

        {/* Hero content */}
        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          className="relative z-10 text-center max-w-4xl px-6"
        >
          {/* Headline */}
          <motion.h1 variants={itemVariants} className="font-bold leading-tight mb-6 font-['Space_Grotesk'] whitespace-nowrap text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
            <span className="text-white">Be Someone's Reason</span><br />
            <span className="text-red-500">to Survive.</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-xl text-neutral-400 max-w-2xl mx-auto mb-12">
            Stop sharing on WhatsApp. Start saving through a system that actually works.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] text-lg flex items-center justify-center">
              Register as Donor
            </Link>
            <Link to="/login" className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 text-lg flex items-center justify-center gap-2">
              Request Blood <FiArrowRight />
            </Link>
          </motion.div>
        </motion.div>

      </section>

      {/* Stats Bar */}
      <section className="border-y border-white/5 bg-white/[0.02] py-12">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '2,847', label: 'Donors Registered' },
            { value: '1,203', label: 'Lives Saved' },
            { value: '8', label: 'Blood Groups' },
            { value: '<2min', label: 'Avg Match Time' },
          ].map(stat => (
            <div key={stat.label}>
              <p className="text-4xl font-bold text-red-500 font-['Space_Grotesk']">{stat.value}</p>
              <p className="text-sm text-neutral-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Doctor Image Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/dr.jpg')" }}
        />
        {/* Dark gradient overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-[#080808]/30" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-xl">
            <p className="text-red-500 font-semibold text-sm uppercase tracking-widest mb-4">Trusted by Medical Professionals</p>
            <h2 className="text-5xl md:text-6xl font-bold font-['Space_Grotesk'] text-white leading-tight mb-6">
              Saving Lives,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">One Match at a Time.</span>
            </h2>
            <p className="text-neutral-400 text-lg mb-8 leading-relaxed">
              Our platform bridges the critical gap between donors and patients in emergency situations. Every second matters — and we make sure no second is wasted.
            </p>
            <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] text-lg">
              Join as a Donor <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-['Space_Grotesk'] text-white mb-4">How It Works</h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">Our smart matching engine connects patients in need with the closest eligible donors in three simple steps.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: '01', title: 'Submit Request', desc: 'Hospitals or patients submit an emergency blood request specifying the required blood group and urgency.', img: '/r.jpg' },
              { num: '02', title: 'Get Verified',   desc: 'Our system automatically verifies the request with the hospital to prevent false alarms and ensure validity.', img: '/v.jpg' },
              { num: '03', title: 'Match & Donate', desc: 'Eligible nearby donors receive instant alerts. They accept the request and head directly to the hospital.', img: '/d.jpg' },
            ].map((step, idx) => (
              <div
                key={idx}
                className="group relative rounded-2xl overflow-hidden border border-white/10 cursor-pointer"
                style={{ minHeight: '380px' }}
              >
                {/* Background Image with zoom on hover */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-110"
                  style={{ backgroundImage: `url('${step.img}')` }}
                />
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/60 to-[#080808]/20 group-hover:via-[#080808]/50 transition-all duration-500" />

                {/* Content */}
                <div className="relative z-10 p-8 flex flex-col justify-end h-full" style={{ minHeight: '380px' }}>
                  <div className="text-red-500 font-bold font-['Space_Grotesk'] text-4xl mb-3 opacity-80">{step.num}</div>
                  <h3 className="text-2xl font-bold text-white mb-3 font-['Space_Grotesk']">{step.title}</h3>
                  <p className="text-neutral-300 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
