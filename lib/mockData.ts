export interface Instrument {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  sparklineData: number[];
  flag: string;
}

export interface Signal {
  id: string;
  date: string;
  pair: string;
  direction: "BUY" | "SELL";
  entry: number;
  stopLoss: number;
  tp1: number;
  tp2: number;
  tp3: number;
  tp1Hit: boolean;
  tp2Hit: boolean;
  tp3Hit: boolean;
  status: "won" | "lost" | "active";
  pips: number;
  result: string;
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  memberSince: string;
  rating: number;
  avatar?: string;
}

export interface MonthlyPerformance {
  month: string;
  year: number;
  pips: number;
  trades: number;
  winRate: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: string;
  lessons: number;
  available: boolean;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
}

export const instruments: Instrument[] = [
  {
    symbol: "XAU/USD",
    name: "Gold",
    price: 2347.85,
    change: 12.4,
    changePercent: 0.53,
    high24h: 2355.2,
    low24h: 2331.6,
    sparklineData: [
      2332, 2335, 2338, 2336, 2340, 2342, 2339, 2344, 2348, 2345, 2350, 2347,
      2352, 2349, 2346, 2351, 2353, 2348, 2344, 2346, 2349, 2352, 2350, 2347.85,
    ],
    flag: "XAU",
  },
  {
    symbol: "BTC/USD",
    name: "Bitcoin",
    price: 104285,
    change: 1850,
    changePercent: 1.81,
    high24h: 105420,
    low24h: 102110,
    sparklineData: [
      101200, 101800, 102400, 102000, 102900, 103500, 103100, 103800, 104300,
      103900, 104600, 105000, 104750, 104200, 104900, 105200, 104800, 104300,
      104600, 104900, 105100, 104800, 104400, 104285,
    ],
    flag: "BTC",
  },
];

export const signals: Signal[] = [
  {
    id: "SIG-001",
    date: "2025-01-15",
    pair: "XAU/USD",
    direction: "BUY",
    entry: 2325.0,
    stopLoss: 2318.0,
    tp1: 2332.0,
    tp2: 2340.0,
    tp3: 2347.0,
    tp1Hit: true,
    tp2Hit: true,
    tp3Hit: true,
    status: "won",
    pips: 220,
    result: "All TPs hit",
  },
  {
    id: "SIG-002",
    date: "2025-01-14",
    pair: "XAU/USD",
    direction: "SELL",
    entry: 2358.0,
    stopLoss: 2366.0,
    tp1: 2351.0,
    tp2: 2343.0,
    tp3: 2336.0,
    tp1Hit: true,
    tp2Hit: true,
    tp3Hit: true,
    status: "won",
    pips: 220,
    result: "All TPs hit",
  },
  {
    id: "SIG-003",
    date: "2025-01-13",
    pair: "XAU/USD",
    direction: "BUY",
    entry: 2310.0,
    stopLoss: 2302.0,
    tp1: 2317.0,
    tp2: 2325.0,
    tp3: 2332.0,
    tp1Hit: true,
    tp2Hit: true,
    tp3Hit: false,
    status: "won",
    pips: 150,
    result: "TP2 hit",
  },
  {
    id: "SIG-004",
    date: "2025-01-12",
    pair: "XAG/USD",
    direction: "BUY",
    entry: 28.5,
    stopLoss: 28.0,
    tp1: 29.0,
    tp2: 29.5,
    tp3: 30.0,
    tp1Hit: true,
    tp2Hit: true,
    tp3Hit: true,
    status: "won",
    pips: 150,
    result: "All TPs hit",
  },
  {
    id: "SIG-005",
    date: "2025-01-11",
    pair: "XAU/USD",
    direction: "SELL",
    entry: 2345.0,
    stopLoss: 2353.0,
    tp1: 2338.0,
    tp2: 2330.0,
    tp3: 2323.0,
    tp1Hit: true,
    tp2Hit: true,
    tp3Hit: true,
    status: "won",
    pips: 220,
    result: "All TPs hit",
  },
  {
    id: "SIG-006",
    date: "2025-01-10",
    pair: "XAU/USD",
    direction: "BUY",
    entry: 2338.0,
    stopLoss: 2330.0,
    tp1: 2345.0,
    tp2: 2353.0,
    tp3: 2360.0,
    tp1Hit: false,
    tp2Hit: false,
    tp3Hit: false,
    status: "lost",
    pips: -80,
    result: "SL hit",
  },
  {
    id: "SIG-007",
    date: "2025-01-09",
    pair: "XAU/USD",
    direction: "BUY",
    entry: 2302.0,
    stopLoss: 2295.0,
    tp1: 2309.0,
    tp2: 2317.0,
    tp3: 2324.0,
    tp1Hit: true,
    tp2Hit: true,
    tp3Hit: true,
    status: "won",
    pips: 220,
    result: "All TPs hit",
  },
  {
    id: "SIG-008",
    date: "2025-01-08",
    pair: "XAU/USD",
    direction: "SELL",
    entry: 2370.0,
    stopLoss: 2378.0,
    tp1: 2363.0,
    tp2: 2355.0,
    tp3: 2348.0,
    tp1Hit: true,
    tp2Hit: true,
    tp3Hit: true,
    status: "won",
    pips: 220,
    result: "All TPs hit",
  },
  {
    id: "SIG-009",
    date: "2025-01-07",
    pair: "XAU/USD",
    direction: "BUY",
    entry: 2315.0,
    stopLoss: 2308.0,
    tp1: 2322.0,
    tp2: 2330.0,
    tp3: 2337.0,
    tp1Hit: true,
    tp2Hit: true,
    tp3Hit: false,
    status: "won",
    pips: 150,
    result: "TP2 hit",
  },
  {
    id: "SIG-010",
    date: "2025-01-06",
    pair: "XAG/USD",
    direction: "SELL",
    entry: 30.2,
    stopLoss: 30.7,
    tp1: 29.7,
    tp2: 29.2,
    tp3: 28.7,
    tp1Hit: true,
    tp2Hit: true,
    tp3Hit: true,
    status: "won",
    pips: 150,
    result: "All TPs hit",
  },
  {
    id: "SIG-011",
    date: "2025-01-05",
    pair: "XAU/USD",
    direction: "BUY",
    entry: 2290.0,
    stopLoss: 2283.0,
    tp1: 2297.0,
    tp2: 2305.0,
    tp3: 2312.0,
    tp1Hit: true,
    tp2Hit: true,
    tp3Hit: true,
    status: "won",
    pips: 220,
    result: "All TPs hit",
  },
  {
    id: "SIG-012",
    date: "2025-01-04",
    pair: "XAU/USD",
    direction: "SELL",
    entry: 2365.0,
    stopLoss: 2372.0,
    tp1: 2358.0,
    tp2: 2350.0,
    tp3: 2343.0,
    tp1Hit: true,
    tp2Hit: false,
    tp3Hit: false,
    status: "won",
    pips: 70,
    result: "TP1 hit",
  },
  {
    id: "SIG-013",
    date: "2024-12-28",
    pair: "XAU/USD",
    direction: "BUY",
    entry: 2330.0,
    stopLoss: 2322.0,
    tp1: 2337.0,
    tp2: 2345.0,
    tp3: 2352.0,
    tp1Hit: true,
    tp2Hit: true,
    tp3Hit: true,
    status: "won",
    pips: 220,
    result: "All TPs hit",
  },
  {
    id: "SIG-014",
    date: "2024-12-27",
    pair: "XAU/USD",
    direction: "SELL",
    entry: 2355.0,
    stopLoss: 2363.0,
    tp1: 2348.0,
    tp2: 2340.0,
    tp3: 2333.0,
    tp1Hit: false,
    tp2Hit: false,
    tp3Hit: false,
    status: "lost",
    pips: -80,
    result: "SL hit",
  },
  {
    id: "SIG-015",
    date: "2024-12-26",
    pair: "XAU/USD",
    direction: "BUY",
    entry: 2305.0,
    stopLoss: 2298.0,
    tp1: 2312.0,
    tp2: 2320.0,
    tp3: 2327.0,
    tp1Hit: true,
    tp2Hit: true,
    tp3Hit: true,
    status: "won",
    pips: 220,
    result: "All TPs hit",
  },
  {
    id: "SIG-016",
    date: "2024-12-20",
    pair: "XAU/USD",
    direction: "BUY",
    entry: 2318.0,
    stopLoss: 2310.0,
    tp1: 2325.0,
    tp2: 2333.0,
    tp3: 2340.0,
    tp1Hit: true,
    tp2Hit: true,
    tp3Hit: false,
    status: "won",
    pips: 150,
    result: "TP2 hit",
  },
  {
    id: "SIG-017",
    date: "2024-12-19",
    pair: "XAG/USD",
    direction: "BUY",
    entry: 27.8,
    stopLoss: 27.3,
    tp1: 28.3,
    tp2: 28.8,
    tp3: 29.3,
    tp1Hit: true,
    tp2Hit: true,
    tp3Hit: true,
    status: "won",
    pips: 150,
    result: "All TPs hit",
  },
  {
    id: "SIG-018",
    date: "2024-12-18",
    pair: "XAU/USD",
    direction: "SELL",
    entry: 2380.0,
    stopLoss: 2388.0,
    tp1: 2373.0,
    tp2: 2365.0,
    tp3: 2358.0,
    tp1Hit: true,
    tp2Hit: true,
    tp3Hit: true,
    status: "won",
    pips: 220,
    result: "All TPs hit",
  },
  {
    id: "SIG-019",
    date: "2024-12-17",
    pair: "XAU/USD",
    direction: "BUY",
    entry: 2342.0,
    stopLoss: 2335.0,
    tp1: 2349.0,
    tp2: 2357.0,
    tp3: 2364.0,
    tp1Hit: true,
    tp2Hit: true,
    tp3Hit: true,
    status: "won",
    pips: 220,
    result: "All TPs hit",
  },
  {
    id: "SIG-020",
    date: "2024-12-16",
    pair: "XAU/USD",
    direction: "SELL",
    entry: 2375.0,
    stopLoss: 2382.0,
    tp1: 2368.0,
    tp2: 2360.0,
    tp3: 2353.0,
    tp1Hit: true,
    tp2Hit: false,
    tp3Hit: false,
    status: "won",
    pips: 70,
    result: "TP1 hit",
  },
  {
    id: "SIG-021",
    date: "2024-12-10",
    pair: "XAU/USD",
    direction: "BUY",
    entry: 2295.0,
    stopLoss: 2287.0,
    tp1: 2302.0,
    tp2: 2310.0,
    tp3: 2317.0,
    tp1Hit: true,
    tp2Hit: true,
    tp3Hit: true,
    status: "won",
    pips: 220,
    result: "All TPs hit",
  },
  {
    id: "SIG-022",
    date: "2024-12-09",
    pair: "XAU/USD",
    direction: "SELL",
    entry: 2362.0,
    stopLoss: 2370.0,
    tp1: 2355.0,
    tp2: 2347.0,
    tp3: 2340.0,
    tp1Hit: true,
    tp2Hit: true,
    tp3Hit: true,
    status: "won",
    pips: 220,
    result: "All TPs hit",
  },
  {
    id: "SIG-023",
    date: "2024-12-08",
    pair: "XAU/USD",
    direction: "BUY",
    entry: 2320.0,
    stopLoss: 2314.0,
    tp1: 2327.0,
    tp2: 2335.0,
    tp3: 2342.0,
    tp1Hit: false,
    tp2Hit: false,
    tp3Hit: false,
    status: "lost",
    pips: -60,
    result: "SL hit",
  },
  {
    id: "SIG-024",
    date: "2024-11-28",
    pair: "XAU/USD",
    direction: "BUY",
    entry: 2308.0,
    stopLoss: 2300.0,
    tp1: 2315.0,
    tp2: 2323.0,
    tp3: 2330.0,
    tp1Hit: true,
    tp2Hit: true,
    tp3Hit: true,
    status: "won",
    pips: 220,
    result: "All TPs hit",
  },
  {
    id: "SIG-025",
    date: "2024-11-27",
    pair: "XAG/USD",
    direction: "SELL",
    entry: 31.0,
    stopLoss: 31.5,
    tp1: 30.5,
    tp2: 30.0,
    tp3: 29.5,
    tp1Hit: true,
    tp2Hit: true,
    tp3Hit: false,
    status: "won",
    pips: 100,
    result: "TP2 hit",
  },
  {
    id: "SIG-026",
    date: "2024-11-26",
    pair: "XAU/USD",
    direction: "SELL",
    entry: 2385.0,
    stopLoss: 2393.0,
    tp1: 2378.0,
    tp2: 2370.0,
    tp3: 2363.0,
    tp1Hit: true,
    tp2Hit: true,
    tp3Hit: true,
    status: "won",
    pips: 220,
    result: "All TPs hit",
  },
  {
    id: "SIG-027",
    date: "2024-11-25",
    pair: "XAU/USD",
    direction: "BUY",
    entry: 2340.0,
    stopLoss: 2333.0,
    tp1: 2347.0,
    tp2: 2355.0,
    tp3: 2362.0,
    tp1Hit: true,
    tp2Hit: true,
    tp3Hit: false,
    status: "won",
    pips: 150,
    result: "TP2 hit",
  },
  {
    id: "SIG-028",
    date: "2025-01-16",
    pair: "XAU/USD",
    direction: "BUY",
    entry: 2348.0,
    stopLoss: 2340.0,
    tp1: 2355.0,
    tp2: 2363.0,
    tp3: 2370.0,
    tp1Hit: true,
    tp2Hit: false,
    tp3Hit: false,
    status: "active",
    pips: 70,
    result: "TP1 hit, running",
  },
  {
    id: "SIG-029",
    date: "2025-01-16",
    pair: "XAU/USD",
    direction: "SELL",
    entry: 2360.0,
    stopLoss: 2368.0,
    tp1: 2353.0,
    tp2: 2345.0,
    tp3: 2338.0,
    tp1Hit: false,
    tp2Hit: false,
    tp3Hit: false,
    status: "active",
    pips: 0,
    result: "Pending",
  },
  {
    id: "SIG-030",
    date: "2024-11-20",
    pair: "XAU/USD",
    direction: "BUY",
    entry: 2298.0,
    stopLoss: 2290.0,
    tp1: 2305.0,
    tp2: 2313.0,
    tp3: 2320.0,
    tp1Hit: false,
    tp2Hit: false,
    tp3Hit: false,
    status: "lost",
    pips: -80,
    result: "SL hit",
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "test-1",
    name: "James R.",
    text: "AIOV Capital has completely transformed my trading. The signals are incredibly accurate and the community support is unmatched. I went from losing money consistently to being profitable within my first month.",
    memberSince: "March 2023",
    rating: 5,
  },
  {
    id: "test-2",
    name: "Sarah M.",
    text: "I was skeptical at first, but the verified Myfxbook results convinced me to join. The educational content alone is worth the membership. My understanding of gold price action has improved dramatically.",
    memberSince: "July 2023",
    rating: 5,
  },
  {
    id: "test-3",
    name: "David K.",
    text: "The risk management guidance has been a game-changer for me. I no longer over-leverage my account and my consistency has improved massively. The team genuinely cares about member success.",
    memberSince: "January 2024",
    rating: 5,
  },
  {
    id: "test-4",
    name: "Olivia T.",
    text: "As a beginner, I was worried I would not be able to keep up. But the step-by-step courses and live sessions made everything clear. The community is welcoming and always willing to help.",
    memberSince: "September 2023",
    rating: 4,
  },
  {
    id: "test-5",
    name: "Marcus L.",
    text: "I have tried many signal services before. AIOV Capital stands out because of transparency. Every trade is logged and verified. The 90%+ win rate is real and the Myfxbook proves it.",
    memberSince: "May 2023",
    rating: 5,
  },
  {
    id: "test-6",
    name: "Aisha B.",
    text: "The weekly market analysis sessions are phenomenal. Understanding why we enter trades, not just where, has made me a much better independent trader. Best investment I have made in my trading career.",
    memberSince: "November 2023",
    rating: 5,
  },
];

export const monthlyPerformance: MonthlyPerformance[] = [
  { month: "February", year: 2024, pips: 420, trades: 28, winRate: 89 },
  { month: "March", year: 2024, pips: 580, trades: 32, winRate: 91 },
  { month: "April", year: 2024, pips: 350, trades: 25, winRate: 88 },
  { month: "May", year: 2024, pips: 720, trades: 35, winRate: 94 },
  { month: "June", year: 2024, pips: 480, trades: 30, winRate: 90 },
  { month: "July", year: 2024, pips: 650, trades: 33, winRate: 93 },
  { month: "August", year: 2024, pips: 390, trades: 27, winRate: 89 },
  { month: "September", year: 2024, pips: 550, trades: 31, winRate: 90 },
  { month: "October", year: 2024, pips: 810, trades: 38, winRate: 95 },
  { month: "November", year: 2024, pips: 620, trades: 34, winRate: 91 },
  { month: "December", year: 2024, pips: 470, trades: 29, winRate: 90 },
  { month: "January", year: 2025, pips: 740, trades: 36, winRate: 92 },
];

export const courses: Course[] = [
  {
    id: "course-1",
    title: "Getting Started with Gold Trading",
    description:
      "Learn the fundamentals of gold trading, including market structure, key terminology, and how to set up your first trading account.",
    difficulty: "beginner",
    duration: "2 hours",
    lessons: 8,
    available: true,
  },
  {
    id: "course-2",
    title: "Mastering MT5 for Gold Traders",
    description:
      "A complete walkthrough of the MetaTrader 5 platform tailored for gold trading. Learn charting, order placement, and essential indicators.",
    difficulty: "beginner",
    duration: "3 hours",
    lessons: 12,
    available: true,
  },
  {
    id: "course-3",
    title: "Reading Charts Like a Pro",
    description:
      "Understand candlestick patterns, timeframe analysis, and how to read price action on gold charts with confidence.",
    difficulty: "beginner",
    duration: "2.5 hours",
    lessons: 10,
    available: true,
  },
  {
    id: "course-4",
    title: "Chart Patterns & Price Action",
    description:
      "Deep dive into advanced chart patterns including head and shoulders, double tops/bottoms, flags, and wedges specific to gold markets.",
    difficulty: "intermediate",
    duration: "4 hours",
    lessons: 15,
    available: true,
  },
  {
    id: "course-5",
    title: "Support, Resistance & Key Levels",
    description:
      "Master the art of identifying high-probability support and resistance zones, psychological levels, and institutional order blocks.",
    difficulty: "intermediate",
    duration: "3.5 hours",
    lessons: 14,
    available: true,
  },
  {
    id: "course-6",
    title: "Fibonacci & Harmonic Trading",
    description:
      "Learn how to apply Fibonacci retracements, extensions, and harmonic patterns to find precision entries in gold trading.",
    difficulty: "intermediate",
    duration: "4 hours",
    lessons: 16,
    available: false,
  },
  {
    id: "course-7",
    title: "Order Flow & Market Microstructure",
    description:
      "Understand how institutional order flow drives gold prices. Learn to read volume profiles, order books, and liquidity zones.",
    difficulty: "advanced",
    duration: "5 hours",
    lessons: 18,
    available: false,
  },
  {
    id: "course-8",
    title: "Multi-Timeframe Analysis Mastery",
    description:
      "Develop a top-down analysis framework combining weekly, daily, and intraday timeframes for high-conviction gold trade setups.",
    difficulty: "advanced",
    duration: "4.5 hours",
    lessons: 16,
    available: false,
  },
  {
    id: "course-9",
    title: "Trading Psychology & Discipline",
    description:
      "Overcome emotional trading, build a bulletproof mindset, and develop the discipline required for consistent profitability.",
    difficulty: "advanced",
    duration: "3 hours",
    lessons: 12,
    available: true,
  },
];

export const faqItems: FAQItem[] = [
  {
    question: "What is the minimum deposit required to start trading?",
    answer:
      "We recommend starting with a minimum of $500 to properly manage risk. However, you can open a trading account with as little as $100. Our signals include risk management guidance suitable for all account sizes.",
  },
  {
    question: "How are signals delivered?",
    answer:
      "Signals are delivered in real-time through our private Telegram channel and Discord server. You will receive entry price, stop loss, and three take profit levels with each signal, along with a brief market analysis.",
  },
  {
    question: "What is your verified win rate?",
    answer:
      "Our win rate consistently ranges between 87% and 95% monthly, verified through our public Myfxbook account. All historical trades are transparent and can be audited by any member at any time.",
  },
  {
    question: "Can I cancel my membership at any time?",
    answer:
      "Yes, you can cancel your membership at any time with no cancellation fees. Your access will continue until the end of your current billing period. We also offer a 7-day free trial for new members.",
  },
  {
    question: "Do you provide financial advice?",
    answer:
      "No, we do not provide financial advice. Our signals and educational content are for informational purposes only. Trading involves significant risk and you should only trade with money you can afford to lose. Always do your own research.",
  },
  {
    question: "Which broker do you recommend?",
    answer:
      "We do not mandate any specific broker. However, we recommend using a regulated broker with tight spreads on gold (XAU/USD). Our team can help you evaluate broker options based on your location and requirements.",
  },
  {
    question: "How long before I see results?",
    answer:
      "Results vary based on account size, risk management, and consistency. Many members report seeing positive results within their first month by following signals with proper risk management. Long-term consistency is our primary goal.",
  },
  {
    question: "Is this suitable for complete beginners?",
    answer:
      "Absolutely. Our beginner course series covers everything from setting up your trading account to understanding charts. Our community is supportive and our team provides guidance through every step of your trading journey.",
  },
  {
    question: "What community features are included?",
    answer:
      "Members get access to our private Telegram group, Discord server with dedicated channels, weekly live market analysis sessions, daily market updates, and direct messaging with our analysts for trade queries.",
  },
  {
    question: "How do you manage risk on your signals?",
    answer:
      "Every signal includes a clearly defined stop loss level. We typically risk 1-2% per trade and use a favorable risk-to-reward ratio of at least 1:2. We also provide position size calculators and risk management guides for all members.",
  },
];

export const timelineEvents: TimelineEvent[] = [
  {
    date: "2016",
    title: "The Trading Journey Begins",
    description:
      "Shabbaranks and core team members enter the financial markets, starting with cryptocurrency trading and building the discipline that would define AIOV Capital.",
  },
  {
    date: "2020",
    title: "Expanding Into Forex",
    description:
      "The team broadens its market expertise into forex trading, developing institutional-grade risk management strategies and a refined approach to reading markets.",
  },
  {
    date: "2022",
    title: "AIOV Capital Founded",
    description:
      "With a proven edge in XAU/USD gold markets, Shabbaranks launches AIOV Capital as a private Telegram community — sharing real-time signals and analysis with a close group of traders.",
  },
  {
    date: "2024",
    title: "Brand Launch & Global Growth",
    description:
      "AIOV Capital officially launches as a professional trading brand. The community grows to 5,000+ members worldwide, delivering 8–10 signals per day with a reported 91% win rate.",
  },
  {
    date: "2026",
    title: "New Platform & Expanded Team",
    description:
      "A brand new website and member platform launches alongside an expanded team of traders and educators — bringing professional-grade tools and education to the entire community.",
  },
];
