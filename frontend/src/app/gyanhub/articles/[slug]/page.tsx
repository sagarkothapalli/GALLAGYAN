'use client';

import { use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import GyanHubNav from '@/components/GyanHubNav';

// Static content for the sample article — more articles can be added here
const ARTICLES: Record<string, {
  title: string; category: string; readTime: string; difficulty: string;
  author: string; date: string; content: { heading?: string; body: string }[];
  relatedSlugs: string[];
}> = {
  'understanding-pe-ratio': {
    title: 'Understanding P/E Ratio: Is a Stock Cheap or Expensive?',
    category: 'Basics',
    readTime: '5 min',
    difficulty: 'Beginner',
    author: 'GyanHub Editorial',
    date: 'March 2026',
    content: [
      { body: 'Before buying anything — a phone, a house, or a stock — you want to know: am I getting good value? For stocks, the Price-to-Earnings (P/E) ratio is the most widely used tool to answer that question.' },
      { heading: 'What is P/E Ratio?', body: 'P/E ratio = Stock Price ÷ Earnings Per Share (EPS).\n\nIf a stock trades at ₹500 and its EPS is ₹25, the P/E is 20. This means investors are willing to pay ₹20 for every ₹1 of annual profit the company earns.' },
      { heading: 'How to Interpret It', body: 'A high P/E (say, 50+) often indicates that investors expect strong future growth — they\'re paying a premium today for tomorrow\'s profits. Think IT companies or startups.\n\nA low P/E (say, 8–12) might indicate the stock is undervalued — or that the market expects the business to decline. Think value traps in cyclical sectors like metals or PSUs.' },
      { heading: 'Nifty 50 Historical P/E', body: 'Nifty 50\'s long-term average P/E is around 20–22. When the index P/E crosses 30, the market is considered expensive by historical standards. When it dips below 15, it\'s generally seen as a buying opportunity.\n\nThis is why many experienced investors use Nifty P/E to decide whether to increase or reduce SIP amounts.' },
      { heading: 'P/E Ratio Traps to Avoid', body: '1. Don\'t compare P/E across sectors. An FMCG stock at P/E 60 may be fair; a steel stock at P/E 20 may be expensive — sectors have different growth profiles.\n\n2. A low P/E can be a value trap. If a company\'s earnings are about to collapse, the "cheap" P/E of today will look very expensive tomorrow.\n\n3. P/E ignores debt. A highly leveraged company may appear cheap on P/E but carries serious risk. Always check the balance sheet too.' },
      { heading: 'P/E vs PEG Ratio', body: 'P/E doesn\'t account for growth. A more complete picture comes from PEG = P/E ÷ EPS Growth Rate.\n\nA PEG below 1 is generally considered attractive — you\'re paying a reasonable price relative to the company\'s growth rate.' },
      { heading: 'The Takeaway', body: 'P/E ratio is a starting point, not a final answer. Use it to compare similar companies within the same sector, track market-level valuations over time, and filter obviously expensive or cheap stocks.\n\nNever buy a stock based on P/E alone — pair it with ROE, debt levels, and business quality.' },
    ],
    relatedSlugs: ['sip-vs-lump-sum', 'index-vs-active-funds', 'read-balance-sheet'],
  },

  'itr-stock-market-income': {
    title: 'How to File ITR for Stock Market Income in India',
    category: 'Taxes',
    readTime: '8 min',
    difficulty: 'Intermediate',
    author: 'GyanHub Editorial',
    date: 'March 2026',
    content: [
      { body: 'If you invest in the stock market, filing your Income Tax Return (ITR) becomes more complex than a simple salary return. You need to report capital gains, dividends, and — if you trade F&O or intraday — business income. Getting this right can save you from a notice and potentially save you lakhs in taxes.' },
      { heading: 'Which ITR Form Do You Need?', body: 'ITR-1 (Sahaj): Only for salary + one house property + interest income. NOT suitable if you have any capital gains.\n\nITR-2: For individuals with capital gains from stocks or mutual funds but NO business or professional income. This covers most investors who do only delivery-based trading.\n\nITR-3: Mandatory if you trade in Futures & Options (F&O) or do intraday equity trading, because SEBI and the Income Tax Act classify both as business income, not capital gains.\n\nExample: Ramesh is a salaried professional who also sold shares and mutual fund units in FY 2025-26. He should file ITR-2, not ITR-1.' },
      { heading: 'Reporting STCG and LTCG', body: 'Schedule CG in ITR-2/ITR-3 is where you declare capital gains. You will need your Capital Gains Statement, which your broker (Zerodha, Groww, HDFC Securities, etc.) generates automatically.\n\nLTCG on listed equity above ₹1.25 lakh is taxable at 12.5% (post Budget 2024). STCG on listed equity is taxed at 20%. These go in separate rows within Schedule CG.\n\nFor LTCG, remember the ₹1.25 lakh annual exemption. If your total LTCG is ₹2 lakh, only ₹75,000 is taxable at 12.5% — meaning ₹9,375 in tax.' },
      { heading: 'F&O Income: Business Rules Apply', body: 'F&O turnover is calculated differently from capital gains. Your "turnover" for tax purposes is the absolute sum of all profits and losses (not your total contract value).\n\nExample: You made a profit of ₹80,000 and a loss of ₹50,000 in F&O during the year. Your turnover is ₹80,000 + ₹50,000 = ₹1,30,000.\n\nIf your F&O turnover is below ₹2 crore and your profit is above 6% of turnover, you can opt for the Presumptive Taxation Scheme under Section 44AD. Otherwise, a tax audit (Form 3CB/3CD) is mandatory. F&O losses can be set off against other business income and carried forward for 8 years.' },
      { heading: 'Advance Tax Obligations', body: 'If your total tax liability after TDS is expected to exceed ₹10,000 in a financial year, you must pay Advance Tax in four instalments:\n\n- 15% by June 15\n- 45% by September 15\n- 75% by December 15\n- 100% by March 15\n\nMissing these instalments attracts interest under Section 234B and 234C. Investors with significant LTCG or F&O profits often fall into the advance tax trap because no TDS is deducted at source on capital gains.' },
      { heading: '26AS and AIS: Your Tax Roadmap', body: 'Form 26AS is your consolidated tax credit statement. It shows TDS deducted by employers, banks, and companies on dividends.\n\nThe Annual Information Statement (AIS) is a newer and far more detailed document available on the income tax portal (incometax.gov.in → AIS). It includes every single buy and sell transaction in your demat account, mutual fund transactions, dividend receipts, and even high-value bank transactions.\n\nAlways reconcile your ITR with your AIS before filing. Any mismatch between what you declare and what AIS shows can trigger a notice under Section 143(1)(a).' },
      { heading: 'Key Deadlines and Common Mistakes', body: 'The standard ITR filing deadline is July 31 for individuals not requiring audit. If you need a tax audit (F&O traders above the threshold), the deadline extends to October 31.\n\nCommon mistakes: (1) Not reporting LTCG because you think the exemption covers everything — you still must declare it in Schedule CG even if it is below ₹1.25 lakh. (2) Forgetting to report foreign MF holdings if you invest in US-focused funds. (3) Not carrying forward F&O losses because you filed ITR-1 by mistake — you lose the carry-forward right permanently.\n\nThis article is for educational purposes only and does not constitute financial or tax advice.' },
    ],
    relatedSlugs: ['stcg-vs-ltcg-india', 'fno-trading-basics', 'dividend-taxation-india-2025'],
  },

  'nifty-vs-sensex': {
    title: "Nifty 50 vs Sensex: What's the Difference?",
    category: 'Basics',
    readTime: '6 min',
    difficulty: 'Beginner',
    author: 'GyanHub Editorial',
    date: 'March 2026',
    content: [
      { body: 'Every evening, the news anchor says "the Sensex fell 400 points" or "the Nifty crossed 23,000." If you have ever wondered whether these are the same thing, or which one you should actually pay attention to, this article gives you the complete picture.' },
      { heading: 'The Sensex: India\'s Oldest Index', body: 'Launched on January 1, 1986, the S&P BSE Sensex (Sensitive Index) is maintained by the Bombay Stock Exchange (BSE), Asia\'s oldest stock exchange founded in 1875. It tracks 30 of the largest, most actively traded companies listed on BSE.\n\nThe Sensex started with a base value of 100 in the year 1978-79. When the Sensex is at 80,000 today, it means those original 30 companies (adjusted for changes over time) have grown 800x in market cap since that base year.' },
      { heading: 'The Nifty 50: The Modern Benchmark', body: 'Launched on April 22, 1996, the Nifty 50 is maintained by NSE Indices Ltd (a subsidiary of the National Stock Exchange). It tracks 50 of the largest companies by free-float market capitalisation across 13 sectors.\n\nNifty\'s base date is November 3, 1995, with a base value of 1,000. At 24,000, the Nifty represents a 24x return from that base — in nominal terms.\n\nBecause it covers 50 stocks across more sectors, the Nifty 50 is widely considered a better representation of the broader Indian economy than the Sensex.' },
      { heading: 'Free-Float Methodology: How Both Are Calculated', body: 'Both indices use free-float market capitalisation, meaning only the shares available for public trading are counted — promoter holdings, government stakes, and strategic holdings are excluded.\n\nExample: If a PSU bank has a total market cap of ₹1,00,000 crore but the government holds 51%, the free-float market cap used for index calculation is only ₹49,000 crore.\n\nThis prevents government-controlled companies from dominating the index just because of their size.' },
      { heading: 'Why Both Indices Move Together', body: 'Since both indices are dominated by the same large-cap giants — Reliance Industries, HDFC Bank, Infosys, TCS, ICICI Bank — they move together more than 98% of the time. If RIL falls 3%, both the Sensex and Nifty will fall.\n\nThe key difference is magnitude. A 1% Nifty move typically corresponds to a 0.97–0.99% Sensex move due to slightly different compositions. For daily tracking, either works.' },
      { heading: 'Beyond Nifty 50: The Family of Indices', body: 'NSE maintains over 350 indices. The most important ones for investors:\n\nNifty Next 50: The 51st to 100th largest companies — often called "tomorrow\'s Nifty 50." It has historically been more volatile but also offered higher long-term returns.\n\nNifty Midcap 150 / Smallcap 250: Broader market benchmarks.\n\nNifty Bank: Tracks 12 most liquid banking stocks. This is the most actively traded index in F&O markets.\n\nNifty IT, Nifty Pharma, Nifty FMCG: Sectoral indices useful for tracking specific industries.\n\nBSE also maintains the BSE Midcap, BSE Smallcap, and BSE 500 indices.' },
      { heading: 'Which Should You Follow?', body: 'For mutual fund investors: Use Nifty 50 as your primary benchmark. Most large-cap funds, index funds, and ETFs are benchmarked to the Nifty 50.\n\nFor stock market news: Either works. Just be consistent — compare today\'s Sensex to yesterday\'s Sensex, not to Nifty.\n\nFor F&O trading: Nifty 50 is the only option, as Nifty futures and options have far higher liquidity than Sensex derivatives.\n\nBottom line: Sensex is more famous for historical reasons; Nifty 50 is the actual working benchmark for India\'s modern financial markets.\n\nThis article is for educational purposes only and does not constitute financial or tax advice.' },
    ],
    relatedSlugs: ['understanding-pe-ratio', 'sip-vs-lump-sum', 'demat-account-guide'],
  },

  'sip-vs-lump-sum': {
    title: 'SIP vs Lump Sum: Which is Better for Indian Investors?',
    category: 'Investing',
    readTime: '7 min',
    difficulty: 'Beginner',
    author: 'GyanHub Editorial',
    date: 'March 2026',
    content: [
      { body: 'One of the most common questions for mutual fund investors is whether to invest all their money at once (Lump Sum) or spread it out over time (SIP). In the volatile Indian market, the answer depends on your goals, the current market valuation, and — crucially — your own psychology.' },
      { heading: 'What is a SIP?', body: 'A Systematic Investment Plan (SIP) allows you to invest a fixed amount in a mutual fund scheme at regular intervals — usually monthly. Most platforms allow SIPs as low as ₹500 per month.\n\nFor example, a ₹5,000 monthly SIP in a Nifty 50 index fund started in January 2015 would have grown to approximately ₹19–21 lakh by January 2025, despite the market falling sharply in March 2020. The total amount invested would have been ₹6 lakh — a ~3x return over 10 years.' },
      { heading: 'The Power of Rupee Cost Averaging', body: 'When the market falls, your fixed SIP amount buys more units. When the market rises, it buys fewer. Over time, your average cost per unit is lower than the market\'s average price during that period.\n\nConcrete example: You invest ₹10,000 every month. In Month 1, NAV is ₹100 — you get 100 units. In Month 2 (market falls), NAV is ₹80 — you get 125 units. In Month 3 (market recovers), NAV is ₹100 again — you get 100 units.\n\nTotal units: 325. Total investment: ₹30,000. Average cost: ₹92.3 per unit vs market average of ₹93.3. This gap widens significantly in highly volatile markets.' },
      { heading: 'When is Lump Sum Better?', body: 'Lump sum investing outperforms SIP when markets are at historical lows or after a major correction. Time in the market beats timing the market — a large corpus invested early has more years to compound.\n\nHistorically, lump sum invested at a Nifty P/E below 15 has consistently outperformed SIP over any subsequent 5-year period. The problem is that no one rings a bell at the market bottom.\n\nIf you receive a large bonus, inheritance, or proceeds from selling a property, and the Nifty is trading at below its long-term average P/E of 22, a lump sum with a 7+ year horizon is worth considering.' },
      { heading: 'Flexi-SIP: The Smart Middle Ground', body: 'Most AMCs now offer Flexi-SIP (also called Top-up SIP or Smart SIP), which automatically increases the invested amount when the market falls beyond a threshold.\n\nFor example, your base SIP is ₹5,000. When the Nifty falls more than 10% from its recent peak, the flexi-SIP automatically doubles to ₹10,000 that month. This amplifies the benefit of rupee cost averaging at exactly the right time.' },
      { heading: 'Systematic Transfer Plan (STP): The Best of Both', body: 'If you have a lump sum ready to deploy but fear investing it all at once, use a Systematic Transfer Plan.\n\nStep 1: Park your ₹10 lakh in a liquid fund (earning ~6-7% annual return).\nStep 2: Set up an STP to transfer ₹83,333 per month into an equity fund (over 12 months).\n\nThis gives your money safety and liquidity in a debt instrument while it waits, while gradually moving into equities without timing risk. It is the strategy most financial planners recommend for large windfalls.' },
      { heading: 'The Behavioural Edge of SIP', body: 'SEBI and AMFI data consistently show that investors in SIPs achieve better real-world returns than investors who invest lump sums, despite lump sums theoretically outperforming on paper. Why? Because lump sum investors tend to panic and sell during corrections, wiping out their advantage.\n\nAutomatic SIPs remove emotion from the equation. The money is debited from your account whether you are watching the news or not. This behavioural discipline is the biggest advantage of SIP — and it is underrated.\n\nThis article is for educational purposes only and does not constitute financial or tax advice.' },
    ],
    relatedSlugs: ['understanding-pe-ratio', 'index-vs-active-funds', 'elss-funds-guide'],
  },

  'dividend-taxation-india-2025': {
    title: 'How Dividend Taxation Works in India (2025)',
    category: 'Taxes',
    readTime: '7 min',
    difficulty: 'Intermediate',
    author: 'GyanHub Editorial',
    date: 'March 2026',
    content: [
      { body: 'Dividends used to be completely tax-free for investors in India — the company paid a "Dividend Distribution Tax" (DDT) before distributing profits. Since April 1, 2020, that system was abolished. Now dividends are taxed directly in your hands, and the rate depends on your income tax slab. This change has significant implications for high-income investors.' },
      { heading: 'Classical vs Imputation System', body: 'Under the old DDT system (pre-2020), companies paid DDT at an effective rate of about 20.56% on distributed profits. Investors received dividends tax-free in their hands.\n\nUnder the current "classical" system, the company pays corporate tax on its profits, and then the investor pays income tax again on the dividend received. This creates a degree of economic double taxation, which is why many tax-efficient investors now prefer growth plans over dividend plans in mutual funds.' },
      { heading: 'TDS on Dividends: The ₹5,000 Threshold', body: 'If the total dividend you receive from a single company in a financial year exceeds ₹5,000, that company is required to deduct TDS at 10% before crediting the dividend to you.\n\nExample: You own 1,000 shares of a company that declares a dividend of ₹8 per share. Your total dividend = ₹8,000. TDS at 10% = ₹800. You receive ₹7,200 in your bank account. The ₹800 appears as a tax credit in your Form 26AS and can be claimed when filing your ITR.\n\nFor non-resident Indians (NRIs), the TDS rate is higher at 20% (plus surcharge and cess) under Section 195.' },
      { heading: 'Dividends as "Other Income" in Your ITR', body: 'Dividends do not get a special flat tax rate like LTCG or STCG. They are added to your total income and taxed at your applicable slab rate.\n\nIf you are in the 30% tax bracket and receive ₹2 lakh in dividends, you will pay ₹60,000 in tax on those dividends (plus surcharge and cess if applicable). This is significantly higher than the 12.5% LTCG rate.\n\nThis is why financial advisors often recommend choosing the "Growth" option in mutual funds over the "IDCW" (Income Distribution cum Capital Withdrawal) option, especially for high earners.' },
      { heading: 'Growth Plan vs IDCW Plan: The Key Difference', body: 'When you invest in a mutual fund, you choose between:\n\nGrowth Plan: Profits stay within the fund. Your NAV grows over time. You pay capital gains tax (LTCG at 12.5% above ₹1.25 lakh) only when you redeem.\n\nIDCW Plan (formerly Dividend Plan): The fund distributes profits periodically. Each distribution is taxed as dividend income at your slab rate, with TDS at 10% for distributions above ₹5,000.\n\nFor a person in the 30% bracket, a ₹50,000 annual distribution from an IDCW plan costs ₹15,000 in tax. The same ₹50,000 in a growth plan, redeemed after 1 year as LTCG, would cost only ₹0 (within the ₹1.25 lakh exemption) or ₹4,687 (at 12.5% above ₹1.25 lakh for the taxable portion).' },
      { heading: 'Dividend Stripping: A Rule to Know', body: 'Dividend stripping is a tax avoidance strategy where investors buy shares just before a dividend record date, claim the dividend, and then sell the shares after the price falls (shares typically fall by the dividend amount on ex-date).\n\nThe Income Tax Act has a specific anti-avoidance rule for this: if you buy shares within 3 months before the record date and sell within 3 months after (or 9 months for mutual funds), any capital loss from the sale is disallowed to the extent of the dividend received.\n\nThis article is for educational purposes only and does not constitute financial or tax advice.' },
      { heading: 'REIT and InvIT Distributions', body: 'Real Estate Investment Trusts (REITs) and Infrastructure Investment Trusts (InvITs) distribute income to unit holders in a complex mix: some portion is interest income (taxed at slab), some is dividend (taxed at slab), and some is return of capital (reduces your cost of acquisition, triggering capital gains on redemption).\n\nEach REIT/InvIT publishes a "distribution breakdown" after every quarterly payout. Investors must use this breakdown when filing taxes. Simply reporting the entire distribution as dividend income is a common mistake.' },
    ],
    relatedSlugs: ['stcg-vs-ltcg-india', 'itr-stock-market-income', 'read-balance-sheet'],
  },

  'fno-trading-basics': {
    title: "What is F&O Trading and Why 90% Traders Lose Money",
    category: 'Options',
    readTime: '10 min',
    difficulty: 'Advanced',
    author: 'GyanHub Editorial',
    date: 'March 2026',
    content: [
      { body: 'A 2023 SEBI study found that 9 out of 10 individual traders in the equity Futures and Options (F&O) segment incurred net losses over a 3-year period. The average loss per losing trader was ₹1.1 lakh per year. Yet, the number of retail participants in F&O continues to grow. Understanding why so many lose — and what the rare winners do differently — is essential financial literacy.' },
      { heading: 'Futures vs Options: The Basics', body: 'A Future is a contract to buy or sell an asset at a predetermined price on a future date. Both buyer and seller are obligated to honour the contract. Futures require a margin deposit (typically 15-20% of the contract value) and offer symmetric profit/loss.\n\nAn Option gives the buyer the right — but not the obligation — to buy (Call) or sell (Put) an asset at a specific price (strike price) before an expiry date. The buyer pays a premium upfront. For the seller (option writer), the premium received is the maximum profit, but the loss can be theoretically unlimited.\n\nExample: Nifty 50 is at 24,000. You buy one lot of the 24,200 Call Option expiring in 30 days for a premium of ₹80 per unit. One lot = 25 units. Total cost = ₹2,000. If Nifty hits 24,500 before expiry, your option is worth at least ₹300 per unit — a 275% return on ₹2,000. But if Nifty stays below 24,200, your entire ₹2,000 is gone.' },
      { heading: 'Lot Size, Margin, and Leverage', body: 'F&O contracts are traded in standardised lot sizes. As of 2025, the minimum lot sizes for popular contracts:\n\nNifty 50: 25 units. At 24,000, one lot contract value = ₹6,00,000. Margin required: ~₹1,20,000.\nBank Nifty: 15 units. Contract value ~₹7,50,000. Margin ~₹1,50,000.\nIndividual stocks: Varies — Reliance lot size is 250 units.\n\nSEBI revised lot sizes upward in 2024 specifically to discourage small retail traders from taking oversized risks. The leverage means a 1% move in Nifty translates to a 5-6% move in your margin capital. That is a double-edged sword.' },
      { heading: 'Why Option Buyers Lose: Theta Decay', body: 'Every option has a "time value" that decreases as expiry approaches — this is called Theta decay. An out-of-the-money option might be worth ₹100 today with 30 days to expiry, ₹60 with 20 days, ₹30 with 10 days, and ₹5 with 2 days — even if the underlying asset hasn\'t moved at all.\n\nThis is why buying options is structurally difficult. The market not only has to move in your direction — it has to move far enough, fast enough, before time destroys your premium. Most retail option buyers are paying for lottery tickets they rarely win.' },
      { heading: 'Why Option Sellers Also Lose', body: 'The popular advice to "sell options and collect premium" sounds appealing — option sellers win on ~70-80% of trades. But the 20-30% losing trades can and do wipe out months of premium income.\n\nIn January 2024, markets fell 4% in a single day following unexpected election results. Option sellers with unhedged short positions in Bank Nifty lost 5-10x their monthly premium income in a few hours. Naked option selling is not passive income — it is picking up pennies in front of a steamroller.\n\nThe professionals who survive long-term in option selling almost always use defined-risk structures: bull put spreads, iron condors, or calendar spreads that cap potential losses.' },
      { heading: 'The Real Cost: STT, Taxes, and Fees', body: 'Even break-even trading destroys capital after costs. For an option buyer, Securities Transaction Tax (STT) is 0.1% of the premium on buy + 0.125% of the intrinsic value on exercise (for exercised ITM options, this can be significant). For futures, STT is 0.0125% on sell side.\n\nAdd exchange transaction charges (~₹2 per lakh), SEBI turnover fee (₹10 per crore), GST, and brokerage, and an active F&O trader can easily pay ₹5,000-15,000 per month in transaction costs alone.\n\nA trader doing 50 option lots per month might pay ₹8,000-10,000 in total costs. Over 12 months, that is ₹96,000-1,20,000 spent just to participate — before accounting for losses. This is why many "almost break-even" traders still end the year deeply in the red.\n\nThis article is for educational purposes only and does not constitute financial or tax advice.' },
      { heading: 'What the Winning 10% Do Differently', body: 'SEBI\'s same study found that the top 1% of F&O traders (by consistency) share common traits:\n\n1. They have defined, rules-based trading systems — not gut-feel trades.\n2. They risk less than 1-2% of capital per trade.\n3. They use options for hedging existing equity portfolios, not pure speculation.\n4. They understand that their edge (if any) is statistical and only plays out over hundreds of trades, not a handful.\n5. Many are primarily option sellers with sophisticated risk management — not naked sellers.\n\nIf you are new to markets, the advice is not to avoid F&O forever, but to build deep understanding of the underlying business and macro environment first. F&O is a tool, not a shortcut to wealth.' },
    ],
    relatedSlugs: ['itr-stock-market-income', 'sectoral-rotation-india', 'index-vs-active-funds'],
  },

  'elss-funds-guide': {
    title: 'ELSS Funds: Save Tax and Grow Wealth at the Same Time',
    category: 'Mutual Funds',
    readTime: '7 min',
    difficulty: 'Beginner',
    author: 'GyanHub Editorial',
    date: 'March 2026',
    content: [
      { body: 'Every year, millions of salaried Indians scramble in February and March to make last-minute investments just to save tax. ELSS — Equity Linked Savings Scheme — is the one instrument that rewards you for not scrambling: it is the only mutual fund category qualifying for Section 80C deductions, and it has historically delivered the highest returns among all 80C instruments.' },
      { heading: 'The 80C Deduction: What You Actually Save', body: 'Under Section 80C, you can invest up to ₹1.5 lakh per financial year in qualifying instruments and deduct that entire amount from your taxable income.\n\nFor someone in the 30% tax bracket: ₹1.5 lakh invested in ELSS reduces taxable income by ₹1.5 lakh, saving ₹45,000 in tax (+ ₹3,600 cess savings = total saving of ₹48,600).\n\nFor someone in the 20% bracket: the saving is approximately ₹31,200.\n\nThis means from day one, your ELSS investment is already "up" by 30% (or 20%) before the market does anything — that is a powerful head start.' },
      { heading: 'The 3-Year Lock-in: Shortest Among 80C Instruments', body: 'ELSS has a mandatory 3-year lock-in period from the date of each investment. Compare this to other 80C options:\n\n- PPF: 15-year lock-in (partial withdrawals allowed after 7 years)\n- NSC: 5-year lock-in\n- Tax-saving FD: 5-year lock-in\n- NPS: Locked until retirement (age 60)\n- ULIP: 5-year lock-in\n\nELSS wins on flexibility. And because equities perform best over longer horizons, the 3-year minimum actually aligns well with the investment horizon required for equity to overcome its short-term volatility.\n\nNote: In SIP mode, each monthly instalment has its own separate 3-year lock-in. A ₹5,000 SIP started in April 2023 means the April 2023 instalment unlocks in April 2026, the May 2023 instalment unlocks in May 2026, and so on.' },
      { heading: 'SIP in ELSS: Start in April, Not March', body: 'The most common — and costly — mistake with ELSS is investing ₹1.5 lakh as a lump sum in March to claim the tax deduction before the financial year closes.\n\nThe smarter strategy: start a ₹12,500 per month SIP at the beginning of the financial year (April). This achieves the same ₹1.5 lakh annual investment with the benefit of rupee cost averaging across 12 months instead of investing at a single (potentially unfavourable) price point.\n\nBonus: By investing monthly, you also avoid the cash flow stress of arranging ₹1.5 lakh at year-end.' },
      { heading: 'LTCG on ELSS After 3 Years', body: 'When you redeem your ELSS units after the 3-year lock-in, any gains are treated as Long-Term Capital Gains (LTCG) from equity mutual funds.\n\nThe tax treatment: gains up to ₹1.25 lakh per year are completely tax-free. Gains above ₹1.25 lakh are taxed at 12.5%.\n\nExample: You invested ₹1.5 lakh in ELSS in 2022-23. After 3 years, the value is ₹2.4 lakh. Your gain is ₹90,000. Since ₹90,000 < ₹1.25 lakh, there is ZERO tax on redemption. You got a ₹45,000 tax deduction going in and paid ₹0 tax coming out. That is the ELSS double-win.' },
      { heading: 'ELSS vs PPF vs NPS: A Practical Comparison', body: 'If your sole goal is tax saving with guaranteed returns and zero risk, PPF and NSC are appropriate. But they are debt instruments — their post-tax real returns (return minus inflation) have historically been close to zero or slightly negative.\n\nNPS (National Pension System) gives an additional ₹50,000 deduction under 80CCD(1B), but money is locked until age 60 and 40% of the corpus must be annuitised.\n\nELSS is the right choice if you have a minimum 5-7 year horizon, can accept equity volatility, and want the potential for real wealth creation alongside tax savings. Historically, well-managed ELSS funds have delivered 12-15% CAGR over 10-year periods, significantly outpacing PPF\'s current 7.1% rate.\n\nThis article is for educational purposes only and does not constitute financial or tax advice.' },
      { heading: 'How to Select an ELSS Fund', body: 'With 40+ ELSS funds available, choosing can be confusing. Key criteria:\n\n1. Consistent long-term performance: Compare 5-year and 10-year returns against the benchmark (Nifty 500 TRI). Avoid funds that have only performed well in the last 1-2 years.\n2. Fund manager track record: Check how long the current manager has been running the fund.\n3. Expense ratio: A difference of 0.5% per year compounds to lakhs over 15-20 years.\n4. Portfolio overlap: If you already have a large-cap fund, check if the ELSS has excessive overlap — you might just be paying two expense ratios for the same holdings.\n5. AUM size: Very large AUMs (above ₹20,000 crore in an actively managed ELSS) can make it hard for managers to take concentrated positions in high-conviction ideas.' },
    ],
    relatedSlugs: ['stcg-vs-ltcg-india', 'sip-vs-lump-sum', 'itr-stock-market-income'],
  },

  'read-balance-sheet': {
    title: 'How to Read a Balance Sheet (For Non-Accountants)',
    category: 'Basics',
    readTime: '9 min',
    difficulty: 'Intermediate',
    author: 'GyanHub Editorial',
    date: 'March 2026',
    content: [
      { body: 'A balance sheet is a "snapshot" of a company\'s financial health at a specific moment in time. While the Profit & Loss (P&L) statement tells you how much money the company made during a period, the Balance Sheet tells you what the company owns and what it owes right now. Together, these two documents tell you if a company is truly building wealth or just reporting profits on paper.' },
      { heading: 'The Golden Equation', body: 'Everything in accounting rests on one identity:\n\nAssets = Liabilities + Shareholders\' Equity\n\nIn plain English: everything a company owns (Assets) was either paid for with borrowed money (Liabilities) or the owners\' own money (Equity). If a company has ₹500 crore in assets, ₹200 crore in debt, and ₹300 crore in equity — the equation balances perfectly.\n\nThis equation always holds. If it doesn\'t in the company\'s published accounts, something is wrong.' },
      { heading: 'Current vs Non-Current Assets', body: 'Assets are split into two buckets:\n\nCurrent Assets: Expected to convert to cash within 12 months. This includes cash and cash equivalents, short-term investments, trade receivables (money owed to the company by customers), and inventory (raw materials, WIP, finished goods).\n\nNon-Current (Fixed) Assets: Long-term assets like property, plant and equipment (PP&E), intangible assets (patents, brand value, goodwill), and long-term investments.\n\nRed flag to watch: If accounts receivable grows faster than revenue, the company is booking sales but not collecting cash. Example: Revenue grows 15% but receivables grow 40% — customers are either struggling to pay or the company is offering increasingly lenient credit terms to inflate sales.' },
      { heading: 'Liabilities and the Danger of Debt', body: 'Liabilities are split into Current (due within 12 months: accounts payable, short-term borrowings, advance payments received) and Non-Current (long-term debt, deferred tax liabilities).\n\nThe Debt-to-Equity (D/E) ratio is the most important single number here: D/E = Total Debt ÷ Shareholders\' Equity.\n\nFor most Indian manufacturing companies, a D/E above 1.5 is worth scrutinising. For capital-intensive infrastructure or real estate companies, 2-3 may be acceptable. For FMCG or IT companies, debt above 0.5 is already unusual and worth questioning.\n\nExample: A mid-cap construction company with ₹800 crore equity and ₹2,000 crore debt has a D/E of 2.5. At 10% interest, it pays ₹200 crore in interest per year. If operating profit is ₹250 crore, interest consumes 80% of it — leaving almost nothing for growth or dividends.' },
      { heading: 'Shareholders\' Equity and Book Value', body: 'Equity = Share Capital + Reserves and Surplus (retained earnings).\n\nBook Value Per Share = Total Equity ÷ Number of Shares Outstanding.\n\nIf a company has ₹3,000 crore in equity and 100 crore shares outstanding, book value per share is ₹30.\n\nPrice-to-Book (P/B) ratio = Market Price ÷ Book Value. A P/B of 5 means the market values the company at 5x its accounting net worth — implying the market believes the company can generate returns well above the cost of capital. PSU banks in India often trade at P/B < 1, signalling the market\'s scepticism about their asset quality.\n\nGoodwill and intangibles are a special case: if a company has ₹500 crore in "goodwill" on its balance sheet from a past acquisition, ask whether that acquisition created real value. Goodwill impairments (write-downs) are a common earnings quality concern.' },
      { heading: 'Key Ratios From the Balance Sheet', body: 'Current Ratio = Current Assets ÷ Current Liabilities. Should ideally be above 1.2. Below 1.0 means the company cannot cover its short-term obligations with its short-term assets — a potential liquidity crisis.\n\nQuick Ratio = (Current Assets - Inventory) ÷ Current Liabilities. A stricter test: inventory is excluded because it may not convert to cash quickly.\n\nInventory Turnover = Revenue ÷ Inventory. A falling inventory turnover ratio means the company is taking longer to sell its goods — could signal weak demand or product obsolescence.\n\nAsset Turnover = Revenue ÷ Total Assets. How efficiently is the company using its assets to generate sales? A high asset turnover is characteristic of lean businesses like software companies; a low asset turnover is typical of capital-heavy manufacturers.' },
      { heading: 'Where to Find Balance Sheets and Red Flags', body: 'In India, you can access balance sheets for any listed company from:\n\n1. NSE website (nseindia.com) → Company > Financials > Annual Report\n2. BSE website (bseindia.com) → same path\n3. Screener.in — the most investor-friendly interface, with 10-year data, automatic ratio calculation, and peer comparison in one view\n4. Trendlyne and Tickertape for additional analytics\n\nRed flags checklist:\n- Cash position shrinking year after year despite reported profits (check if profits are real or just accounting entries)\n- Receivables growing much faster than revenue\n- Long-term borrowings increasing every year without a clear capital expenditure rationale\n- Contingent liabilities (disclosed in notes) that are large relative to equity — these are potential landmines not on the main balance sheet\n- Related-party transactions that seem unusually large (could indicate fund diversion)\n\nThis article is for educational purposes only and does not constitute financial or tax advice.' },
    ],
    relatedSlugs: ['understanding-pe-ratio', 'stcg-vs-ltcg-india', 'sectoral-rotation-india'],
  },

  'sectoral-rotation-india': {
    title: 'Understanding Sectoral Rotation in Indian Markets',
    category: 'Investing',
    readTime: '8 min',
    difficulty: 'Advanced',
    author: 'GyanHub Editorial',
    date: 'March 2026',
    content: [
      { body: 'Have you noticed how in 2022-23, PSU defence and capital goods stocks tripled while IT stocks fell 30%? Or how in 2020, Pharma and FMCG held steady while the rest of the market crashed? This is sectoral rotation in action — the movement of institutional capital from one industry to another based on where we are in the economic cycle. Understanding it doesn\'t guarantee profits, but it explains why your "good" stock can underperform simply because it\'s in the wrong sector at the wrong time.' },
      { heading: 'Why Sectors Behave Differently', body: 'Each sector responds to a different set of economic inputs:\n\nIT and Pharma (exporters): Benefit from a weak Rupee and strong US/global demand. Hurt by Rupee appreciation and global slowdowns.\n\nBanking and NBFCs: Thrive in falling interest rate environments (loan growth + expanding margins) and suffer when NPAs rise during economic slowdowns.\n\nFMCG and Consumer Staples: Defensive sectors — people still buy soap and biscuits during recessions. Tend to outperform when the broader economy slows.\n\nMetals and Mining: Cyclical sectors tied to global commodity prices. China\'s construction activity is often the single biggest driver.\n\nCapex and Infrastructure: Tied to government spending cycles, the Union Budget, and election year spending.' },
      { heading: 'The Rotation Clock: A Framework', body: 'A simplified way to think about sectoral rotation in the context of India\'s economic cycle:\n\nEarly Recovery (after recession/slowdown): Banks and financials typically lead. Credit growth picks up, NPAs have been cleaned up, and rate cuts boost NIMs. Discretionary consumption (autos, retail) also begins to pick up.\n\nExpansion (GDP growth accelerating): Industrials, Capex, and Infrastructure benefit from increased corporate investment. IT also performs well as global tech spending rises.\n\nLate Cycle (boom, high inflation): Commodities, Energy, and Metals perform. Input cost pressures begin hurting consumer-facing businesses.\n\nSlowdown/Contraction: FMCG, Pharma, and Utilities (defensive sectors) become relative outperformers because their revenues are predictable regardless of economic conditions.' },
      { heading: 'India-Specific Triggers', body: 'Indian sectoral rotation has several unique drivers not present in Western markets:\n\nMonsoon and Agriculture: A good monsoon lifts rural incomes, boosting FMCG, two-wheelers, and microfinance. A weak monsoon hurts these sectors and can also drive food inflation.\n\nElection Cycle: Historically, the 12-18 months before and after a general election see a surge in government capex (roads, railways, defence). Capital goods, infrastructure, and PSU companies often outperform during this window.\n\nFII vs DII Flows: Foreign Institutional Investors tend to prefer large-cap IT, Financials, and FMCG (sectors they understand). Domestic mutual funds have been driving the mid-cap and small-cap rally. Tracking monthly FII/DII data can give early signals of which sectors are being accumulated or sold.\n\nGlobal Oil Prices: India imports over 85% of its crude. Rising oil is negative for airlines, paints (TiO2 costs), chemicals, and the Rupee (which then benefits IT and Pharma exporters).' },
      { heading: 'How to Track Sectoral Rotation', body: 'NSE publishes Nifty sectoral indices — Nifty Bank, Nifty IT, Nifty Pharma, Nifty FMCG, Nifty Auto, Nifty Metal, Nifty Realty, Nifty Infra, and more. Tracking these weekly against the Nifty 50 baseline shows you which sectors are leading and which are lagging.\n\nRelative Strength (RS) is the key metric: RS = Sector Index Return ÷ Nifty 50 Return over the same period. A sector with RS > 1 is outperforming the broader market.\n\nFree tools: Screener.in sector dashboards, Trendlyne\'s sector heatmap, and NSE\'s own sectoral index charts are starting points. Many professional investors also track option chain data to see where institutional hedging is concentrated.' },
      { heading: 'The Danger of Chasing Rotation', body: 'Here\'s the hard truth: by the time a sector rotation becomes obvious enough for a retail investor to read about it in the news, the best gains are usually gone.\n\nExample: Nifty Defence Index rose from 1,500 in 2020 to over 7,000 by early 2024 — a near 5x return. The rotation into defence was driven by the 2020 defence budget announcements, visible to anyone reading the Union Budget. But by 2024, when every retail investor had "PSU/defence stocks" in their portfolio, valuations had stretched to 50-80x P/E and many stocks corrected 30-40% from peaks.\n\nSectoral rotation is most valuable as a risk management tool — not as a trading signal. If you understand that IT stocks typically underperform during Rupee appreciation, you can reduce your IT exposure when the Rupee strengthens, rather than waiting for earnings downgrades.\n\nThis article is for educational purposes only and does not constitute financial or tax advice.' },
      { heading: 'Practical Use for Long-Term Investors', body: 'For most individual investors, the practical takeaway from sectoral rotation is not to time sectors perfectly — that is nearly impossible. Instead:\n\n1. Maintain a diversified portfolio across 3-4 sectors at all times. Avoid concentrating more than 30-35% in any single sector.\n2. Use sector P/E data (available on NSE) to identify when a sector has become excessively expensive relative to its own history. Trim, don\'t exit.\n3. Rebalance annually. If IT has run up and now represents 50% of your portfolio (from an intended 25%), trim and redeploy into under-represented sectors.\n4. Sectoral mutual funds or ETFs (e.g., Nifty IT ETF, Nifty Bank ETF) can be used for tactical satellite allocation alongside a core index fund, rather than individual stock picking within sectors.' },
    ],
    relatedSlugs: ['fno-trading-basics', 'index-vs-active-funds', 'understanding-pe-ratio'],
  },

  'stcg-vs-ltcg-india': {
    title: 'Short Term vs Long Term Capital Gains Tax in India',
    category: 'Taxes',
    readTime: '7 min',
    difficulty: 'Beginner',
    author: 'GyanHub Editorial',
    date: 'March 2026',
    content: [
      { body: 'Understanding how your profits from stocks and mutual funds are taxed is as important as making those profits. India\'s capital gains tax framework has undergone significant changes — most recently in the Union Budget 2024. Getting this wrong can mean paying significantly more tax than legally required, or worse, getting a notice from the Income Tax Department.' },
      { heading: 'Equity Shares and Equity Mutual Funds', body: 'For listed equity shares and equity-oriented mutual funds (funds with 65%+ in equities):\n\nShort Term Capital Gains (STCG): Applies if you sell within 12 months of purchase. Tax rate: 20% (increased from 15% in Budget 2024). Applies to the full gain amount with no exemption.\n\nLong Term Capital Gains (LTCG): Applies if you hold for more than 12 months. Tax rate: 12.5% (increased from 10% in Budget 2024). The first ₹1.25 lakh of LTCG per financial year is completely exempt (increased from ₹1 lakh).\n\nExample: You bought 100 shares of a company at ₹800 each (total ₹80,000) and sold at ₹1,400 after 15 months. Gain = ₹60,000 (LTCG). Since ₹60,000 < ₹1.25 lakh, tax = ₹0.' },
      { heading: 'Debt Mutual Funds: The 2023 Rule Change', body: 'Before April 1, 2023, debt mutual funds enjoyed indexation benefits and a 20% LTCG rate after 3 years — making them tax-efficient for investors in the 30% bracket.\n\nAfter the 2023 amendment: All gains from debt mutual funds (regardless of holding period) are now added to your total income and taxed at your applicable slab rate. There is no special rate and no indexation benefit.\n\nThis change significantly reduced the tax advantage of debt mutual funds for high-income investors, making tax-free bonds, SCSS, and bank FDs relatively more competitive for conservative investors.' },
      { heading: 'Real Estate: Indexation Removed for Property Too', body: 'For immovable property, the holding period for LTCG is 24 months (2 years). Post Budget 2024, the LTCG rate for property is 12.5% without indexation (previously 20% with indexation).\n\nThis change hurts long-term property holders significantly. Under the old regime, a property bought for ₹50 lakh in 2010 and sold for ₹1.5 crore in 2024 would have had an indexed cost of ~₹1.05 crore, reducing taxable gain to ₹45 lakh (taxed at 20% = ₹9 lakh). Under the new regime: gain is ₹1 crore, taxed at 12.5% = ₹12.5 lakh. The government provided a transitional option for pre-2001 properties.\n\nNote: A grandfather clause allows investors who acquired certain assets before July 23, 2024, to choose between the old and new regimes — consult a chartered accountant for your specific situation.' },
      { heading: 'Set-Off and Carry-Forward Rules', body: 'Capital losses can be used strategically:\n\nShort Term Capital Loss (STCL) can be set off against both STCG and LTCG in the same year.\n\nLong Term Capital Loss (LTCL) can only be set off against LTCG, not STCG.\n\nIf you cannot fully set off capital losses in the current year, you can carry them forward for up to 8 assessment years. However, you MUST file your ITR before the due date (July 31) to be eligible to carry forward losses — if you miss the deadline, you permanently lose this right.\n\nExample: You made ₹3 lakh LTCG from selling mutual funds but ₹1.5 lakh LTCL from a stock that went wrong. Net LTCG = ₹1.5 lakh. After the ₹1.25 lakh exemption, taxable LTCG = ₹25,000. Tax at 12.5% = ₹3,125.' },
      { heading: 'Tax Loss Harvesting: A Legal Strategy', body: 'Tax loss harvesting is the practice of deliberately selling loss-making positions to offset gains from winning positions — reducing your total tax liability.\n\nEquity LTCG harvesting: Since ₹1.25 lakh of LTCG is tax-free each year, smart investors sell and immediately repurchase equity holdings every year to "reset" the cost basis and book their tax-free gains. ₹1.25 lakh harvested annually at 12.5% saves ₹15,625 per year in future taxes.\n\nTo be effective, the repurchase should happen immediately (same day or next day). There is no "wash sale" rule in India (unlike the US), so this strategy is perfectly legal. SEBI and the IT Act do not disallow immediate repurchase for the purpose of resetting cost basis.' },
      { heading: 'Grandfathering for Pre-January 2018 Gains', body: 'When LTCG tax on equities was reintroduced in Budget 2018 (after 14 years of being exempt), a grandfathering clause protected gains made before January 31, 2018.\n\nFor any equity shares or equity MF units purchased before January 31, 2018: the "cost of acquisition" for LTCG purposes is the higher of the actual purchase price or the highest traded price on January 31, 2018 (as long as it is lower than the actual sale price).\n\nIn practice, this means that for many long-term investors who bought in 2010-2017, a significant portion of the gains from the bull run of those years remains tax-free even today.\n\nThis article is for educational purposes only and does not constitute financial or tax advice.' },
    ],
    relatedSlugs: ['elss-funds-guide', 'itr-stock-market-income', 'dividend-taxation-india-2025'],
  },

  'demat-account-guide': {
    title: 'What is a Demat Account and How to Open One',
    category: 'Basics',
    readTime: '6 min',
    difficulty: 'Beginner',
    author: 'GyanHub Editorial',
    date: 'March 2026',
    content: [
      { body: 'To buy even a single share of a company listed on BSE or NSE, you need a Demat account. Before 1996, share certificates were physical documents — you could literally hold a paper certificate proving ownership. Dematerialisation changed all of that. Today, all shares in India exist only as electronic records in a central depository system. Understanding how this system works is the first step to becoming a confident investor.' },
      { heading: 'NSDL vs CDSL: India\'s Two Depositories', body: 'India has two central securities depositories:\n\nNSDL (National Securities Depository Limited): Promoted by NSE, UTI, and IDBI Bank. The older of the two (established 1996) and historically dominant for large institutional accounts.\n\nCDSL (Central Depository Services Limited): Promoted by BSE. Has grown rapidly among retail investors, particularly through discount brokers like Zerodha (which uses CDSL exclusively) and Groww.\n\nBoth NSDL and CDSL are regulated by SEBI and provide identical safety and functionality. Your shares held with NSDL or CDSL are equally safe — the choice of depository is usually made by your broker, not by you.\n\nAs of 2025, CDSL has over 12 crore active demat accounts, making India one of the fastest-growing retail investor markets globally.' },
      { heading: 'Depository Participant (DP): Your Access Point', body: 'You cannot open a demat account directly with NSDL or CDSL. You access the depository through a Depository Participant (DP) — typically your broker or bank.\n\nWhen you open a demat account with Zerodha, HDFC Securities, or Kotak Securities, the underlying depository account is maintained with either NSDL or CDSL. The broker acts as the intermediary.\n\nThis is an important distinction: if your broker shuts down or loses its SEBI licence, your shares are NOT lost. They continue to exist in the depository. You can transfer your holdings to another DP (broker) by filing a Delivery Instruction Slip (DIS) or a CDSL Easiest/NSDL Speed-e online transfer. SEBI has clear rules requiring brokers to keep client securities in separate accounts, fully ring-fenced from the broker\'s own assets.' },
      { heading: 'Documents Needed to Open a Demat Account', body: 'The KYC (Know Your Customer) process for a Demat account is now largely digital and takes 15-30 minutes online:\n\n1. PAN Card: Mandatory. No PAN, no demat account — there are no exceptions.\n2. Aadhaar Card: Used for e-KYC via OTP. Your mobile number must be linked to Aadhaar.\n3. Bank Account Proof: A cancelled cheque leaf or the first page of your bank passbook showing account number and IFSC code. This links your trading account to your savings account for funds transfer.\n4. Signature: Either upload a photograph of your signature or use Aadhaar e-sign.\n5. Passport-size photograph: Required by most brokers.\n\nFor minors: A demat account can be opened in a minor\'s name with a guardian. It converts to a regular account when the minor turns 18.' },
      { heading: 'Charges, AMC, and POA', body: 'Account Opening Charges: Most discount brokers (Zerodha, Groww, Upstox, Angel One) now offer free account opening. Full-service brokers (ICICI Direct, HDFC Securities, Kotak) may charge ₹500-1,000.\n\nAnnual Maintenance Charges (AMC): Typically ₹300-750 per year. Some brokers waive AMC for the first year. If you have zero holdings in your demat account, most brokers waive AMC.\n\nTransaction Charges: CDSL/NSDL charge a small fee when shares are debited from your account (sold or transferred). This is typically ₹3.5-16 per transaction, depending on the DP.\n\nPower of Attorney (POA): When you open a trading account alongside a demat account, you are often asked to sign a POA giving your broker the right to debit your demat account when you sell shares. SEBI has introduced DDPI (Demat Debit and Pledge Instructions) as a safer alternative to traditional POA, and most brokers now use this instead.' },
      { heading: 'Nomination, Freezing, and Safety', body: 'SEBI made nomination mandatory for all demat accounts in 2023. If you do not add a nominee, your demat account will be "frozen for debits" — meaning you cannot sell your holdings until you comply.\n\nYou can add a nominee online through your broker\'s app or website. Up to 3 nominees can be added with different percentage splits.\n\nIf you do not use your demat account for any transaction for 2 consecutive years, it becomes "inactive." It can be reactivated by submitting a simple request with KYC documents to your DP.\n\nFor tax purposes, remember that dividends, bonus shares, and rights issues are all credited directly to your demat account by the company — you need to track these for accurate ITR filing.\n\nThis article is for educational purposes only and does not constitute financial or tax advice.' },
      { heading: 'Types of Demat Accounts', body: 'Regular Demat Account: For resident Indians. Standard account for holding equity shares, bonds, ETFs, REITs, and InvITs.\n\nRepatriable NRI Account (NRE Demat): For NRIs using funds from NRE bank accounts. Gains can be freely repatriated abroad.\n\nNon-Repatriable NRI Account (NRO Demat): For NRIs using funds from NRO bank accounts. Repatriation has limits (up to USD 1 million per financial year, subject to tax clearance).\n\nBasic Services Demat Account (BSDA): Introduced by SEBI for small investors holding securities worth up to ₹2 lakh. Annual charges are capped at ₹100. If the value exceeds ₹2 lakh, it automatically converts to a regular demat account with standard charges.' },
    ],
    relatedSlugs: ['understanding-pe-ratio', 'sip-vs-lump-sum', 'elss-funds-guide'],
  },

  'index-vs-active-funds': {
    title: 'Index Funds vs Active Funds: The Data Tells the Truth',
    category: 'Mutual Funds',
    readTime: '8 min',
    difficulty: 'Intermediate',
    author: 'GyanHub Editorial',
    date: 'March 2026',
    content: [
      { body: 'For decades, "beating the market" was the assumed goal of mutual fund investing. Every fund house would advertise its star fund managers and their ability to generate "alpha" — returns above the index. But as the Indian market matures and data accumulates, a quieter revolution is underway: index funds and passive ETFs are claiming more and more of India\'s mutual fund assets. The data behind this shift is compelling, and every investor should understand it before choosing a fund.' },
      { heading: 'What is an Index Fund?', body: 'An index fund simply replicates the composition of a market index — typically the Nifty 50 or Nifty Next 50. It buys all 50 (or 100) stocks in exactly the same proportion as their weight in the index. There are no stock-picking decisions, no market timing calls, and minimal human intervention.\n\nBecause there is no active management, the costs are dramatically lower. A typical Nifty 50 index fund has a Total Expense Ratio (TER) of 0.1%–0.2% per year. An actively managed large-cap fund charges 1%–2% per year.\n\nOver 20 years, on a ₹10 lakh investment growing at 12% annually before fees: at 0.1% expense ratio, you end up with ~₹94.9 lakh. At 1.5% expense ratio, you end up with ~₹76.1 lakh. That 1.4% expense ratio difference costs you nearly ₹19 lakh over two decades — almost 20 extra lakhs simply lost to fees.' },
      { heading: 'The SPIVA India Report: What Active Funds Actually Deliver', body: 'SPIVA (S&P Indices Versus Active) publishes an annual India report comparing actively managed funds against their benchmarks. The findings are consistently sobering:\n\nOver a 5-year period: approximately 60-70% of large-cap active funds underperform their benchmark index (Nifty 100 or Nifty 50).\nOver a 10-year period: the underperformance rate rises to 70-80%.\n\nThis is not because the fund managers are incompetent. It is a mathematical reality: after subtracting fees and transaction costs, the average active fund must underperform the index by the amount of fees it charges. Only managers with consistent, genuine skill can overcome this hurdle — and over time, that group gets smaller.\n\nThe 2024 SEBI Categorisation rules that forced large-cap funds to maintain at least 80% in large-cap stocks have made it even harder for large-cap fund managers to differentiate themselves.' },
      { heading: 'Survivorship Bias: The Invisible Distortion', body: 'When you look at the historical returns of mutual funds, you are only seeing the funds that survived. The poorly performing funds were quietly merged into better-performing schemes or wound down entirely.\n\nStudies estimate that survivorship bias overstates the average mutual fund return by 1-2% per year. When you look at a fund with a "10-year track record," you are not seeing the full picture of the active management universe — you are seeing the winners who survived long enough to show up in the data.\n\nIndex funds, by definition, cannot be wound down or rebranded. The Nifty 50 index has always represented the Nifty 50 universe. This makes index fund performance data inherently more honest.' },
      { heading: 'Where Active Management Can Still Win', body: 'The case for passive investing is strongest in Large Cap funds — the most researched, most liquid, and most efficiently priced segment of Indian equities.\n\nThe case is weaker (and active management more defensible) in:\n\nSmall Cap Funds: Many small-cap stocks have no analyst coverage and limited institutional ownership. A skilled fund manager can genuinely find mispriced companies that no algorithm or index will capture. SEBI data shows that over 5-year periods, approximately 50-55% of small-cap active funds still underperform — but the distribution of outcomes is wider, meaning the best small-cap active funds do generate meaningful alpha.\n\nThematic and Sectoral Funds: If you have a strong, informed view on a specific sector (defence, PSU banks, renewable energy), active thematic funds can be a way to express that view with professional management.\n\nFOF and International Funds: The Indian index fund universe does not yet cover all geographies well. Actively managed funds of funds (FOFs) investing in global equities can provide diversification not available through domestic index funds.' },
      { heading: 'Nifty 50 vs S&P 500: Indian Index Options Compared', body: 'For domestic exposure, Nifty 50 index funds are now available from virtually every major AMC:\n\nUTI Nifty 50 Index Fund: One of the oldest, with consistent low tracking error (~0.03%)\nHDFC Index Fund – Nifty 50 Plan: TER of 0.2%, reliable performance\nMirae Asset Nifty 50 ETF: For investors comfortable with exchange-traded formats\n\nFor US market exposure, several Indian AMCs offer Nifty-style passive funds:\nMotilal Oswal S&P 500 Index Fund: Tracks the S&P 500 via a US-listed ETF, offering dollar diversification\nDSP US Flexible Equity Fund: A hybrid active/passive approach\n\nNote: International index funds in India are subject to Indian taxes (treated as debt funds for tax purposes post-2023 rule changes), so the tax efficiency advantage of index funds is partially offset for the international category.' },
      { heading: 'Building a Core-Satellite Portfolio', body: 'A practical framework that uses both approaches:\n\nCore (60-70% of equity portfolio): Nifty 50 index fund + Nifty Next 50 index fund. Low cost, broad market exposure, zero manager risk.\n\nSatellite (30-40%): Carefully selected active mid-cap or small-cap fund with a proven track record of at least 7-10 years, consistent management, and reasonable AUM. This is where you accept the risk of active management in exchange for the potential for alpha.\n\nThe key discipline: review the satellite allocation annually. If the active fund has consistently underperformed its benchmark over 3 consecutive years, replace it without hesitation. Loyalty to a fund house or a fund manager at the cost of performance is an expensive habit.\n\nThis article is for educational purposes only and does not constitute financial or tax advice.' },
    ],
    relatedSlugs: ['understanding-pe-ratio', 'sip-vs-lump-sum', 'sectoral-rotation-india'],
  },
};

const ARTICLE_TITLES: Record<string, string> = {
  'understanding-pe-ratio': 'Understanding P/E Ratio: Is a Stock Cheap or Expensive?',
  'itr-stock-market-income': 'How to File ITR for Stock Market Income in India',
  'nifty-vs-sensex': "Nifty 50 vs Sensex: What's the Difference?",
  'sip-vs-lump-sum': 'SIP vs Lump Sum: Which is Better for Indian Investors?',
  'dividend-taxation-india-2025': 'How Dividend Taxation Works in India (2025)',
  'fno-trading-basics': "What is F&O Trading and Why 90% Traders Lose Money",
  'elss-funds-guide': 'ELSS Funds: Save Tax and Grow Wealth at the Same Time',
  'read-balance-sheet': 'How to Read a Balance Sheet (For Non-Accountants)',
  'sectoral-rotation-india': 'Understanding Sectoral Rotation in Indian Markets',
  'stcg-vs-ltcg-india': 'Short Term vs Long Term Capital Gains Tax in India',
  'demat-account-guide': 'What is a Demat Account and How to Open One',
  'index-vs-active-funds': 'Index Funds vs Active Funds: The Data Tells the Truth',
};

const DIFFICULTY_COLOR: Record<string, string> = {
  Beginner: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Intermediate: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Advanced: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

export default function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const article = ARTICLES[slug];

  // Fallback for articles that don't have full content yet
  if (!article) {
    return (
      <div className="dark">
        <div className="min-h-screen bg-[#050505] text-slate-100 font-sans flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-20 h-20 bg-yellow-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-3xl">📚</div>
            <h1 className="text-2xl font-black text-white mb-3">
              {ARTICLE_TITLES[slug] || 'Article Coming Soon'}
            </h1>
            <p className="text-slate-400 mb-8">This article is being written by our editorial team. Check back soon!</p>
            <Link href="/gyanhub/articles" className="inline-flex items-center gap-2 bg-yellow-500 text-black px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-yellow-400 transition-all">
              <ChevronLeft size={14} /> Browse All Articles
            </Link>
          </div>
          <style jsx global>{`body { background-color: #050505; }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="dark">
      <div className="min-h-screen bg-[#050505] text-slate-100 font-sans">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[10%] w-[40%] h-[40%] bg-yellow-500/6 rounded-full blur-[160px]" />
        </div>

        <GyanHubNav currentPage="Articles" />

        <div className="max-w-3xl mx-auto px-4 py-12 relative z-10">

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded-full border border-yellow-500/20">{article.category}</span>
              <span className={cn('text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border', DIFFICULTY_COLOR[article.difficulty])}>
                {article.difficulty}
              </span>
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                <Clock size={10} /> {article.readTime} read
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-4 leading-[1.15]">
              {article.title}
            </h1>

            <div className="flex items-center gap-3 mb-10 pb-10 border-b border-white/5">
              <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-400 text-xs font-black">G</div>
              <div>
                <p className="text-xs font-bold text-slate-300">{article.author}</p>
                <p className="text-[10px] text-slate-500">{article.date} · Educational content, not financial advice</p>
              </div>
            </div>

            {/* Article body */}
            <div className="space-y-8">
              {article.content.map((section, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  {section.heading && (
                    <h2 className="text-xl font-black text-yellow-400 mb-3">{section.heading}</h2>
                  )}
                  {section.body.split('\n\n').map((para, j) => (
                    <p key={j} className="text-slate-300 leading-relaxed font-medium mb-4">{para}</p>
                  ))}
                </motion.div>
              ))}
            </div>

            {/* Disclaimer */}
            <div className="mt-12 pt-8 border-t border-white/5">
              <p className="text-[10px] text-slate-600 font-medium leading-relaxed">
                * This article is for educational purposes only and does not constitute financial advice. Investments in securities markets are subject to market risks. Read all scheme-related documents carefully before investing. Past performance is not indicative of future returns.
              </p>
            </div>

            {/* Related articles */}
            {article.relatedSlugs.length > 0 && (
              <div className="mt-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Read Next</p>
                <div className="space-y-3">
                  {article.relatedSlugs.map(slug => (
                    <Link key={slug} href={`/gyanhub/articles/${slug}`}
                      className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 hover:border-yellow-500/30 rounded-2xl group transition-all">
                      <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">
                        {ARTICLE_TITLES[slug] || slug}
                      </span>
                      <ChevronRight size={14} className="text-slate-600 group-hover:text-yellow-500 transition-colors flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
        <style jsx global>{`body { background-color: #050505; }`}</style>
      </div>
    </div>
  );
}
