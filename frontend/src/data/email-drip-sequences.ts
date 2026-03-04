/* ============================================================
   Onboarding Email Drip Sequence
   5 emails over 14 days, triggered after account creation.
   Segmented by Financial Persona for personalization.
   ============================================================ */

export const ONBOARDING_EMAIL_SEQUENCE = [
  {
    id: 'onboarding-1',
    day: 0,
    subject: 'Welcome to SteadyStack — here is your first win',
    preheader: 'One simple action that will save you headaches at tax time.',
    body: `Hi {{first_name}},

Welcome to SteadyStack. You just did something most freelancers put off for years — getting your finances organized.

Here is one thing you can do right now that will save you real money:

**Set up your 3-account system.**

It takes 10 minutes and eliminates the #1 cause of freelancer tax stress — mixing business and personal money.

Here is how it works:
1. Business Checking — all client payments land here first
2. Tax Savings — auto-transfer {{tax_savings_percent}}% of every payment
3. Personal Draw — pay yourself a consistent "salary" monthly

We have already configured your auto-transfer at {{tax_savings_percent}}%. Every time money comes in, the right amount goes to the right place.

**Your Financial Persona: {{persona_label}}**
Based on your quiz results, we have built a personalized learning path for you. Your first lesson is ready in the dashboard.

[Go to your Dashboard]

Talk soon,
The SteadyStack Team

P.S. Questions? Just reply to this email. A real person reads every one.`,
    ctaText: 'Go to your Dashboard',
    ctaUrl: '/dashboard',
  },
  {
    id: 'onboarding-2',
    day: 2,
    subject: 'The number most freelancers get wrong (and how to fix it)',
    preheader: 'Spoiler: it is your hourly rate.',
    body: `Hi {{first_name}},

Here is something that surprises almost every freelancer we work with:

**Most freelancers undercharge by 30-50%.**

It is not because they are bad at their work. It is because the math is wrong. When you divide your desired income by total hours, you forget about:

- Non-billable time (admin, marketing, sales calls)
- Business expenses and overhead
- Taxes (15.3% self-employment tax alone)
- Profit margin for savings and growth

Our Pricing Converter factors all of this in and tells you exactly what you need to charge.

[Try the Pricing Calculator — free]

One user, Priya, discovered she was undercharging by $35/hour. She raised her rate and no client pushed back. That one calculation changed her annual income by over $40,000.

What would the right number mean for you?

Best,
The SteadyStack Team`,
    ctaText: 'Try the Pricing Calculator',
    ctaUrl: '/learn/calculators',
  },
  {
    id: 'onboarding-3',
    day: 5,
    subject: 'Quarterly taxes explained in 2 minutes',
    preheader: 'No jargon. No panic. Just the clear facts.',
    body: `Hi {{first_name}},

If you dread tax season, you are not alone. 73% of freelancers say taxes are their biggest financial stress.

Here is the thing: it does not have to be complicated.

**The basics in 60 seconds:**

As a freelancer, you pay two types of tax:
1. **Self-employment tax** (15.3%) — this covers Social Security and Medicare
2. **Income tax** — based on your bracket, just like a regular job

The IRS wants you to pay quarterly (not once a year). The deadlines are:
- April 15 | June 15 | September 15 | January 15

**How much should you set aside?**

A safe starting point is 25-35% of your net income (gross minus business expenses). We have set your auto-transfer to {{tax_savings_percent}}% based on your income range.

Want the exact number? Our Tax Estimator uses actual tax brackets and your state rate.

[Calculate My Quarterly Payment]

Tomorrow, you will have already started building a tax cushion that grows automatically. No spreadsheets required.

Best,
The SteadyStack Team`,
    ctaText: 'Calculate My Quarterly Payment',
    ctaUrl: '/learn/calculators',
  },
  {
    id: 'onboarding-4',
    day: 9,
    subject: 'How to pay yourself a steady salary (even when income is not)',
    preheader: 'The income smoothing concept that changed everything for our users.',
    body: `Hi {{first_name}},

The feast-or-famine cycle is one of the hardest parts of freelancing. $10K one month, $2K the next. Sound familiar?

There is a concept called **income smoothing** that fixes this, and it is simpler than you think.

**The Salary Floor Method:**

1. Calculate your minimum monthly expenses (rent, food, insurance, etc.)
2. Add a 20% buffer — this is your "salary floor"
3. In good months, only transfer your salary floor to personal
4. The surplus stays in business checking as a buffer
5. In slow months, you still pay yourself the same amount

Example:
- Monthly expenses: $4,000
- Salary floor (with buffer): $4,800
- Good month revenue: $8,000 → transfer $4,800, buffer $3,200
- Slow month revenue: $2,500 → still pay yourself $4,800 from buffer

The key is building a 2-3 month revenue buffer in your business checking. Our tools track this for you automatically.

[Read the full Income Smoothing guide]

This one strategy gives you the stability of a full-time job with the freedom of freelancing.

Best,
The SteadyStack Team`,
    ctaText: 'Read the Income Smoothing Guide',
    ctaUrl: '/learn/income-smoothing-freelancers',
  },
  {
    id: 'onboarding-5',
    day: 14,
    subject: 'Your 2-week check-in (and what is next)',
    preheader: 'Quick wins you have already unlocked, plus your personalized next steps.',
    body: `Hi {{first_name}},

It has been two weeks since you joined SteadyStack. Here is what you have set up:

**Your Progress:**
- 3-Account System: configured
- Tax auto-transfer: {{tax_savings_percent}}%
- Financial Persona: {{persona_label}}
- Lessons completed: {{lessons_completed}}

**Your personalized next steps (based on your {{persona_label}} persona):**

{{#if persona_new_freelancer}}
1. Complete the Emergency Fund Calculator — know your target number
2. Read "The Complete Guide to Quarterly Taxes"
3. Set up expense tracking (we recommend linking your bank account)
{{/if}}

{{#if persona_cash_flow_builder}}
1. Try the Income Smoothing worksheet in your dashboard
2. Read "How to Pay Yourself a Steady Salary"
3. Set up your salary floor and revenue buffer targets
{{/if}}

{{#if persona_tax_optimizer}}
1. Run the Tax Estimator with your real numbers
2. Read "S-Corp vs LLC: Which Saves More?"
3. Consider scheduling a CPA consultation (we have partner discounts)
{{/if}}

{{#if persona_scale_ready}}
1. Use the Pricing Converter to model value-based pricing
2. Read "Hiring Your First Subcontractor"
3. Explore cross-border compliance modules in Premium
{{/if}}

[Continue Your Learning Path]

Want to unlock all calculators, personalized coaching emails, and advanced tools? Upgrade to Pro for just $9/month.

[Explore Pro Plan]

Here is to keeping more of what you earn.

Best,
The SteadyStack Team

P.S. How has your first two weeks been? Reply and let us know — we read every response and it helps us build a better product.`,
    ctaText: 'Continue Your Learning Path',
    ctaUrl: '/dashboard',
  },
];
