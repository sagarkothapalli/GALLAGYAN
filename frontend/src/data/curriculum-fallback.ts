export interface ChapterQuiz {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface Chapter {
  id: number;
  slug: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Pro';
  readTime: string;
  keyConcepts: string[];
  content: string;
  exercises: string[];
  keyTakeaways: string[];
  quiz: ChapterQuiz[];
}

export const FALLBACK_CHAPTERS: Chapter[] = [
  {
    id: 1,
    slug: 'what-is-stock-market',
    title: 'What is the Stock Market?',
    level: 'Beginner',
    readTime: '8 min',
    keyConcepts: ['Price discovery', 'NSE vs BSE', 'Bull & Bear markets', 'Market participants'],
    content: `The stock market is a marketplace where buyers and sellers trade shares of publicly listed companies. In India, the two primary exchanges are the National Stock Exchange (NSE) and the Bombay Stock Exchange (BSE).

When you buy a share of a company, you become a part-owner of that business. The price of shares is determined by supply and demand — if more people want to buy a stock than sell it, the price goes up. This process is called price discovery.

The Indian stock market has a rich history dating back to 1875 when the BSE was established. Today, the NSE handles the majority of trading volume and is home to the Nifty 50 index, while the BSE tracks the Sensex (Sensitive Index) comprising 30 top companies.

Market participants include retail investors (individual traders like you), institutional investors (mutual funds, insurance companies), Foreign Institutional Investors (FIIs), and market makers who provide liquidity.

A Bull Market refers to a period when stock prices are generally rising (20%+ from recent lows), accompanied by economic optimism. A Bear Market is the opposite — prices declining 20%+ from recent highs, often during economic uncertainty.

SEBI (Securities and Exchange Board of India) regulates the entire ecosystem, ensuring fair practices, investor protection, and orderly market development.

The market operates Monday to Friday from 9:15 AM to 3:30 PM IST. Pre-open session runs from 9:00 to 9:15 AM where opening prices are determined through an order-matching mechanism.`,
    exercises: [
      'Open the NSE website (nseindia.com) and explore the Nifty 50 constituents list',
      'Compare the Nifty 50 and Sensex — note which companies appear in both',
      'Check today\'s market status — is it trading in the green or red?',
    ],
    keyTakeaways: [
      'Stock markets facilitate price discovery through supply and demand',
      'India has two major exchanges: NSE (Nifty 50) and BSE (Sensex)',
      'SEBI is the regulatory authority for Indian securities markets',
      'Markets trade Mon-Fri, 9:15 AM to 3:30 PM IST',
    ],
    quiz: [
      {
        question: 'What is the process by which stock prices are determined called?',
        options: ['Market making', 'Price discovery', 'Arbitrage', 'Speculation'],
        correctIndex: 1,
      },
      {
        question: 'Which organization regulates the Indian stock market?',
        options: ['RBI', 'SEBI', 'IRDAI', 'NABARD'],
        correctIndex: 1,
      },
      {
        question: 'What defines a Bull Market?',
        options: ['Prices falling 20%+', 'Prices rising 20%+ from lows', 'Sideways movement', 'High volatility only'],
        correctIndex: 1,
      },
      {
        question: 'What are the Indian stock market trading hours?',
        options: ['9:00 AM - 4:00 PM', '9:15 AM - 3:30 PM', '10:00 AM - 4:00 PM', '9:30 AM - 3:00 PM'],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 2,
    slug: 'how-to-start-investing',
    title: 'How to Start Investing in India',
    level: 'Beginner',
    readTime: '10 min',
    keyConcepts: ['Demat account', 'KYC process', 'Choosing a broker', 'First stock purchase'],
    content: `Starting your investment journey in India is simpler than ever. The process involves three key steps: opening a Demat account, completing KYC verification, and making your first investment.

A Demat (Dematerialised) Account holds your shares electronically — think of it as a bank account for stocks. You need both a Demat account and a Trading account to buy and sell shares. Most brokers provide both.

The KYC (Know Your Customer) process requires your PAN card, Aadhaar card, bank account details, and a passport-size photograph. With e-KYC, this can be completed online in under 15 minutes through platforms like Zerodha, Groww, or Angel One.

When choosing a broker, consider these factors: brokerage charges (discount brokers charge flat fees vs. percentage-based), trading platform quality, research tools available, customer support, and regulatory compliance. Popular discount brokers in India include Zerodha (market leader), Groww, Upstox, and Angel One.

Once your account is active, fund it through UPI, net banking, or NEFT. Start small — even Rs 500 per month through SIPs in index funds is a solid beginning.

For your first stock purchase, consider starting with well-known large-cap companies that you understand. Use a limit order (not market order) so you control the price. Start with small amounts while you learn.

Key rule: Never invest money you cannot afford to lose. Build an emergency fund of 6 months expenses before entering the stock market.`,
    exercises: [
      'Compare brokerage charges of at least 3 discount brokers',
      'Check if you have all KYC documents ready (PAN, Aadhaar, bank statement)',
      'Create a mock watchlist of 5 companies you already use as a consumer',
    ],
    keyTakeaways: [
      'You need a Demat + Trading account to invest in Indian stocks',
      'E-KYC with PAN + Aadhaar takes under 15 minutes',
      'Discount brokers offer lower fees than traditional brokers',
      'Build an emergency fund before investing in stocks',
    ],
    quiz: [
      {
        question: 'What type of account holds shares electronically in India?',
        options: ['Savings account', 'Trading account', 'Demat account', 'NRE account'],
        correctIndex: 2,
      },
      {
        question: 'Which document is mandatory for KYC in stock trading?',
        options: ['Voter ID only', 'Passport only', 'PAN card', 'Driving license only'],
        correctIndex: 2,
      },
      {
        question: 'What should you build before investing in the stock market?',
        options: ['A large portfolio', 'An emergency fund', 'A real estate property', 'A gold reserve'],
        correctIndex: 1,
      },
      {
        question: 'What type of order lets you control the purchase price?',
        options: ['Market order', 'Limit order', 'Stop loss order', 'AMO order'],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 3,
    slug: 'understanding-stock-prices',
    title: 'Understanding Stock Prices',
    level: 'Beginner',
    readTime: '7 min',
    keyConcepts: ['Demand and supply', 'Bid-ask spread', 'Market hours', 'Circuit breakers'],
    content: `Stock prices move every second during market hours, driven by the fundamental principle of supply and demand. Understanding why prices move is essential to making informed investment decisions.

When more buyers want a stock than sellers, the price rises. When more sellers want to exit than buyers want to enter, the price falls. This constant negotiation happens through an electronic order book maintained by the exchange.

The bid-ask spread is the difference between the highest price a buyer is willing to pay (bid) and the lowest price a seller is willing to accept (ask). A narrow spread indicates high liquidity — the stock is actively traded. A wide spread suggests low interest or low trading volume.

Stock prices are influenced by multiple factors: company earnings and quarterly results, industry trends, macroeconomic conditions (GDP growth, inflation, interest rates), government policies and regulations, global market sentiment, and FII/DII buying or selling patterns.

Circuit breakers are safety mechanisms that halt trading when prices move too rapidly. In India, there are three levels: individual stock circuits (5%, 10%, or 20% based on the stock) and market-wide circuits at 10%, 15%, and 20% of the index.

The pre-open session (9:00-9:15 AM) uses a call auction mechanism where all orders are collected and matched at a single equilibrium price. This prevents extreme volatility at market open.

After-hours trading is not available in India. Any news that breaks after 3:30 PM gets reflected in the next day's opening price — this is called a gap-up or gap-down opening.`,
    exercises: [
      'Watch the order book of any Nifty 50 stock during market hours and observe the bid-ask spread',
      'Note the opening price vs previous close for 5 stocks — identify gap-ups and gap-downs',
      'Track a stock for one week and list all news events that moved its price',
    ],
    keyTakeaways: [
      'Stock prices are determined by supply and demand through an electronic order book',
      'Bid-ask spread indicates liquidity — narrower is better',
      'Circuit breakers prevent extreme price movements',
      'The pre-open session (9:00-9:15 AM) sets the opening price',
    ],
    quiz: [
      {
        question: 'What happens when demand for a stock exceeds supply?',
        options: ['Price falls', 'Price rises', 'Price stays the same', 'Trading halts'],
        correctIndex: 1,
      },
      {
        question: 'A narrow bid-ask spread indicates:',
        options: ['Low liquidity', 'High liquidity', 'Company is losing money', 'Stock is overvalued'],
        correctIndex: 1,
      },
      {
        question: 'What is a circuit breaker?',
        options: ['A stock split mechanism', 'A trading halt when prices move too fast', 'A type of order', 'A brokerage fee'],
        correctIndex: 1,
      },
      {
        question: 'When does the pre-open session occur in Indian markets?',
        options: ['8:00-8:15 AM', '9:00-9:15 AM', '9:15-9:30 AM', '3:30-3:45 PM'],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 4,
    slug: 'types-of-stocks',
    title: 'Types of Stocks',
    level: 'Beginner',
    readTime: '9 min',
    keyConcepts: ['Large-cap vs Small-cap', 'Growth vs Value', 'Cyclical stocks', 'Defensive stocks'],
    content: `Not all stocks are created equal. Understanding the different types helps you build a diversified portfolio that matches your risk appetite and investment goals.

By Market Capitalization: Large-cap stocks (market cap above Rs 20,000 crore) are well-established companies like Reliance, TCS, and HDFC Bank. They offer stability and consistent returns. Mid-cap stocks (Rs 5,000-20,000 crore) offer a balance of growth potential and reasonable stability. Small-cap stocks (below Rs 5,000 crore) are younger or niche companies with high growth potential but also higher risk.

Growth Stocks are companies growing revenue and earnings faster than the market average. They typically have high P/E ratios because investors pay a premium for expected future growth. Examples include IT companies and new-age tech firms. These stocks rarely pay dividends — profits are reinvested for expansion.

Value Stocks trade at prices below their intrinsic value, often identified by low P/E, low P/B (price-to-book) ratios. They might be temporarily out of favor but have strong fundamentals. Classic Indian examples include PSU banks during downturns and commodity companies at cycle lows.

Cyclical Stocks move in sync with the economic cycle. Sectors like auto, real estate, and metals do well during economic booms and suffer during downturns. Timing matters significantly with cyclical stocks.

Defensive Stocks provide stable returns regardless of economic conditions. FMCG (Hindustan Unilever, ITC), pharma, and utility companies are classic defensive stocks. People need food, medicine, and electricity in all economic conditions.

Dividend Stocks are mature companies that regularly distribute profits to shareholders. They provide a steady income stream and are popular among conservative investors. High dividend-yield stocks in India include Coal India, Power Grid, and ONGC.`,
    exercises: [
      'Classify 10 Nifty 50 stocks into large-cap growth, large-cap value, or large-cap dividend categories',
      'Compare the 5-year returns of a mid-cap index fund vs a large-cap index fund',
      'Identify 3 cyclical and 3 defensive stocks from your watchlist',
    ],
    keyTakeaways: [
      'Stocks are classified by market cap: Large-cap (stable), Mid-cap (balanced), Small-cap (risky)',
      'Growth stocks prioritize reinvestment; value stocks trade below intrinsic value',
      'Cyclical stocks follow economic cycles; defensive stocks remain stable',
      'Diversifying across stock types reduces overall portfolio risk',
    ],
    quiz: [
      {
        question: 'A company with market cap of Rs 50,000 crore is classified as:',
        options: ['Small-cap', 'Mid-cap', 'Large-cap', 'Micro-cap'],
        correctIndex: 2,
      },
      {
        question: 'Which type of stock typically has a high P/E ratio?',
        options: ['Value stock', 'Growth stock', 'Dividend stock', 'Defensive stock'],
        correctIndex: 1,
      },
      {
        question: 'FMCG companies are considered:',
        options: ['Cyclical stocks', 'Growth stocks', 'Defensive stocks', 'Penny stocks'],
        correctIndex: 2,
      },
      {
        question: 'Which stocks perform well during economic booms but suffer in downturns?',
        options: ['Defensive stocks', 'Cyclical stocks', 'Blue-chip stocks', 'Dividend stocks'],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 5,
    slug: 'fundamental-analysis-basics',
    title: 'Fundamental Analysis Basics',
    level: 'Beginner',
    readTime: '10 min',
    keyConcepts: ['Intrinsic value', 'P/E ratio', 'EPS', 'Annual report'],
    content: `Fundamental analysis is the method of evaluating a stock by examining the underlying business — its financials, competitive position, management quality, and industry outlook. The goal is to determine a company's intrinsic value and compare it to the current market price.

If a stock trades below its intrinsic value, it is considered undervalued — potentially a buying opportunity. If it trades above intrinsic value, it may be overvalued. This approach, pioneered by Benjamin Graham and popularized by Warren Buffett, forms the backbone of long-term investing worldwide.

Earnings Per Share (EPS) is the company's net profit divided by the number of outstanding shares. EPS of Rs 50 means the company earned Rs 50 for every share in existence. Rising EPS over multiple years is one of the best indicators of business health.

The Price-to-Earnings (P/E) ratio compares the stock price to its EPS. A P/E of 25 means you are paying Rs 25 for every Rs 1 of current earnings. The Indian market's average P/E is typically between 20-25. High P/E stocks are priced for growth; low P/E stocks may be undervalued or in distress.

The Annual Report is your primary source for fundamental data. Indian companies are required to publish audited annual reports covering the chairman's statement, directors' report, audited financial statements, and management discussion and analysis (MD&A). Download them free from the company's investor relations page or BSE/NSE.

Start your fundamental research with a simple checklist: Is revenue growing consistently? Are margins improving or stable? Is debt declining or manageable? Is the promoter holding significant stake (skin in the game)? Has the company been profitable for at least 5 consecutive years?`,
    exercises: [
      'Download the annual report of a company you use daily (e.g., Hindustan Unilever or Asian Paints) and read the MD&A section',
      'Calculate the P/E ratio of 5 Nifty 50 stocks using their current price and trailing EPS from Screener.in',
      'Compare the 5-year EPS growth of a fast-growing IT company vs a stable FMCG company',
    ],
    keyTakeaways: [
      'Fundamental analysis values a business, not just its stock price',
      'EPS shows earnings per share; rising EPS signals business growth',
      'P/E ratio compares price to earnings — context matters (sector average, growth rate)',
      'Annual reports are the most authentic source of company data',
    ],
    quiz: [
      {
        question: 'What does intrinsic value mean in fundamental analysis?',
        options: ['The book value', 'The true worth of the business', 'The 52-week average price', 'The dividend yield'],
        correctIndex: 1,
      },
      {
        question: 'EPS stands for:',
        options: ['Equity Per Share', 'Earnings Per Share', 'Exchange Price Spread', 'Equity Price Sensitivity'],
        correctIndex: 1,
      },
      {
        question: 'A P/E of 10 compared to an industry average of 25 suggests the stock is:',
        options: ['Overvalued', 'Fairly valued', 'Potentially undervalued', 'In a bubble'],
        correctIndex: 2,
      },
      {
        question: 'Where can you download a company\'s free annual report in India?',
        options: ['Only from broker apps', 'BSE/NSE investor relations page', 'Paid research platforms only', 'SEBI website only'],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 6,
    slug: 'what-are-mutual-funds',
    title: 'What are Mutual Funds?',
    level: 'Beginner',
    readTime: '9 min',
    keyConcepts: ['NAV', 'Types of funds', 'Fund manager', 'Expense ratio'],
    content: `A mutual fund pools money from thousands of investors and invests it in a diversified portfolio of stocks, bonds, or other securities. A professional fund manager makes the investment decisions on behalf of all investors.

When you invest in a mutual fund, you buy units. The price of each unit is called Net Asset Value (NAV) — calculated daily by dividing the total value of the fund's portfolio by the number of outstanding units. If the portfolio's value rises, NAV rises, and vice versa.

Types of Mutual Funds by asset class: Equity funds invest primarily in stocks — suitable for long-term wealth creation (5+ years). Debt funds invest in bonds and fixed-income instruments — lower risk, suitable for 1-3 year horizons. Hybrid funds mix equity and debt. Liquid funds invest in very short-term instruments — ideal for parking emergency funds.

Equity funds are further classified by market cap: Large-cap funds invest in the top 100 companies (stable, lower risk). Mid-cap funds invest in companies ranked 101-250 (higher growth potential, more volatile). Small-cap funds invest in companies ranked 251+ (highest potential, highest risk).

The Expense Ratio is the annual fee charged by the fund as a percentage of assets. A 1% expense ratio means Rs 1 of every Rs 100 is paid to the AMC every year. Index funds have much lower expense ratios (0.1-0.2%) than actively managed funds (0.5-2.5%). Over 20-30 years, this difference compounds dramatically.

SEBI mandates that all mutual funds display 5-year rolling returns, risk-o-meter (risk level), benchmark comparison, and expense ratio on their fact sheets. Always check if a fund is beating its benchmark consistently over 3-5 years — if not, an index fund is a better choice.`,
    exercises: [
      'Compare the expense ratio of a Nifty 50 index fund vs an actively managed large-cap fund',
      'Track the NAV of a mutual fund for one week — calculate the percentage change',
      'Use AMFI (amfiindia.com) to find the 3-year and 5-year returns of India\'s top 5 large-cap funds',
    ],
    keyTakeaways: [
      'Mutual funds pool investor money and are managed by professional fund managers',
      'NAV is the per-unit price of a mutual fund, updated daily',
      'Expense ratio is the annual fee — lower is better, especially for long-term investments',
      'Always compare fund performance against its benchmark index',
    ],
    quiz: [
      {
        question: 'NAV stands for:',
        options: ['Net Annual Value', 'Net Asset Value', 'New Account Value', 'Normalized Asset Value'],
        correctIndex: 1,
      },
      {
        question: 'Which type of fund is best suited for a 10-year wealth creation goal?',
        options: ['Liquid fund', 'Debt fund', 'Equity fund', 'Overnight fund'],
        correctIndex: 2,
      },
      {
        question: 'A fund with a 2.5% expense ratio vs one with 0.1% — over 30 years, the difference is:',
        options: ['Negligible', 'Around 5%', 'Dramatically large due to compounding', 'The same after tax'],
        correctIndex: 2,
      },
      {
        question: 'Where can you find standardized mutual fund data in India?',
        options: ['Only broker apps', 'AMFI website (amfiindia.com)', 'Private research firms only', 'RBI website'],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 7,
    slug: 'sip-systematic-investment-plan',
    title: 'SIPs: Systematic Investment Plans',
    level: 'Beginner',
    readTime: '8 min',
    keyConcepts: ['Rupee cost averaging', 'Power of compounding', 'SIP calculator', 'Step-up SIP'],
    content: `A Systematic Investment Plan (SIP) allows you to invest a fixed amount in a mutual fund at regular intervals — monthly, weekly, or quarterly. Rather than investing a lump sum, SIPs let you build wealth gradually, making it accessible to anyone regardless of income level.

The magic behind SIPs is Rupee Cost Averaging. When markets are high, your fixed SIP amount buys fewer units. When markets fall, the same amount buys more units. Over time, this averages out your cost per unit. You benefit from market dips instead of fearing them.

The Power of Compounding is why starting early matters more than investing more. A Rs 5,000/month SIP at 12% annual returns (Nifty long-term average) grows to approximately Rs 50 lakh in 20 years and Rs 1.76 crore in 30 years. Waiting just 5 years to start reduces your 30-year corpus by nearly 40%.

Most AMCs allow SIPs starting at Rs 500 per month. Platforms like Groww, Zerodha Coin, MFCentral, and AMFI-registered distributors make setting up a SIP a 10-minute process. Link your bank account, select a fund, set the date and amount, and activate e-mandate.

Step-up SIP (also called Top-up SIP) automatically increases your SIP amount by a fixed percentage annually — usually 10-15%. This mirrors salary increments, ensuring your investments grow with your income. A 10% annual step-up on a Rs 5,000 SIP can double your final corpus compared to a flat SIP.

SIPs work best with disciplined, long-term commitment. Stopping SIPs during market crashes is the most common and costly mistake. Bear markets are exactly when SIPs are buying the maximum units — interrupting them defeats the entire purpose of rupee cost averaging.`,
    exercises: [
      'Use the SIP calculator on AMFI website to calculate your target corpus for retirement at 60',
      'Set up a SIP on any platform (even Rs 500) to experience the process firsthand',
      'Calculate how much more corpus you get with a 10% annual step-up vs a flat SIP of Rs 5,000/month over 20 years',
    ],
    keyTakeaways: [
      'SIPs invest a fixed amount regularly, averaging your cost across market cycles',
      'Rupee cost averaging automatically buys more units when prices fall',
      'Starting early beats investing more later — time in market is crucial',
      'Step-up SIPs that increase annually significantly boost long-term wealth',
    ],
    quiz: [
      {
        question: 'What is the core benefit of Rupee Cost Averaging in SIPs?',
        options: ['You always buy at low prices', 'Your cost averages out across market cycles', 'You avoid all taxes', 'You get guaranteed returns'],
        correctIndex: 1,
      },
      {
        question: 'If you invest Rs 5,000/month at 12% for 30 years, the approximate corpus is:',
        options: ['Rs 25 lakh', 'Rs 75 lakh', 'Rs 1.76 crore', 'Rs 50 crore'],
        correctIndex: 2,
      },
      {
        question: 'When should you ideally stop your SIP during a market crash?',
        options: ['Immediately to protect capital', 'After a 20% fall', 'You should not stop — crashes are the best time for SIPs', 'When your fund manager advises'],
        correctIndex: 2,
      },
      {
        question: 'What is a Step-up SIP?',
        options: ['A SIP with higher initial amount', 'A SIP that automatically increases by a fixed % each year', 'A SIP for high-net-worth individuals', 'A government-backed SIP scheme'],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 8,
    slug: 'portfolio-diversification',
    title: 'Portfolio Diversification',
    level: 'Beginner',
    readTime: '9 min',
    keyConcepts: ['Asset allocation', 'Correlation', 'Rebalancing', '100-minus-age rule'],
    content: `Diversification is the practice of spreading your investments across different assets, sectors, and geographies to reduce risk. The classic principle: "Don't put all your eggs in one basket." In investing terms, when one asset falls, another may hold steady or rise.

Asset Allocation is the most important investment decision you will make. It refers to how much of your portfolio is in equity (stocks/equity mutual funds), debt (bonds/debt funds), and other assets like gold or real estate. Research consistently shows that asset allocation determines over 90% of long-term portfolio returns.

The 100-minus-age rule is a simple starting guideline: subtract your age from 100 to get your equity percentage. A 25-year-old should have 75% in equity; a 50-year-old, 50%. Younger investors can tolerate more risk because they have more time to recover from market falls.

Correlation measures how two assets move relative to each other. Perfectly correlated assets move together (not helpful for diversification). Negatively correlated assets move in opposite directions — the ideal combination. Gold typically has low or negative correlation with equities, making it a classic diversifier.

Sector diversification within equities is equally important. A portfolio of only IT stocks would have crashed severely in 2022 when the sector fell 40%. Spreading across IT, banking, FMCG, pharma, and energy cushions sector-specific downturns.

Rebalancing is the process of bringing your portfolio back to your target allocation after market movements shift the percentages. If your target is 70% equity and a bull market pushes it to 85%, you sell some equity and buy debt — this is disciplined "sell high, buy low." Review and rebalance annually or when allocations deviate by more than 5%.`,
    exercises: [
      'Calculate your current asset allocation across all investments (FD, mutual funds, stocks, gold)',
      'Apply the 100-minus-age rule to determine your ideal equity allocation',
      'Check the correlation between Nifty 50 and gold prices over the last 5 years',
    ],
    keyTakeaways: [
      'Asset allocation — how you split between equity, debt, and gold — determines long-term returns',
      'The 100-minus-age rule is a simple starting point for equity allocation',
      'Low-correlation assets (gold + equity) reduce portfolio volatility',
      'Rebalance annually to maintain your target allocation',
    ],
    quiz: [
      {
        question: 'According to the 100-minus-age rule, a 30-year-old should have what equity allocation?',
        options: ['30%', '50%', '70%', '100%'],
        correctIndex: 2,
      },
      {
        question: 'Research shows that what percentage of long-term returns is determined by asset allocation?',
        options: ['30%', '50%', '70%', '90%+'],
        correctIndex: 3,
      },
      {
        question: 'Gold is used as a diversifier because it has __ correlation with equities',
        options: ['High positive', 'Perfect', 'Low or negative', 'No'],
        correctIndex: 2,
      },
      {
        question: 'Rebalancing means:',
        options: ['Selling all underperforming assets', 'Bringing portfolio back to target allocation', 'Switching to a new broker', 'Pausing investments during volatility'],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 9,
    slug: 'reading-financial-statements',
    title: 'Reading Financial Statements',
    level: 'Intermediate',
    readTime: '15 min',
    keyConcepts: ['Balance sheet', 'P&L statement', 'Cash flow', 'Quarterly results'],
    content: `Financial statements are the report card of a company. Learning to read them transforms you from a speculator into an informed investor. Every listed Indian company publishes three key financial statements quarterly and annually.

The Profit & Loss Statement (Income Statement) shows revenue, expenses, and profit over a period. Key metrics to watch: Revenue growth (top line) tells you if the business is expanding. Operating profit margin shows efficiency. Net profit (bottom line) is what shareholders actually earn.

The Balance Sheet is a snapshot of what the company owns (assets), owes (liabilities), and the shareholders' equity at a specific date. Assets = Liabilities + Equity. A healthy balance sheet has more assets than liabilities, manageable debt levels, and growing equity over time.

The Cash Flow Statement reveals how much actual cash is flowing in and out. It has three sections: Operating cash flow (from core business), Investing cash flow (buying/selling assets), and Financing cash flow (debt, equity, dividends). A company can show paper profits but be cash-poor — the cash flow statement catches this.

When reading quarterly results, focus on Year-over-Year (YoY) growth rather than Quarter-over-Quarter (QoQ), as many Indian businesses are seasonal. Compare metrics against industry peers, not absolute numbers.

Red flags to watch: consistently declining margins, growing debt faster than revenue, negative operating cash flow despite reported profits, frequent "exceptional items" boosting bottom line, and auditor qualifications in the annual report.

Tools like Screener.in, Trendlyne, and Moneycontrol provide free access to financial data of all listed Indian companies.`,
    exercises: [
      'Read the latest quarterly results of Infosys and identify revenue growth, operating margin, and net profit',
      'Compare the debt-to-equity ratios of 3 companies in the same sector',
      'Check if any company in your watchlist has negative operating cash flow despite positive net profit',
    ],
    keyTakeaways: [
      'Three key statements: P&L (profitability), Balance Sheet (financial position), Cash Flow (actual cash)',
      'Always compare YoY growth, not QoQ, for Indian companies due to seasonality',
      'Cash flow statement reveals the real picture — profits can be on paper only',
      'Use free tools like Screener.in for financial data analysis',
    ],
    quiz: [
      {
        question: 'Which financial statement shows a company\'s revenue and expenses?',
        options: ['Balance Sheet', 'Cash Flow Statement', 'Profit & Loss Statement', 'Annual Report'],
        correctIndex: 2,
      },
      {
        question: 'The fundamental accounting equation is:',
        options: ['Assets = Revenue - Expenses', 'Assets = Liabilities + Equity', 'Profit = Revenue - Cost', 'Cash = Income - Outflow'],
        correctIndex: 1,
      },
      {
        question: 'Why should you focus on YoY growth rather than QoQ for Indian companies?',
        options: ['Tax reasons', 'Regulatory requirement', 'Seasonal business patterns', 'Currency fluctuations'],
        correctIndex: 2,
      },
      {
        question: 'A company showing profits but negative operating cash flow is a:',
        options: ['Good sign', 'Red flag', 'Normal occurrence', 'Tax benefit'],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 10,
    slug: 'valuation-metrics',
    title: 'Valuation Metrics: P/E, P/B, and More',
    level: 'Intermediate',
    readTime: '12 min',
    keyConcepts: ['P/E ratio', 'P/B ratio', 'EV/EBITDA', 'PEG ratio', 'Dividend yield'],
    content: `Valuation metrics help you determine whether a stock is cheap or expensive relative to its earnings, assets, or growth. No single metric tells the full story — skilled investors use multiple ratios together.

Price-to-Earnings (P/E) Ratio: the most widely used metric. Trailing P/E uses past 12 months earnings; Forward P/E uses estimated future earnings. Compare P/E against (1) the stock's own historical range, (2) sector peers, and (3) the broader market. Nifty 50 historical average P/E is 20-22. A stock at P/E 40 in a sector averaging 15 demands a justification.

Price-to-Book (P/B) Ratio: compares market price to book value (net assets per share). P/B < 1 means the stock trades below the value of its physical assets — could be a bargain or a value trap. Especially useful for banking and financial companies where assets dominate. Avoid high P/B companies with low Return on Equity (ROE).

EV/EBITDA (Enterprise Value to EBITDA): better than P/E for comparing companies with different debt levels. EV = Market Cap + Total Debt - Cash. EBITDA = Earnings Before Interest, Tax, Depreciation, and Amortization. This metric is capital-structure-neutral and excellent for comparing capital-intensive businesses like telecom and steel.

PEG Ratio = P/E ÷ Earnings Growth Rate. A PEG of 1 is considered fairly valued; below 1 potentially cheap given growth. This metric penalises high P/E stocks with slow growth and rewards fast growers trading at reasonable P/E multiples. Peter Lynch popularized PEG for growth stock analysis.

Dividend Yield = Annual Dividend ÷ Stock Price × 100. High-dividend-yield stocks (4%+) in India include Coal India, ONGC, and Power Grid. Yield rises when either dividends increase or stock price falls — always check which is causing a high yield.`,
    exercises: [
      'Compare P/E and P/B ratios of 3 private sector banks (HDFC, ICICI, Axis) using Screener.in',
      'Calculate the PEG ratio for 3 IT companies using their P/E and 3-year EPS growth rate',
      'Find 5 Nifty 50 stocks with dividend yield above 3% and check their 5-year dividend history',
    ],
    keyTakeaways: [
      'Always compare valuation ratios against sector peers and historical averages, not in isolation',
      'P/B ratio is especially useful for banks; EV/EBITDA for capital-intensive industries',
      'PEG ratio accounts for growth — a high P/E with high growth can be justified',
      'High dividend yield can signal value or distress — always check the reason',
    ],
    quiz: [
      {
        question: 'A stock with P/E 30 and earnings growth of 30% has a PEG ratio of:',
        options: ['0.5', '1.0', '1.5', '2.0'],
        correctIndex: 1,
      },
      {
        question: 'EV/EBITDA is preferred over P/E because it:',
        options: ['Is easier to calculate', 'Accounts for debt differences between companies', 'Uses future estimates', 'Is regulated by SEBI'],
        correctIndex: 1,
      },
      {
        question: 'A P/B ratio below 1 indicates the stock trades:',
        options: ['Above intrinsic value', 'At book value', 'Below net asset value', 'At fair market value'],
        correctIndex: 2,
      },
      {
        question: 'If a company cuts its dividend, what typically happens to dividend yield?',
        options: ['It rises', 'It falls', 'It stays the same', 'It becomes negative'],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 11,
    slug: 'technical-analysis-fundamentals',
    title: 'Technical Analysis Fundamentals',
    level: 'Intermediate',
    readTime: '12 min',
    keyConcepts: ['Candlestick charts', 'Support & resistance', 'Trend lines', 'Volume analysis'],
    content: `Technical analysis studies price and volume patterns to predict future price movements. While fundamental analysis tells you WHAT to buy, technical analysis helps you decide WHEN to buy or sell.

Candlestick Charts are the most popular chart type. Each candle represents a time period (1 day, 1 hour, etc.) and shows four prices: Open, High, Low, Close (OHLC). A green candle means close > open (bullish). A red candle means close < open (bearish). The body shows the open-close range; the wicks show the high-low range.

Support is a price level where buying interest is strong enough to prevent further decline. Resistance is where selling pressure prevents further rise. When a stock breaks above resistance, it often becomes the new support — and vice versa. These levels are identified by looking at historical price points where the stock repeatedly bounced or reversed.

Trend Lines connect consecutive highs (downtrend line) or consecutive lows (uptrend line). An uptrend is defined as higher highs and higher lows. A downtrend is lower highs and lower lows. Trading in the direction of the trend ("trend following") is one of the most reliable strategies.

Volume confirms price movements. Rising prices with rising volume = strong bullish move. Rising prices with declining volume = weak rally, potential reversal. Volume spikes at support/resistance levels often indicate significant buying or selling interest.

Moving Averages smooth out price data. The 50-day and 200-day moving averages are widely watched. When the 50-day crosses above the 200-day, it is called a Golden Cross (bullish). When it crosses below, it is a Death Cross (bearish).

Important: Technical analysis works best for short to medium-term trading. For long-term investing, fundamentals should be your primary guide.`,
    exercises: [
      'Open a candlestick chart of any Nifty 50 stock and identify 3 support and 3 resistance levels',
      'Draw trend lines on a 6-month daily chart and identify the current trend direction',
      'Compare price movement with volume for the last 5 large candles — does volume confirm the move?',
    ],
    keyTakeaways: [
      'Candlestick charts show Open, High, Low, Close for each time period',
      'Support = buying zone, Resistance = selling zone; they can swap when broken',
      'Volume confirms price movements — always check volume alongside price',
      'Moving averages (50-day, 200-day) help identify long-term trends',
    ],
    quiz: [
      {
        question: 'A green candlestick indicates:',
        options: ['Close < Open', 'Close > Open', 'High volume', 'Low volatility'],
        correctIndex: 1,
      },
      {
        question: 'When a stock breaks above resistance, that level often becomes:',
        options: ['Irrelevant', 'New resistance', 'New support', 'A sell signal'],
        correctIndex: 2,
      },
      {
        question: 'What is a Golden Cross?',
        options: ['50-day MA crossing below 200-day MA', '50-day MA crossing above 200-day MA', 'Price hitting all-time high', 'Volume exceeding average'],
        correctIndex: 1,
      },
      {
        question: 'Rising prices with declining volume suggests:',
        options: ['Strong bullish move', 'Weak rally, potential reversal', 'Accumulation phase', 'Short covering'],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 12,
    slug: 'indicators-oscillators',
    title: 'Indicators & Oscillators',
    level: 'Intermediate',
    readTime: '13 min',
    keyConcepts: ['RSI', 'MACD', 'Bollinger Bands', 'Volume indicators'],
    content: `Technical indicators are mathematical calculations based on price and volume data. They help traders identify trend direction, momentum, and potential reversal points. However, no indicator is perfect — they all lag price and work best in specific market conditions.

RSI (Relative Strength Index) measures momentum on a scale of 0-100. RSI above 70 is considered overbought (potential sell signal), below 30 is oversold (potential buy signal). In strong trends, RSI can remain overbought or oversold for extended periods — this is called trend-following RSI. The best RSI signals occur when the price makes a new high but RSI does not — a bearish divergence.

MACD (Moving Average Convergence Divergence) consists of two lines: the MACD line (12-day EMA minus 26-day EMA) and the Signal line (9-day EMA of MACD). A bullish signal occurs when MACD crosses above the Signal line. A bearish signal is the reverse. The histogram shows the distance between the two lines — expanding histogram = strengthening trend.

Bollinger Bands consist of a 20-day moving average with upper and lower bands 2 standard deviations away. Prices tend to stay within the bands 95% of the time. Prices touching the upper band in an uptrend = strength. Prices touching the lower band in a downtrend = weakness. A "Bollinger Squeeze" (bands narrowing) precedes explosive moves in either direction.

Volume indicators confirm price signals. On-Balance Volume (OBV) adds volume on up days and subtracts on down days — rising OBV during price consolidation signals accumulation. VWAP (Volume Weighted Average Price) is the most important intraday indicator, used by institutional investors to benchmark trade execution.

Key warning: Never use indicators in isolation. Combine RSI (momentum) with MACD (trend) and volume to form a complete picture. Indicators calculated from the same data will often give the same signal simultaneously — that is not confirmation, it is redundancy.`,
    exercises: [
      'Set up RSI and MACD on a Nifty 50 stock chart — identify 3 buy signals where both confirm each other',
      'Find an example of RSI divergence (price makes new high, RSI does not) in the last 6 months',
      'Observe Bollinger Band squeezes in the last 1 year — did they precede breakouts?',
    ],
    keyTakeaways: [
      'RSI above 70 = overbought, below 30 = oversold; divergence is the most reliable RSI signal',
      'MACD crossovers signal trend changes; expanding histogram = strengthening momentum',
      'Bollinger Bands measure volatility; squeeze precedes breakout',
      'Always combine multiple indicators with price action — never trade a single indicator in isolation',
    ],
    quiz: [
      {
        question: 'RSI above 70 indicates:',
        options: ['Strong buy signal', 'Overbought condition', 'High trading volume', 'A trend reversal confirmed'],
        correctIndex: 1,
      },
      {
        question: 'What is a bearish RSI divergence?',
        options: ['RSI falls while price falls', 'Price makes new high but RSI does not', 'RSI crosses above 50', 'MACD diverges from RSI'],
        correctIndex: 1,
      },
      {
        question: 'A Bollinger Band squeeze indicates:',
        options: ['High volatility ahead', 'Low volatility followed by potential explosive move', 'Overbought conditions', 'Institutional selling'],
        correctIndex: 1,
      },
      {
        question: 'VWAP is primarily used for:',
        options: ['Long-term investment analysis', 'Intraday institutional trade benchmarking', 'Calculating P/E ratios', 'Dividend tracking'],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 13,
    slug: 'ipo-how-to-apply',
    title: 'IPOs: How to Apply in India',
    level: 'Intermediate',
    readTime: '11 min',
    keyConcepts: ['IPO process', 'ASBA', 'GMP', 'Allotment & listing gains'],
    content: `An Initial Public Offering (IPO) is when a private company sells shares to the public for the first time, listing on the stock exchange. IPOs generate significant excitement in India — major ones like LIC, Zomato, Paytm, and Nykaa attracted millions of applications.

The IPO Process: The company files a Draft Red Herring Prospectus (DRHP) with SEBI. After approval, a price band is set. Investors apply during the subscription window (typically 3 days). Allotment occurs through a lottery system for oversubscribed IPOs. Shares list on the exchange, usually within 6 days.

How to Apply via ASBA: ASBA (Application Supported by Blocked Amount) is the mandatory mechanism. Your application amount is blocked in your bank account — not deducted — until allotment. If not allotted, the block is released immediately. Apply through your bank's net banking or broker app. UPI-based applications (up to Rs 5 lakh) settle within 2 hours.

Categories and Lots: Retail investors (applying up to Rs 2 lakh) are allocated at least 35% of IPO shares. Minimum lot sizes typically range from Rs 10,000 to Rs 15,000. You can apply for multiple lots but the allotment is per-PAN — applying through family members increases your chances.

Grey Market Premium (GMP) is an unofficial indicator of IPO demand and expected listing price. GMP of Rs 200 on an issue price of Rs 500 suggests a ~40% listing gain. However, GMP is unregulated, illiquid, and can swing wildly. Use it as sentiment data, not guaranteed returns.

IPO analysis checklist: Is the company profitable (avoid loss-making startups unless clear path to profitability)? Is the promoter reducing their stake significantly? Is the IPO priced reasonably vs peers? What will the IPO proceeds be used for (growth vs promoter exit)? Critically read the DRHP risk factors section.`,
    exercises: [
      'Read the DRHP of a recently listed company — identify 3 key risk factors mentioned',
      'Apply for an upcoming IPO through your broker\'s app or bank ASBA — experience the process',
      'Compare the listing price vs issue price of 10 IPOs from 2023-24 — what percentage gave listing gains?',
    ],
    keyTakeaways: [
      'Apply for IPOs through ASBA — money is blocked, not deducted, until allotment',
      'Allotment in oversubscribed IPOs is by lottery — applying through family members increases chances',
      'GMP indicates sentiment but is not a guaranteed return predictor',
      'Always check: profitability, promoter stake, valuation vs peers, and use of IPO proceeds',
    ],
    quiz: [
      {
        question: 'ASBA in IPO application means:',
        options: ['Money is immediately deducted', 'Money is blocked until allotment', 'You get guaranteed allotment', 'You can apply without a bank account'],
        correctIndex: 1,
      },
      {
        question: 'What percentage of IPO shares is reserved for retail investors?',
        options: ['10%', '20%', 'At least 35%', '50%'],
        correctIndex: 2,
      },
      {
        question: 'Grey Market Premium (GMP) is:',
        options: ['An official SEBI regulated indicator', 'An unofficial demand/sentiment indicator', 'A guaranteed listing gain', 'The difference between bid and ask'],
        correctIndex: 1,
      },
      {
        question: 'The DRHP (Draft Red Herring Prospectus) must be filed with:',
        options: ['RBI', 'BSE', 'SEBI', 'Ministry of Finance'],
        correctIndex: 2,
      },
    ],
  },
  {
    id: 14,
    slug: 'sector-investing',
    title: 'Sector Investing and Cyclicality',
    level: 'Intermediate',
    readTime: '11 min',
    keyConcepts: ['Sector rotation', 'Economic cycle', 'Sector ETFs', 'Thematic funds'],
    content: `Different sectors of the economy perform best at different stages of the economic cycle. Understanding sector rotation — the flow of money between sectors as the economy moves through expansion, peak, contraction, and trough — is a powerful tool for enhancing portfolio returns.

The Economic Cycle and Sectors: During early recovery (post-recession), cyclical sectors lead — consumer discretionary (auto, durables), financials, and materials. During expansion, technology and industrials outperform. As growth peaks, defensive sectors (healthcare, utilities, FMCG) begin to outperform. During recession, only pure defensives hold up.

India-Specific Sector Dynamics: The IT sector is highly correlated with US economic conditions and INR/USD exchange rates. Banking stocks track credit growth and RBI interest rate policy closely. FMCG follows rural demand, monsoon, and inflation. Infrastructure/capital goods track government spending cycles. Pharma depends on US FDA approvals, pricing pressures, and domestic formulations growth.

Sector ETFs allow you to take concentrated bets on a sector without single-stock risk. ICICI Prudential, Nippon, and Mirae offer sectoral ETFs for IT, pharma, banking, and consumption. Sector funds are inherently concentrated — limit them to 10-15% of your total portfolio.

Key mistake to avoid: chasing last year's best-performing sector. By the time retail investors notice a sector is performing, institutional money has already rotated out. Historical data shows that last year's top sector is more likely to underperform than outperform in the following year.

India's structural growth sectors for long-term investors: financial inclusion (banking/insurance penetration growing), digital infrastructure (cloud, cybersecurity), renewable energy, and domestic manufacturing (PLI schemes). These are secular trends, not cyclical plays.`,
    exercises: [
      'Plot the 3-year performance of Nifty IT, Nifty Bank, Nifty FMCG, and Nifty Pharma indices — identify which led in each year',
      'Find the current stage of India\'s economic cycle using PMI data and RBI commentary',
      'Compare returns of last 3 years\' best-performing sector vs the next year\'s returns',
    ],
    keyTakeaways: [
      'Sectors rotate through economic cycles — early recovery favors cyclicals, recession favors defensives',
      'Indian IT tracks US economy; banking tracks RBI rates; FMCG tracks rural demand',
      'Limit sector ETF/fund exposure to 10-15% of portfolio to avoid concentration risk',
      'Avoid chasing last year\'s best sector — institutional rotation typically happens first',
    ],
    quiz: [
      {
        question: 'Which sector typically outperforms during early economic recovery?',
        options: ['Utilities', 'Consumer discretionary and financials', 'Healthcare', 'FMCG'],
        correctIndex: 1,
      },
      {
        question: 'Indian IT stocks are most correlated with:',
        options: ['RBI interest rates', 'US economic conditions and INR/USD rate', 'Domestic GDP only', 'Agricultural output'],
        correctIndex: 1,
      },
      {
        question: 'What is sector rotation?',
        options: ['Switching between stocks within a sector', 'Money flowing between sectors based on economic cycle', 'Rebalancing to equal weights', 'Changing fund managers'],
        correctIndex: 1,
      },
      {
        question: 'How much of your portfolio should sector/thematic funds ideally represent?',
        options: ['50%+', '30-40%', '10-15%', 'None'],
        correctIndex: 2,
      },
    ],
  },
  {
    id: 15,
    slug: 'taxes-on-stock-market-income',
    title: 'Taxes on Stock Market Income',
    level: 'Intermediate',
    readTime: '12 min',
    keyConcepts: ['STCG vs LTCG', 'STT', 'ITR-2', 'Tax loss harvesting'],
    content: `Tax efficiency is as important as investment returns. Understanding how your stock market income is taxed helps you make smarter decisions and legally minimize your tax liability.

Capital Gains Tax: When you sell shares at a profit, you pay Capital Gains Tax. Short-Term Capital Gains (STCG) applies to shares held for 12 months or less — taxed at 20% (revised from 15% in Budget 2024). Long-Term Capital Gains (LTCG) applies to shares held over 12 months — taxed at 12.5% on gains above Rs 1.25 lakh per year (threshold revised in 2024). The first Rs 1.25 lakh of LTCG is completely tax-free.

Securities Transaction Tax (STT): Applied on every buy/sell transaction regardless of profit or loss. For equity delivery: 0.1% on both buy and sell. For F&O: 0.02% on options sell, 0.01% on futures sell. STT is deducted automatically by your broker — it is not a deductible expense.

Dividend Income: All dividends received from shares or mutual funds are added to your regular income and taxed at your income tax slab rate. Companies deduct TDS at 10% on dividends above Rs 5,000 per year — claim this as credit in your ITR.

Mutual Fund Taxation: Equity mutual funds follow the same 20%/12.5% STCG/LTCG rules as direct stocks. Debt mutual funds (held for any duration) are taxed at slab rate as per 2023 Budget changes — there is no longer a 3-year LTCG benefit for debt funds.

Tax Loss Harvesting: If you have unrealized losses in stocks, you can sell them before year-end to book the loss, then re-buy if you believe in the company. The booked loss can be offset against capital gains, reducing your tax liability. Carry forward losses for up to 8 years against future capital gains.

File ITR-2 (not ITR-1) if you have capital gains from stocks or mutual funds. The AIS (Annual Information Statement) and Form 26AS from the Income Tax portal automatically show all your stock transaction data.`,
    exercises: [
      'Calculate your LTCG tax liability if you sell mutual fund units with Rs 2 lakh profit after 2 years',
      'Review your current portfolio for any unrealized losses you could harvest before March 31st',
      'Download your AIS from the Income Tax portal and verify it matches your trading history',
    ],
    keyTakeaways: [
      'STCG (≤12 months) taxed at 20%; LTCG (>12 months) taxed at 12.5% above Rs 1.25 lakh threshold',
      'First Rs 1.25 lakh of LTCG per year is completely tax-free',
      'Debt mutual funds are now taxed at slab rate regardless of holding period',
      'Tax loss harvesting can legally reduce capital gains tax — review before March 31st every year',
    ],
    quiz: [
      {
        question: 'LTCG on equity shares above Rs 1.25 lakh is taxed at:',
        options: ['10%', '12.5%', '15%', '20%'],
        correctIndex: 1,
      },
      {
        question: 'If you hold shares for exactly 11 months and sell at profit, which tax applies?',
        options: ['LTCG', 'STCG', 'No tax', 'Business income tax'],
        correctIndex: 1,
      },
      {
        question: 'Dividend income from Indian stocks is taxed at:',
        options: ['0% (tax-free)', '10% flat', 'Your income tax slab rate', '12.5%'],
        correctIndex: 2,
      },
      {
        question: 'Tax loss harvesting means:',
        options: ['Avoiding taxes illegally', 'Booking losses to offset capital gains', 'Switching to a tax-free account', 'Investing in ELSS funds'],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 16,
    slug: 'risk-management-investors',
    title: 'Risk Management for Investors',
    level: 'Intermediate',
    readTime: '11 min',
    keyConcepts: ['Stop-loss', 'Position sizing', 'Risk-reward ratio', 'Drawdown'],
    content: `Risk management separates long-term successful investors from those who blow up their portfolios. The most skilled stock pickers in the world still lose money on individual trades — the difference is they lose small and win big.

Stop-Loss is a predetermined price at which you exit a losing position to prevent further damage. For long-term investors, a stop-loss might be a 20-25% decline in a stock (time-based, not price-based — reassess if the business fundamentals have changed). For traders, stop-losses are much tighter — typically 2-5% below entry. Set your stop-loss before entering the trade, not after.

Position Sizing is deciding how much capital to allocate to a single stock or trade. The 2% rule: never risk more than 2% of your total portfolio on a single trade. If you have Rs 5 lakh and your stop-loss is 10% below entry, buy only Rs 1 lakh of that stock (2% of Rs 5 lakh = Rs 10,000 max loss; Rs 1 lakh × 10% = Rs 10,000).

Risk-Reward Ratio compares potential profit to potential loss. A 3:1 ratio means you target Rs 3 profit for every Rs 1 risked. Even with a 40% win rate, a consistent 3:1 risk-reward strategy is profitable. Avoid trades where potential gain is less than 2x potential loss.

Maximum Drawdown is the largest peak-to-trough decline in your portfolio. If your portfolio went from Rs 10 lakh to Rs 6 lakh, that is a 40% drawdown. Psychologically, large drawdowns cause panic selling at exactly the wrong time. Design your portfolio to have a maximum acceptable drawdown before building it.

Behavioural Risks are often larger than market risks: overconfidence after a winning streak, panic selling during corrections, FOMO (Fear of Missing Out) chasing hot stocks, and averaging down in a falling stock without fundamental justification. Keep a trading journal to identify your personal behavioural biases.`,
    exercises: [
      'Define a stop-loss for each stock in your portfolio — write it down before markets open',
      'Calculate proper position size for a Rs 2 lakh portfolio using the 2% rule with a 10% stop-loss',
      'Review your last 5 trades — what was the average risk-reward ratio you targeted?',
    ],
    keyTakeaways: [
      'Set stop-losses before entering trades, not after — emotions cloud judgment once in a position',
      'The 2% rule: never risk more than 2% of total portfolio capital on any single trade',
      'Aim for a minimum 2:1 risk-reward ratio — even a 40% win rate is profitable at 3:1',
      'Track your drawdown — staying within your acceptable drawdown prevents panic selling',
    ],
    quiz: [
      {
        question: 'The 2% rule in position sizing means:',
        options: ['Only buy 2% of a stock', 'Never risk more than 2% of total portfolio on one trade', 'Limit portfolio to 2 stocks', 'Take 2% profit and exit'],
        correctIndex: 1,
      },
      {
        question: 'A risk-reward ratio of 3:1 means:',
        options: ['3% risk, 1% target', 'Target Rs 3 profit for every Rs 1 risked', 'Win 3 times for every loss', 'Use 3x leverage'],
        correctIndex: 1,
      },
      {
        question: 'When is the best time to set a stop-loss?',
        options: ['After the trade is profitable', 'When the stock falls 20%', 'Before entering the trade', 'At market close each day'],
        correctIndex: 2,
      },
      {
        question: 'Maximum drawdown measures:',
        options: ['Total trading losses', 'Largest peak-to-trough portfolio decline', 'Number of losing trades', 'Annual tax liability'],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 17,
    slug: 'derivatives-futures',
    title: 'Derivatives: Futures Explained',
    level: 'Advanced',
    readTime: '18 min',
    keyConcepts: ['Contract mechanics', 'Margin requirements', 'Lot sizes', 'Rollover'],
    content: `Derivatives are financial contracts whose value derives from an underlying asset — a stock, index, or commodity. Futures and Options are the two main types traded in India. This chapter focuses on Futures.

A Futures contract is an agreement to buy or sell an asset at a predetermined price on a future date. Both buyer and seller are obligated to honor the contract. In India, stock and index futures expire on the last Thursday of every month.

Lot Size determines the minimum quantity per contract. For Nifty futures, the lot size is 75 units. If Nifty is at 22,000, one lot = 75 x 22,000 = Rs 16,50,000 in exposure. You do not need this full amount — you pay margin.

Margin is the upfront deposit required to take a futures position. SEBI mandates initial margin (typically 10-15% of contract value) and maintenance margin. If your position moves against you and margin falls below the maintenance level, you receive a margin call — deposit more money or your position is squared off.

Mark-to-Market (MTM) means your profit or loss is calculated and settled daily. If Nifty moves 100 points against your 1-lot position, you lose Rs 7,500 that day (75 x 100). This is debited from your account immediately.

Rollover happens when traders carry forward positions to the next month's contract before expiry. The cost of rollover (difference between current and next month contract price) depends on interest rates and dividends.

SEBI data consistently shows that over 90% of individual F&O traders lose money. The leverage that makes futures attractive is the same force that amplifies losses. Only trade futures if you fully understand margin, MTM, and have a strict stop-loss discipline.

Key risks: Unlimited loss potential (unlike options), daily MTM settlement depleting your capital, high emotional stress from leveraged positions, and transaction costs eating into thin margins.`,
    exercises: [
      'Check the current lot size and margin requirement for Nifty, Bank Nifty, and Reliance futures',
      'Calculate the profit/loss on a Nifty futures position if the index moves 200 points in your favor',
      'Compare the price of current month and next month Nifty futures — calculate the rollover cost',
    ],
    keyTakeaways: [
      'Futures contracts obligate both parties to complete the transaction at expiry',
      'Margin (10-15%) gives you leveraged exposure — amplifies both gains and losses',
      'Mark-to-Market means daily P&L settlement — losses are real and immediate',
      '90%+ of individual F&O traders lose money according to SEBI data',
    ],
    quiz: [
      {
        question: 'When do Indian stock futures contracts expire?',
        options: ['First Monday of month', 'Last Thursday of month', 'Last Friday of month', '15th of every month'],
        correctIndex: 1,
      },
      {
        question: 'If Nifty lot size is 75 and it moves 100 points against you, your loss is:',
        options: ['Rs 100', 'Rs 750', 'Rs 7,500', 'Rs 75,000'],
        correctIndex: 2,
      },
      {
        question: 'What percentage of individual F&O traders lose money according to SEBI?',
        options: ['50%', '70%', '80%', '90%+'],
        correctIndex: 3,
      },
      {
        question: 'What happens during Mark-to-Market settlement?',
        options: ['Monthly P&L calculation', 'Daily P&L settlement', 'Only at expiry', 'Weekly adjustment'],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 18,
    slug: 'options-trading-basics',
    title: 'Options Trading Basics',
    level: 'Advanced',
    readTime: '16 min',
    keyConcepts: ['Call vs Put', 'Strike price', 'Premium', 'Expiry'],
    content: `Options are derivative contracts that give the buyer the right, but not the obligation, to buy or sell an underlying asset at a predetermined price (strike price) on or before expiry. Options are the most versatile financial instrument — used for speculation, hedging, and income generation.

Call Option: gives the buyer the right to BUY the underlying at the strike price. You buy a call when you expect the price to rise. If Nifty is at 22,000 and you buy a 22,200 Call, you profit if Nifty goes above 22,200 before expiry.

Put Option: gives the buyer the right to SELL the underlying at the strike price. You buy a put when you expect the price to fall. If Nifty is at 22,000 and you buy a 21,800 Put, you profit if Nifty falls below 21,800 before expiry.

Premium is the price you pay to buy an option. A Nifty 22,200 Call might cost Rs 150 premium. For a lot of 75 units, your total cost is Rs 11,250. This is your maximum loss as a buyer — you can only lose what you paid. Options buyers have limited risk (premium paid) and unlimited profit potential.

Options sellers (writers) receive the premium upfront but take on the risk. A Call seller profits if the stock stays below the strike; a Put seller profits if the stock stays above. Selling options provides consistent income in sideways or mildly trending markets — but a single large adverse move can wipe out many months of premium income.

Intrinsic Value vs Time Value: an option's premium has two parts. Intrinsic value is how much the option is "in the money" (ITM). A 21,800 Put when Nifty is at 22,000 has Rs 0 intrinsic value (out of money). Time value is the remaining potential — it decays as expiry approaches. This decay, called Theta, is the option seller's best friend and the buyer's constant enemy.

In India, Nifty and Bank Nifty options expire weekly (every Thursday). Stock options expire monthly (last Thursday). Weekly options have significantly higher theta decay — a double-edged sword.`,
    exercises: [
      'Check the option chain for Nifty on NSE website — observe bid-ask, premium, and open interest',
      'Simulate buying a Nifty call option on paper — track its value daily until expiry',
      'Calculate your break-even point: strike price + premium paid for a call option',
    ],
    keyTakeaways: [
      'Call options profit when underlying rises; Put options profit when underlying falls',
      'Option buyers have limited loss (premium) and unlimited profit potential',
      'Time value (Theta) decays every day — option buyers fight time, sellers benefit from it',
      'Nifty/Bank Nifty options expire every Thursday; individual stock options expire monthly',
    ],
    quiz: [
      {
        question: 'You buy a Nifty 22,500 Call when Nifty is at 22,000. This option is:',
        options: ['In the money (ITM)', 'At the money (ATM)', 'Out of the money (OTM)', 'Deep ITM'],
        correctIndex: 2,
      },
      {
        question: 'The maximum loss for an option buyer is:',
        options: ['Unlimited', 'The intrinsic value', 'The premium paid', 'The margin requirement'],
        correctIndex: 2,
      },
      {
        question: 'Theta in options refers to:',
        options: ['Sensitivity to volatility changes', 'Time value decay per day', 'Sensitivity to interest rates', 'Probability of expiring ITM'],
        correctIndex: 1,
      },
      {
        question: 'Nifty weekly options in India expire on:',
        options: ['Every Monday', 'Every Wednesday', 'Every Thursday', 'Last Friday of the month'],
        correctIndex: 2,
      },
    ],
  },
  {
    id: 19,
    slug: 'options-greeks',
    title: 'Options Greeks Explained',
    level: 'Advanced',
    readTime: '15 min',
    keyConcepts: ['Delta', 'Gamma', 'Theta', 'Vega', 'IV'],
    content: `Options Greeks are mathematical measures that describe how an option's price changes in response to various market factors. Understanding Greeks is essential for anyone trading options beyond simple directional bets.

Delta measures how much an option's price changes for every Rs 1 move in the underlying. A Delta of 0.5 means the option gains Rs 0.50 when the stock rises Rs 1. Call options have positive Delta (0 to 1); Put options have negative Delta (-1 to 0). At-the-money options typically have a Delta around 0.5. Delta also approximates the probability of the option expiring in the money.

Gamma measures the rate of change of Delta — how fast Delta itself changes as the underlying moves. ATM options have the highest Gamma. Near expiry, ATM Gamma explodes — small moves in the underlying cause huge swings in Delta. This is why near-expiry ATM options are so dangerous for sellers (unlimited Gamma risk) and potentially profitable for buyers.

Theta is the daily time value decay. If a Nifty option has Theta of -50, it loses approximately Rs 50 in value every day purely due to passage of time, assuming everything else stays constant. Weekly options have very high Theta on Wednesday/Thursday — making them popular for premium sellers but treacherous for buyers.

Vega measures sensitivity to Implied Volatility (IV). When IV rises, option premiums rise (good for buyers, bad for sellers). Vega is highest for ATM options with longer expiry. Before major events (budget, election results, quarterly results), IV spikes — inflating premiums. After the event, IV crashes (IV crush), often destroying option buyers even when they predicted the direction correctly.

Implied Volatility (IV) reflects the market's expectation of future price movement. India VIX (Fear Index) measures Nifty's IV. High VIX = expensive options, high fear. Low VIX = cheap options, complacency. Selling options when IV is high (and buying when IV is low) is a core professional strategy.`,
    exercises: [
      'Check the Delta of ATM, slightly OTM, and deep OTM Nifty options — note the difference',
      'Track India VIX levels during a major event (budget day, election results) — note the IV crush after',
      'Calculate the theoretical impact of Theta decay on an ATM weekly option over the last 3 days of its life',
    ],
    keyTakeaways: [
      'Delta: price sensitivity to underlying move; Gamma: rate of Delta change; highest near expiry',
      'Theta is your daily rent as an option buyer — time works against you constantly',
      'Vega: sensitivity to IV changes; IV crush after events destroys option buyers even if direction was correct',
      'Selling options when IV is elevated and buying when IV is depressed is a core edge',
    ],
    quiz: [
      {
        question: 'An option with Delta 0.7 will gain approximately how much if the stock rises Rs 10?',
        options: ['Rs 10', 'Rs 7', 'Rs 0.70', 'Rs 70'],
        correctIndex: 1,
      },
      {
        question: 'Gamma is highest for:',
        options: ['Deep ITM long-dated options', 'ATM options near expiry', 'Deep OTM options', 'All options equally'],
        correctIndex: 1,
      },
      {
        question: 'IV Crush means:',
        options: ['Market crash due to high volatility', 'Implied Volatility dropping sharply after a major event', 'Options expiring worthless', 'VIX hitting all-time high'],
        correctIndex: 1,
      },
      {
        question: 'When India VIX is very high, options premiums are:',
        options: ['Very cheap', 'Unaffected', 'Expensive — favorable for sellers', 'Only expensive for calls'],
        correctIndex: 2,
      },
    ],
  },
  {
    id: 20,
    slug: 'options-strategies',
    title: 'Options Strategies for Indian Markets',
    level: 'Advanced',
    readTime: '17 min',
    keyConcepts: ['Covered Call', 'Iron Condor', 'Bull Call Spread', 'Short Straddle'],
    content: `Options strategies combine multiple option positions to create specific risk-reward profiles. Rather than simple directional bets, strategies let you profit from sideways markets, high volatility, or low volatility — scenarios where simple stock trading offers no edge.

Covered Call: If you hold shares, you can sell a Call option against them to generate income. Example: You hold 75 shares of Reliance at Rs 2,800. You sell a 2,900 Call for Rs 50 premium. If Reliance stays below 2,900, you keep the premium (Rs 3,750 for 75 shares) as extra income. If it rises above 2,900, your shares get called away at Rs 2,900 — you've capped your upside but earned the premium. Ideal for sideways-to-mildly bullish markets.

Bull Call Spread: Buy a lower strike Call, sell a higher strike Call. Example: Buy 22,000 Call for Rs 200, sell 22,500 Call for Rs 80. Net cost: Rs 120. Maximum profit: Rs 380 if Nifty expires above 22,500. Maximum loss: Rs 120 premium paid. This reduces cost compared to outright call buying but caps profit.

Iron Condor: Sell a Call spread and a Put spread simultaneously. You profit if the underlying stays within a range. Nifty Iron Condor: Sell 22,500 Call, Buy 22,700 Call (bearish call spread); Sell 21,500 Put, Buy 21,300 Put (bullish put spread). Net premium collected: Rs 150. Profit if Nifty stays between 21,500 and 22,500 until expiry. Loss if Nifty breaks out of range. Extremely popular in India's weekly expiry structure.

Short Straddle: Sell both ATM Call and Put. Collect premium from both. Profit if the underlying stays near the strike. Very high risk — a large move in either direction causes unlimited loss. Only suitable for experienced traders with clear exit rules.

The most important principle: always define your maximum loss before entering any strategy. Spreads (Bull Call, Iron Condor) have defined maximum loss. Naked option selling has potentially unlimited loss — only for well-capitalized, experienced traders with strict risk management.`,
    exercises: [
      'Paper trade an Iron Condor on Nifty for one weekly expiry — track your P&L daily',
      'Calculate the break-even points and max profit/loss of a Bull Call Spread with actual Nifty prices',
      'Identify a stock you own and calculate the premium you could earn by selling a covered call',
    ],
    keyTakeaways: [
      'Covered Call generates income on existing holdings in sideways markets',
      'Bull Call Spread reduces entry cost but caps profit — ideal for mildly bullish view',
      'Iron Condor profits from range-bound markets — extremely popular in weekly Nifty expiry',
      'Always use defined-risk strategies (spreads) until you have deep experience and significant capital',
    ],
    quiz: [
      {
        question: 'A Covered Call strategy involves:',
        options: ['Buying shares and buying calls', 'Holding shares and selling calls against them', 'Only selling calls without holding shares', 'Buying both calls and puts'],
        correctIndex: 1,
      },
      {
        question: 'In a Bull Call Spread, your maximum loss is:',
        options: ['Unlimited', 'The net premium paid', 'The difference between strikes', 'The higher strike price'],
        correctIndex: 1,
      },
      {
        question: 'An Iron Condor profits when:',
        options: ['Market moves sharply in one direction', 'Market stays within a range', 'Volatility increases significantly', 'Interest rates rise'],
        correctIndex: 1,
      },
      {
        question: 'Why are spreads safer than naked option selling for beginners?',
        options: ['They generate more profit', 'They have defined maximum loss', 'They require no margin', 'They are tax-free'],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 21,
    slug: 'swing-trading-strategies',
    title: 'Swing Trading Strategies',
    level: 'Advanced',
    readTime: '14 min',
    keyConcepts: ['Swing vs day trading', 'Chart patterns', 'Momentum trading', 'Position sizing'],
    content: `Swing trading involves holding positions for several days to weeks, capturing price "swings" within a larger trend. Unlike intraday trading (positions closed same day), swing traders avoid overnight risk but benefit from multi-day moves. Unlike long-term investing, swing traders are not concerned with fundamentals — only price action.

Swing vs Day Trading vs Investing: Day traders need high-speed execution, significant capital, and full-time attention. Swing traders can manage positions with 30-60 minutes of daily analysis. The sweet spot: large enough moves to overcome transaction costs, small enough holding period to avoid long-term fundamental changes.

Chart Patterns for Swing Trading: The Flag pattern — a sharp move followed by consolidation forming a flag shape. Buy the breakout from the flag in the direction of the initial move. Cup and Handle — a cup-shaped consolidation followed by a smaller dip (handle). Break above the handle is the entry. Head and Shoulders (reversal pattern) — three peaks with the middle being highest. Break below the neckline signals trend reversal.

Breakout Trading: Enter when price breaks above resistance with expanding volume. The breakout candle should close above resistance, not just touch it. Use the prior resistance as your new stop-loss level — if price breaks back below, the setup has failed.

Momentum Trading: Buy the strongest stocks in the market — those making new highs with rising volume. The principle: strong stocks tend to get stronger in trending markets. Scan for stocks hitting 52-week highs with above-average volume. Exit when momentum fades (RSI divergence, volume drying up, price struggling at next resistance).

Overnight Gap Risk: Swing positions are exposed to news after market hours. Earnings, regulatory news, or global events can gap the stock against your position. Limit overnight exposure in high-volatility periods (earnings season, election results, budget).`,
    exercises: [
      'Identify 3 Flag patterns in Nifty 50 stocks over the last 3 months — did they break out?',
      'Create a swing trading scan using a free tool (like TradingView) for stocks at 52-week highs with above-average volume',
      'Paper trade one breakout setup for 2 weeks — maintain a detailed trade journal',
    ],
    keyTakeaways: [
      'Swing trading captures multi-day moves — requires 30-60 min daily, not full-time attention',
      'Flag, Cup-and-Handle, and Breakout patterns are core swing trading setups',
      'Volume must confirm breakouts — price alone breaking resistance is insufficient',
      'Manage overnight gap risk by reducing position size around major events',
    ],
    quiz: [
      {
        question: 'What is the typical holding period for a swing trade?',
        options: ['Same day (intraday)', '1 hour to 4 hours', 'Several days to weeks', 'More than 1 year'],
        correctIndex: 2,
      },
      {
        question: 'In a Flag pattern breakout, where is the stop-loss typically placed?',
        options: ['Below the bottom of the flag', 'At the entry price', 'At the 200-day moving average', 'Below the initial flagpole'],
        correctIndex: 0,
      },
      {
        question: 'What confirms a valid breakout in breakout trading?',
        options: ['Price briefly touching resistance', 'Price closing above resistance with expanding volume', 'Any candle above resistance', 'RSI going above 70'],
        correctIndex: 1,
      },
      {
        question: 'Momentum trading focuses on buying stocks that are:',
        options: ['Making new 52-week lows', 'Consolidating sideways', 'Making new highs with rising volume', 'Showing declining earnings'],
        correctIndex: 2,
      },
    ],
  },
  {
    id: 22,
    slug: 'algo-trading-india',
    title: 'Algorithmic Trading in India',
    level: 'Pro',
    readTime: '20 min',
    keyConcepts: ['Zerodha Kite API', 'Python basics', 'Backtesting', 'Risk controls'],
    content: `Algorithmic trading (algo trading) uses computer programs to execute trades based on predefined rules. In India, retail traders can access algo trading through broker APIs, primarily Zerodha's Kite Connect API.

Getting Started: You need programming knowledge (Python is the most popular choice), a broker account with API access, and understanding of market microstructure. Zerodha's Kite Connect API costs Rs 2,000/month and provides real-time data feeds, order placement, and portfolio management capabilities.

Basic Algo Components: A typical trading algorithm has four parts: data ingestion (receiving market data), signal generation (applying your strategy logic), order management (placing and managing orders), and risk management (position sizing, stop-losses).

Popular Strategies for Indian Markets: Mean reversion (stocks tend to return to their average price), momentum (stocks trending up continue to rise), pairs trading (trading the spread between correlated stocks), and VWAP execution (breaking large orders into smaller pieces to minimize market impact).

Backtesting is testing your strategy against historical data before risking real money. Key metrics to evaluate: Sharpe ratio (risk-adjusted returns), maximum drawdown (worst peak-to-trough decline), win rate, and average profit per trade. Use at least 3-5 years of historical data for meaningful results.

Risk Controls are non-negotiable: maximum position size per trade (never risk more than 2% of capital), daily loss limit (stop trading after losing X% in a day), maximum number of trades per day, and kill switch to stop all trading immediately if something goes wrong.

SEBI regulations require all algo orders to be tagged with a unique identifier. Your broker must approve your algo before deployment. Unapproved algos can lead to account suspension.

Common Pitfalls: overfitting strategies to historical data (works in backtest, fails live), ignoring slippage and transaction costs, not accounting for latency, and emotional interference overriding the algorithm.`,
    exercises: [
      'Set up a Python environment and connect to a paper trading API',
      'Backtest a simple moving average crossover strategy on Nifty 50 data for the last 3 years',
      'Calculate the Sharpe ratio and maximum drawdown of your backtest results',
    ],
    keyTakeaways: [
      'Algo trading requires programming skills, API access, and market understanding',
      'Always backtest with 3-5 years of data before deploying real capital',
      'Risk controls (position limits, daily loss limits, kill switch) are mandatory',
      'SEBI requires all algo orders to be tagged and broker-approved',
    ],
    quiz: [
      {
        question: 'What programming language is most popular for algo trading in India?',
        options: ['Java', 'C++', 'Python', 'JavaScript'],
        correctIndex: 2,
      },
      {
        question: 'What is backtesting?',
        options: ['Trading with borrowed money', 'Testing strategy on historical data', 'Reverse engineering trades', 'Testing server performance'],
        correctIndex: 1,
      },
      {
        question: 'What is the maximum recommended risk per trade?',
        options: ['10% of capital', '5% of capital', '2% of capital', '20% of capital'],
        correctIndex: 2,
      },
      {
        question: 'What does SEBI require for all algorithmic orders?',
        options: ['Manual approval each time', 'Unique identifier tag', 'Government license', 'Minimum capital of Rs 50 lakh'],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 23,
    slug: 'quantitative-strategies',
    title: 'Quantitative Strategies',
    level: 'Pro',
    readTime: '18 min',
    keyConcepts: ['Factor investing', 'Momentum factor', 'Quality factor', 'Smart beta'],
    content: `Quantitative investing uses mathematical models and systematic rules to select and manage investments, removing emotional bias from decision-making. This approach, used by hedge funds and institutional investors, is now increasingly accessible to retail investors through smart-beta ETFs and DIY Python strategies.

Factor Investing is the foundation of modern quant strategies. Research by Fama, French, and others identified "factors" — characteristics that explain stock returns over time. Key factors: Value (cheap stocks outperform over long periods), Momentum (recent winners continue outperforming), Quality (profitable, low-debt companies outperform), Size (small-caps outperform large-caps over long periods), and Low Volatility (low-vol stocks deliver superior risk-adjusted returns).

Momentum Strategy in India: Select the top 20-30% of Nifty 500 stocks by 12-month price return (excluding the most recent month). Hold for one month, rebalance. SEBI-registered studies have shown that momentum factor has delivered significant excess returns over the Nifty 500 in India over 15+ year periods. Momentum captures the behavioral tendency of investors to underreact to good news.

Quality Factor Screen: Use filters like Return on Equity (ROE > 15%), low Debt-to-Equity (< 0.5), consistent earnings growth (5 consecutive years), and positive free cash flow. Combine these into a composite quality score. High-quality companies tend to outperform during market downturns while participating in upside.

Smart Beta ETFs: Indian AMCs now offer factor-based ETFs and index funds. Nippon India ETF Nifty50 Value 20, Mirae Asset Nifty 200 Momentum 30 Index Fund, and similar products provide factor exposure without building your own system. Expense ratios are higher than plain vanilla index funds but much lower than actively managed funds.

Backtesting rigor: Never use a strategy that has not been backtested on at least 10 years of data, accounts for transaction costs and slippage, has been tested across different market regimes (bull, bear, sideways), and avoids look-ahead bias (using future data in historical calculations).`,
    exercises: [
      'Build a simple 12-1 momentum screen using Nifty 500 data from any financial data provider',
      'Compare the returns of Nifty 200 Momentum 30 Index vs Nifty 50 for the last 5 years',
      'Screen Nifty 500 stocks with ROE > 15%, D/E < 0.5, and 5 consecutive profitable years using Screener.in',
    ],
    keyTakeaways: [
      'Factor investing uses systematic rules based on evidence: Value, Momentum, Quality, Low-Vol, Size',
      'Momentum factor in India has shown significant excess returns over 15+ year periods',
      'Smart Beta ETFs provide factor exposure without building custom systems',
      'Rigorous backtesting (10+ years, realistic costs, no look-ahead bias) is non-negotiable',
    ],
    quiz: [
      {
        question: 'Which factor captures the tendency of recent winners to continue outperforming?',
        options: ['Value factor', 'Quality factor', 'Momentum factor', 'Size factor'],
        correctIndex: 2,
      },
      {
        question: 'In the 12-1 momentum strategy, why is the most recent month excluded?',
        options: ['Data is unavailable', 'Short-term reversal effect makes last month noisy', 'SEBI regulation', 'Tax reasons'],
        correctIndex: 1,
      },
      {
        question: 'Look-ahead bias in backtesting means:',
        options: ['Testing too many future scenarios', 'Using data that was unavailable at the time of the decision', 'Over-optimizing for future returns', 'Ignoring transaction costs'],
        correctIndex: 1,
      },
      {
        question: 'Smart Beta ETFs differ from plain vanilla index funds by:',
        options: ['Higher returns guaranteed', 'Following factor-based rules rather than market-cap weighting', 'No expense ratio', 'Active management by a fund manager'],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 24,
    slug: 'market-microstructure',
    title: 'Market Microstructure',
    level: 'Pro',
    readTime: '16 min',
    keyConcepts: ['Order book', 'Market impact', 'HFT', 'Dark pools'],
    content: `Market microstructure is the study of how markets actually work at the granular level — how orders are matched, how prices are formed, and how different participants interact. Understanding microstructure gives you an edge in execution, especially for larger positions.

The Order Book is a real-time list of buy orders (bids) and sell orders (asks) at every price level. The best bid and ask form the "spread." Market orders execute immediately at the best available price. Limit orders sit in the book until filled or cancelled. Order flow imbalance — more buyers than sellers — predicts short-term price direction.

Tick Size and Lot Size matter for liquidity. NSE's minimum tick size for equities is Rs 0.05. For futures, it varies by contract. Smaller tick size means tighter spreads and better liquidity for small orders but creates more noise in the price series.

Market Impact is the price movement caused by your own order. A market buy order for 10,000 shares of a stock with thin liquidity will push the price up as it consumes all available sell orders at each level. Institutional investors use algorithms (VWAP, TWAP, POV) to slice large orders and minimize market impact.

High-Frequency Trading (HFT): Firms using ultra-low-latency systems to trade thousands of times per second. They provide liquidity (market making) but also engage in strategies like latency arbitrage and momentum ignition. SEBI has co-location regulations that limit HFT firms to specific server slots in the exchange data center. For retail traders, HFT is a background factor — not a direct competition.

Price Levels and Institutional Activity: Large round numbers (22,000, 23,000 on Nifty) act as psychological support/resistance because many limit orders cluster there. Options Max Pain — the price at which maximum options expire worthless — has some gravitational pull near expiry as market makers delta-hedge. Not a reliable trading signal alone but useful context.`,
    exercises: [
      'Watch the Nifty futures order book live during market hours — observe bid-ask depth changes',
      'Track how a large-cap stock\'s price responds to a sudden large buy order in the market depth',
      'Note where institutional order clusters appear (round numbers) in Nifty option chain OI',
    ],
    keyTakeaways: [
      'Order book depth and imbalance provide short-term price direction signals',
      'Market impact increases with order size — institutional investors use algos to minimize it',
      'VWAP is the benchmark for institutional execution quality',
      'Round number levels attract clustered limit orders, creating natural support/resistance',
    ],
    quiz: [
      {
        question: 'Market impact is a problem primarily for:',
        options: ['Small retail traders', 'Large institutional orders in thin markets', 'Short sellers only', 'Intraday traders only'],
        correctIndex: 1,
      },
      {
        question: 'VWAP stands for:',
        options: ['Volume Weighted Average Price', 'Volatility Weighted Asset Price', 'Variable Weighted Accumulation Point', 'Velocity of Weighted Average Purchases'],
        correctIndex: 0,
      },
      {
        question: 'The bid-ask spread represents:',
        options: ['Daily price range', 'Gap between best buy and best sell order', 'Broker commission', 'IPO listing discount'],
        correctIndex: 1,
      },
      {
        question: 'HFT firms primarily profit from:',
        options: ['Long-term investing', 'Market making and latency advantages', 'Dividend collection', 'IPO subscriptions'],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 25,
    slug: 'global-macro-investing',
    title: 'Global Macro Investing for Indian Markets',
    level: 'Pro',
    readTime: '17 min',
    keyConcepts: ['FII flows', 'US Fed policy', 'DXY impact', 'Commodity cycles'],
    content: `Indian equity markets do not exist in isolation. They are deeply connected to global macro forces — US Federal Reserve policy, dollar strength, crude oil prices, and global risk appetite. Understanding these linkages allows you to anticipate major market moves rather than simply react to them.

FII (Foreign Institutional Investor) Flows are the most direct global-to-India transmission mechanism. FIIs own approximately 20-25% of NSE-listed equity. When global risk appetite is high (risk-on), FIIs pour money into emerging markets including India — lifting Nifty. When global risk-off hits (US recession fears, banking crises), FIIs withdraw rapidly, causing Nifty to fall even if Indian fundamentals are unchanged. Track FII data daily on NSE website.

US Federal Reserve Policy: Indian equity markets have a strong inverse relationship with US interest rate expectations. When the Fed hikes rates, US bond yields rise, making US assets more attractive. FIIs sell emerging market equities and repatriate capital to the US. INR depreciates. Nifty often falls. The reverse happens during Fed rate cuts. This is why Indian investors now closely track Fed meetings, US inflation (CPI) data, and FOMC statements.

Dollar Index (DXY): A stronger dollar is generally negative for emerging market equities, including India. A rising DXY makes dollar-denominated debt more expensive, reduces commodity prices (most commodities are dollar-denominated), and signals capital outflow from emerging markets. INR/USD exchange rate is a proxy — if INR is weakening sharply, it often coincides with FII selling.

Crude Oil: India imports approximately 85% of its crude oil. Rising crude prices increase India's import bill, widen the Current Account Deficit (CAD), put pressure on INR, and squeeze corporate margins across sectors. Airlines, paint companies, and FMCG are directly impacted. Energy stocks benefit.

Commodity Cycles affect metal stocks (Tata Steel, Hindalco, SAIL) directly. Global steel prices, iron ore, copper, and aluminium prices track global industrial activity — primarily China. Understanding where China's economy is in its cycle is critical for positioning in Indian metal stocks.`,
    exercises: [
      'Download the last 12 months of daily FII buy/sell data from NSE and plot it alongside Nifty 50 — note the correlation',
      'Compare INR/USD movements with Nifty 50 performance over the last 5 years',
      'Track how Brent crude price changes impacted HPCL and IOC stock prices over the last 3 years',
    ],
    keyTakeaways: [
      'FII flows are the primary global-to-India transmission — track daily on NSE website',
      'US Fed rate decisions have outsized impact on Indian equities via FII repatriation',
      'Stronger dollar (rising DXY) = negative for Nifty; weaker dollar = positive',
      'Crude oil at $80+ is a headwind for India\'s CAD, INR, and corporate margins',
    ],
    quiz: [
      {
        question: 'When the US Fed raises interest rates, the typical impact on Indian equities is:',
        options: ['Positive — Indian exports rise', 'Negative — FIIs repatriate capital to US', 'Neutral — India is unaffected', 'Positive — INR strengthens'],
        correctIndex: 1,
      },
      {
        question: 'India imports approximately what percentage of its crude oil?',
        options: ['30%', '50%', '70%', '85%'],
        correctIndex: 3,
      },
      {
        question: 'FIIs own approximately what percentage of NSE-listed equity?',
        options: ['5-10%', '20-25%', '40-50%', '60%+'],
        correctIndex: 1,
      },
      {
        question: 'A rising DXY (Dollar Index) is generally:',
        options: ['Positive for emerging market equities', 'Negative for emerging market equities', 'Irrelevant to Indian markets', 'Positive for Indian IT stocks only'],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 26,
    slug: 'portfolio-construction-advanced',
    title: 'Advanced Portfolio Construction',
    level: 'Pro',
    readTime: '18 min',
    keyConcepts: ['Modern Portfolio Theory', 'Sharpe ratio', 'Beta', 'Alpha generation'],
    content: `Advanced portfolio construction moves beyond simple diversification to the science of optimizing returns for a given level of risk. Modern Portfolio Theory (MPT), developed by Harry Markowitz, provides the mathematical framework that underlies professional portfolio management.

The Efficient Frontier: Every combination of assets has an expected return and risk (standard deviation). When you plot all possible portfolios, the most efficient ones — highest return for a given risk — form a curve called the Efficient Frontier. A portfolio on the frontier is considered optimally diversified. In practice, investors rarely achieve the theoretical frontier, but aiming for it eliminates obviously inefficient portfolios.

Beta measures a stock's sensitivity to market movements. A Beta of 1 means the stock moves perfectly with the Nifty. Beta of 1.5 means the stock moves 1.5x the index (more volatile). Beta of 0.5 means half the market volatility. High-beta stocks amplify both gains and losses; low-beta stocks cushion drawdowns. During bear markets, low-beta portfolios significantly outperform.

Sharpe Ratio = (Portfolio Return - Risk-Free Rate) ÷ Standard Deviation. It measures risk-adjusted return. A Sharpe of 1.0 is good; 1.5 is very good; 2.0+ is exceptional. Compare portfolios by Sharpe ratio, not raw returns — a portfolio returning 25% with 30% volatility is worse than one returning 20% with 10% volatility.

Alpha is excess return above what the market (or benchmark) would predict given the portfolio's beta. A fund with 2% alpha consistently delivers 2% more than expected given its market exposure. Alpha is the true measure of manager skill — few funds generate consistent alpha after fees.

Factor Tilts: Instead of blind diversification, professional portfolios deliberately tilt towards profitable factors (Value, Momentum, Quality, Size). These tilts are evidence-based and have historically generated alpha over market-cap-weighted indices. Indian index funds with factor tilts (smart beta) offer an accessible way to implement this.`,
    exercises: [
      'Calculate the Beta of 5 stocks in your portfolio using their correlation with Nifty 50',
      'Calculate the Sharpe ratio of your portfolio over the last 12 months (use 6% as risk-free rate)',
      'Compare the Sharpe ratio of a pure Nifty 50 index fund vs a top-performing active fund over 5 years',
    ],
    keyTakeaways: [
      'Efficient Frontier identifies portfolios with maximum return for a given risk level',
      'Beta measures market sensitivity — high-beta amplifies moves; low-beta cushions downturns',
      'Sharpe ratio measures risk-adjusted returns — always compare funds on Sharpe, not raw returns',
      'Alpha is excess return above benchmark after accounting for beta — the true measure of skill',
    ],
    quiz: [
      {
        question: 'A stock with Beta 1.5 will move approximately how much when Nifty falls 10%?',
        options: ['5%', '10%', '15%', '1.5%'],
        correctIndex: 2,
      },
      {
        question: 'The Sharpe ratio measures:',
        options: ['Total portfolio return', 'Risk-adjusted return relative to volatility', 'Beta-adjusted alpha', 'Dividend yield divided by risk'],
        correctIndex: 1,
      },
      {
        question: 'Alpha in portfolio management means:',
        options: ['Total return of the portfolio', 'Excess return above what beta would predict', 'The riskiest part of the portfolio', 'Return from fixed-income'],
        correctIndex: 1,
      },
      {
        question: 'The Efficient Frontier represents portfolios with:',
        options: ['Maximum risk for any return', 'Maximum return for any given level of risk', 'Zero correlation between all assets', 'Only government bonds'],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 27,
    slug: 'building-a-trading-system',
    title: 'Building a Complete Trading System',
    level: 'Pro',
    readTime: '20 min',
    keyConcepts: ['System design', 'Edge definition', 'Trade management', 'Performance review'],
    content: `A trading system is a complete, rules-based framework for finding trades, entering them, managing risk, and exiting — without discretionary decision-making. The most consistent traders in the world do not rely on gut feel; they execute systems.

Defining Your Edge: Before building anything, answer: "Why will this strategy generate excess returns?" Valid edges include: information asymmetry (you know something others don't), behavioral exploitation (exploiting other traders' emotional mistakes, like momentum), structural advantages (options sellers benefiting from volatility risk premium), or arbitrage (price differences across instruments). Without a clear edge, you are gambling.

The Five Components of a Trading System: (1) Market selection — which instruments you trade (Nifty options, mid-cap equities, commodities). (2) Entry rules — exactly when and why you enter a trade. (3) Position sizing — how much capital per trade (2% rule, Kelly Criterion, fixed fractional). (4) Exit rules — stop-loss, profit target, trailing stop, or time-based exit. (5) Portfolio rules — maximum number of simultaneous positions, sector concentration limits, correlation filters.

Trade Management vs System Purity: Once in a trade, discretionary interventions — "I'll just let this run a bit longer" or "I'll cut early, feels wrong" — destroy system performance. The system's edge is derived from its statistical properties over hundreds of trades. Interfering with individual trades eliminates those properties. Trust the system, review the system — don't adjust it mid-trade.

Performance Review: Evaluate your system quarterly. Key metrics: Win rate, Average win / Average loss ratio, Maximum drawdown, Profit factor (gross profit ÷ gross loss; target > 1.5), Expectancy (average profit per trade). Distinguish between system failure (edge has deteriorated) and normal variance (losing streaks happen to all systems). Only change rules based on statistical evidence, not emotional reactions.

Scaling Up: Start with small position sizes (1-2 lots) to build confidence in your execution before scaling capital. Many traders paper trade a system for 3-6 months, then trade small size for 6-12 months, only adding capital after consistent profitable execution.`,
    exercises: [
      'Write down your current trading system (or investment process) with all 5 components defined clearly',
      'Track 20 consecutive trades with entry reason, exit reason, and P&L — calculate your win rate and expectancy',
      'Define your quarterly performance review process — what metrics will trigger a system re-evaluation?',
    ],
    keyTakeaways: [
      'Define your edge before building a system — without an edge, even perfect execution fails',
      'All 5 components must be rules-based: market selection, entry, sizing, exits, portfolio rules',
      'Never adjust a trade based on emotion — system properties only emerge over hundreds of trades',
      'Scale capital slowly: paper → small size → scale, based on execution consistency, not wishful thinking',
    ],
    quiz: [
      {
        question: 'What is the first question to answer when building a trading system?',
        options: ['What software to use', 'What is your edge — why will this generate excess returns?', 'What broker to use', 'What your profit target is'],
        correctIndex: 1,
      },
      {
        question: 'Profit Factor is calculated as:',
        options: ['Net Profit ÷ Number of Trades', 'Gross Profit ÷ Gross Loss', 'Win Rate × Average Win', 'Sharpe × Beta'],
        correctIndex: 1,
      },
      {
        question: 'Trade expectancy measures:',
        options: ['How often you win', 'Average profit per trade over many trades', 'Maximum single trade profit', 'Daily average return'],
        correctIndex: 1,
      },
      {
        question: 'When should you change your trading system rules?',
        options: ['After any losing trade', 'Based on statistical evidence of edge deterioration, not emotion', 'Every month to stay current', 'When a friend recommends a better strategy'],
        correctIndex: 1,
      },
    ],
  },
];

export const LEVEL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Beginner: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  Intermediate: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
  Advanced: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  Pro: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
};

export const TOTAL_CHAPTERS = 27;
