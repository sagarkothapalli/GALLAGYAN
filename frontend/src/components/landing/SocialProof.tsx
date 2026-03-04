export function SocialProof() {
  const testimonials = [
    {
      quote: 'I used to dread tax season. SteadyStack helped me set aside the right amount every quarter. No more surprises.',
      name: 'Jamie K.',
      role: 'Freelance Designer, 3 years',
      metric: 'Saved $4,200 in year one',
    },
    {
      quote: 'The income smoothing concept changed everything. I finally pay myself a steady salary instead of living feast to famine.',
      name: 'Alex M.',
      role: 'Web Developer, 5 years',
      metric: 'Consistent $6K/mo salary',
    },
    {
      quote: 'The calculator told me I was undercharging by 40%. I raised my rates and no one blinked. That tool alone was worth it.',
      name: 'Priya S.',
      role: 'Marketing Consultant',
      metric: 'Raised rate from $85 to $120/hr',
    },
  ];

  return (
    <section className="section-padding bg-gray-50 dark:bg-navy-900">
      <div className="container-wide">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {[
            { value: '10,000+', label: 'Freelancers trust SteadyStack' },
            { value: '$2.3M', label: 'Tax savings identified' },
            { value: '47%', label: 'Higher engagement with education' },
            { value: '4.8/5', label: 'Average user rating' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-display md:text-display-lg font-heading font-bold text-navy-900 dark:text-white gradient-text">
                {stat.value}
              </p>
              <p className="text-body-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="card p-6">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-body text-gray-700 dark:text-gray-300 mb-4">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-body-sm text-navy-900 dark:text-white">{t.name}</p>
                  <p className="text-caption text-gray-500">{t.role}</p>
                </div>
                <span className="badge-teal text-caption">{t.metric}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
