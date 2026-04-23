/**
 * AI Assistant Knowledge Base
 * Smart pattern-matching responses for financial guidance & platform help.
 */

const knowledgeBase = [
  // ─── PLATFORM NAVIGATION ───
  {
    keywords: ['how to', 'add transaction', 'create transaction', 'new transaction'],
    response: `📝 **Adding a Transaction is easy!**\n\nHere's how:\n1. Go to the **Transactions** page from the sidebar\n2. Click the **"+ Add Transaction"** button at the top\n3. Choose the type: **Income** or **Expense**\n4. Select a category, enter the amount, date, and optional description\n5. Click **Save** — done!\n\n💡 **Pro tip:** Add transactions as they happen to keep your records accurate.`
  },
  {
    keywords: ['budget', 'set budget', 'create budget', 'spending limit'],
    response: `🎯 **Setting Up a Budget**\n\nBudgets help you control spending:\n1. Navigate to the **Budgets** page\n2. Click **"+ Set Budget"**\n3. Choose an expense category (e.g., Groceries, Entertainment)\n4. Enter your monthly spending limit\n5. Track your progress with the visual progress bars!\n\n✅ **Do:** Set realistic limits based on past spending\n❌ **Don't:** Set budgets too tight — it leads to frustration\n\n💡 You'll get alerts when you're approaching or exceeding limits.`
  },
  {
    keywords: ['report', 'analytics', 'chart', 'graph', 'trend', 'spending trend'],
    response: `📈 **Reports & Analytics**\n\nGet insights into your finances:\n1. Go to the **Reports** page\n2. View **Monthly Expenses** breakdown by category\n3. Track **Income vs Expenses** over time\n4. Check your **Yearly Summary** for the big picture\n5. Use the **Category Details** table for deep dives\n\n💡 **Pro tip:** Review your reports weekly to spot spending patterns early.`
  },
  {
    keywords: ['convert', 'currency', 'exchange rate', 'converter'],
    response: `💱 **Currency Converter**\n\nConvert between currencies:\n1. Go to the **Converter** page\n2. Select your source and target currencies\n3. Enter the amount — conversion happens instantly!\n4. Use the ↔ button to quickly swap currencies\n5. Check the **Popular Exchange Rates** section for quick reference\n\nSupported: INR, USD, EUR, GBP, JPY`
  },
  {
    keywords: ['profile', 'update profile', 'change name', 'change email', 'edit profile'],
    response: `👤 **Managing Your Profile**\n\n1. Click **Profile** in the sidebar\n2. You can update your **name** and **email** in the Edit Profile section\n3. To change your password, use the **Change Password** section\n4. Language and currency preferences are also available\n\n🔒 **Security tip:** Use a strong, unique password with at least 8 characters.`
  },
  {
    keywords: ['help', 'support', 'report bug', 'issue', 'problem', 'ticket'],
    response: `❓ **Getting Help**\n\n1. Visit the **Help Center** from the sidebar\n2. Check the **FAQ** section for common answers\n3. To report a bug or issue, use the **Report Issue** tab\n4. Track your submitted tickets in **My Tickets**\n5. Each ticket has a chat where you can add updates\n\n💡 When reporting bugs, include steps to reproduce the issue for faster resolution.`
  },

  // ─── FINANCIAL GUIDANCE ───
  {
    keywords: ['save money', 'saving', 'savings tips', 'how to save'],
    response: `💰 **Smart Saving Tips**\n\n✅ **Do's:**\n• Follow the **50/30/20 rule**: 50% needs, 30% wants, 20% savings\n• Set up **automatic transfers** to a savings account\n• Track every expense — awareness is the first step\n• Set specific savings goals with deadlines\n• Build an **emergency fund** (3-6 months of expenses)\n\n❌ **Don'ts:**\n• Don't save what's left after spending — save first!\n• Don't ignore small expenses — they add up\n• Don't keep all savings in one place\n\n💡 Use Paise Kaha's budget feature to enforce your savings targets!`
  },
  {
    keywords: ['invest', 'investment', 'where to invest', 'mutual fund', 'stock'],
    response: `📊 **Investment Guidance**\n\n✅ **Do's:**\n• Start investing early — compound interest is powerful\n• Diversify across stocks, mutual funds, FDs, and bonds\n• Invest regularly (SIP) rather than timing the market\n• Learn before you invest — understand what you're buying\n• Keep an emergency fund BEFORE investing\n\n❌ **Don'ts:**\n• Don't invest money you'll need within 1-2 years\n• Don't put all eggs in one basket\n• Don't make emotional decisions based on market swings\n• Never invest borrowed money\n\n⚠️ **Note:** I provide general guidance only. Consult a certified financial advisor for personalized advice.`
  },
  {
    keywords: ['debt', 'loan', 'emi', 'credit card', 'pay off debt'],
    response: `💳 **Managing Debt Wisely**\n\n✅ **Do's:**\n• List all debts with interest rates and minimum payments\n• Use the **Avalanche method** (pay highest interest first) or **Snowball method** (pay smallest balance first)\n• Always pay more than the minimum on credit cards\n• Avoid new debt while paying off existing ones\n\n❌ **Don'ts:**\n• Don't ignore debt — it grows with interest\n• Don't take new loans to pay old ones (debt trap)\n• Don't miss EMI payments — it affects your credit score\n• Don't use credit cards for everyday purchases if you carry a balance\n\n💡 Track your loan payments as expenses in Paise Kaha to stay accountable.`
  },
  {
    keywords: ['expense', 'reduce expense', 'cut spending', 'overspending', 'too much spending'],
    response: `✂️ **Reducing Expenses**\n\n**Quick wins:**\n• Cancel unused subscriptions (review them monthly!)\n• Cook at home more — dining out is 3-5x costlier\n• Use the 24-hour rule for non-essential purchases\n• Compare prices before buying\n• Use cashback and rewards programs\n\n**Track with Paise Kaha:**\n1. Categorize all expenses\n2. Review the **Reports** page to find your biggest spending areas\n3. Set **budgets** for problem categories\n4. Review weekly — not just monthly\n\n💡 The #1 tip: Track everything. You can't improve what you don't measure!`
  },
  {
    keywords: ['emergency fund', 'rainy day', 'safety net'],
    response: `🛡️ **Building an Emergency Fund**\n\n**Why it matters:** Unexpected expenses (medical, car repair, job loss) can derail your finances.\n\n**How much:** Aim for **3-6 months** of essential expenses\n\n**Steps:**\n1. Calculate your monthly essential expenses\n2. Multiply by 3 (minimum) to 6 (ideal)\n3. Open a separate savings account\n4. Set up automatic monthly transfers\n5. Don't touch it unless it's a TRUE emergency\n\n✅ **Do:** Keep it liquid (savings account, not investments)\n❌ **Don't:** Use it for vacations or shopping\n\n💡 Track your emergency fund progress as a budget goal in Paise Kaha!`
  },
  {
    keywords: ['income', 'increase income', 'earn more', 'side hustle', 'extra money'],
    response: `📈 **Increasing Your Income**\n\n**Ideas:**\n• Freelancing in your existing skills\n• Teaching/tutoring online\n• Starting a small side business\n• Selling unused items\n• Investing in learning new high-demand skills\n\n**Career growth:**\n• Ask for a raise with data-backed achievements\n• Switch jobs every 2-3 years for salary jumps\n• Network actively — most opportunities come through connections\n• Learn high-value skills (programming, data analysis, marketing)\n\n💡 Track all income sources in Paise Kaha to see the full picture!`
  },

  // ─── APP FEATURES ───
  {
    keywords: ['feature', 'what can', 'capabilities', 'what does', 'overview'],
    response: `🏦 **Paise Kaha Features**\n\n📊 **Dashboard** — Financial overview at a glance\n💳 **Transactions** — Track income & expenses with categories\n🎯 **Budgets** — Set spending limits & get alerts\n📈 **Reports** — Charts, trends & analytics\n💱 **Converter** — Real-time currency conversion\n👤 **Profile** — Manage your account settings\n❓ **Help Center** — FAQ, report issues, get support\n🤖 **AI Assistant** — That's me! Financial guidance & tips\n\n🌐 **Multi-language** support (English, Hindi, Spanish, French)\n💲 **Multi-currency** support (INR, USD, EUR, GBP, JPY)`
  },
  {
    keywords: ['export', 'csv', 'download', 'data export'],
    response: `📥 **Exporting Your Data**\n\n1. Go to the **Transactions** page\n2. Apply any filters you want (type, category, search)\n3. Click the **"📥 Export CSV"** button at the top\n4. Your filtered transactions will download as a CSV file\n5. Open in Excel or Google Sheets for further analysis\n\n💡 **Pro tip:** Export monthly for your records and tax preparation.`
  },
  {
    keywords: ['language', 'change language', 'hindi', 'spanish', 'french'],
    response: `🌐 **Changing Language**\n\nPaise Kaha supports 4 languages:\n• 🇺🇸 English\n• 🇮🇳 Hindi (हिन्दी)\n• 🇪🇸 Spanish (Español)\n• 🇫🇷 French (Français)\n\n**How to change:**\n1. Look at the bottom of the **sidebar**\n2. Find the **🌐 Language** dropdown\n3. Select your preferred language\n4. The entire app updates instantly!\n\n💡 Your language preference is saved automatically.`
  },

  // ─── GENERAL / FALLBACK ───
  {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'namaste'],
    response: `👋 **Hello! Welcome to your financial assistant!**\n\nI'm here to help you with:\n• 💡 Financial tips and guidance\n• 🧭 Navigating the platform\n• 📊 Understanding your spending\n• 🎯 Setting and achieving financial goals\n\nWhat would you like to know about? Try asking me about budgeting, saving, or how to use any feature!`
  },
  {
    keywords: ['thank', 'thanks', 'thank you', 'awesome', 'great', 'helpful'],
    response: `😊 You're welcome! I'm glad I could help.\n\nFeel free to ask me anything else about managing your finances or using Paise Kaha. I'm always here!\n\n💡 Remember: Small financial habits today lead to big results tomorrow! 🚀`
  },
  {
    keywords: ['who are you', 'what are you', 'about you', 'your name'],
    response: `🤖 I'm **Paise Kaha AI Assistant** — your personal financial guide!\n\nI can help you with:\n• Understanding platform features\n• Financial planning and budgeting tips\n• Do's and don'ts for money management\n• Step-by-step guidance for using the app\n\nI'm built into Paise Kaha to make your financial journey smoother. Think of me as your friendly money mentor! 💰`
  },
];

const fallbackResponses = [
  `🤔 I'm not sure I understand that completely, but let me try to help!\n\nI can assist you with:\n• **Platform navigation** — How to use any feature\n• **Financial tips** — Saving, budgeting, investing\n• **Troubleshooting** — Report issues via Help Center\n\nCould you rephrase your question or try one of these topics?`,
  `💭 That's an interesting question! While I may not have a specific answer for that, I'd love to help with:\n\n• How to track transactions\n• Setting up budgets\n• Financial planning tips\n• Using the currency converter\n\nWhat would you like to explore?`,
  `🧠 I'm still learning! For now, I'm best at helping with:\n\n• 📊 Using Paise Kaha's features\n• 💰 Money management tips\n• 🎯 Budgeting strategies\n• 📈 Understanding your finances\n\nTry asking about any of these topics!`,
];

export function getAIResponse(userMessage) {
  const msg = userMessage.toLowerCase().trim();

  // Find the best matching response
  let bestMatch = null;
  let bestScore = 0;

  for (const entry of knowledgeBase) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (msg.includes(keyword.toLowerCase())) {
        score += keyword.split(' ').length; // multi-word keywords score higher
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  if (bestMatch && bestScore > 0) {
    return bestMatch.response;
  }

  // Return a random fallback
  return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
}
