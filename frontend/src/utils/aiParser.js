// SpendWise Smart Natural Language Expense Parser (Indian Student Context)
// Automatically extracts Amount, Category, and Description from natural Indian student phrasing

const CATEGORY_KEYWORDS = {
  Food: [
    "swiggy", "zomato", "canteen", "lunch", "dinner", "breakfast", "coffee",
    "chai", "tea", "burger", "pizza", "biryani", "snack", "groceries", "milk",
    "mess", "mcdonalds", "kfc", "dominos", "cafe", "dhaba", "samosa", "maggi",
    "maggie", "tapri", "dosa", "roti", "thali", "paratha", "momos", "shawarma",
    "bhelpuri", "pani puri", "chaat", "roll", "kachori", "vada pav", "poha", "lassi"
  ],
  Transport: [
    "metro", "bus", "uber", "ola", "auto", "rapido", "train", "fuel", "petrol",
    "diesel", "cab", "rickshaw", "toll", "parking", "flight", "chalan", "scooty",
    "bike", "pass", "local train"
  ],
  Education: [
    "book", "books", "xerox", "print", "printing", "stationery", "pen", "notebook",
    "tuition", "exam", "course", "udemy", "coursera", "college fee", "library",
    "assignment", "lab manual", "practical", "coaching", "semester fee", "gate",
    "notes", "photocopy", "calculator"
  ],
  "Hostel & Rent": [
    "rent", "hostel", "pg", "room", "flat", "landlord", "maintenance", "deposit",
    "electricity", "bijli bill", "water bill", "maid", "cook", "laundry"
  ],
  "Mobile & Wi-Fi": [
    "recharge", "wifi", "wi-fi", "jio", "airtel", "vi", "broadband", "fiber",
    "data pack", "phone bill", "hotspot", "sim"
  ],
  Entertainment: [
    "movie", "cinema", "pvr", "inox", "game", "gaming", "steam", "concert", "match",
    "bowling", "clubbing", "party", "outing", "billiards", "playstation", "adda",
    "hangout", "street food", "amusement"
  ],
  Shopping: [
    "myntra", "amazon", "flipkart", "clothes", "shirt", "pants", "shoes", "zara",
    "h&m", "jacket", "dress", "tshirt", "sneakers", "meesho", "ajio", "snitch",
    "bazaar", "market"
  ],
  Health: [
    "medicine", "meds", "doctor", "pharmacy", "clinic", "hospital", "tablet", "syrup",
    "gym", "protein", "supplement", "dentist", "crocin", "paracetamol", "dawai",
    "chemist", "bandage", "whey"
  ],
  Subscriptions: [
    "netflix", "spotify", "prime", "chatgpt", "youtube", "github", "subscription",
    "hotstar", "jiocinema", "icloud", "google one", "notion", "adobe", "leetcode"
  ],
  "College Events": [
    "fest", "freshers", "farewell", "club", "society", "symposium", "hackathon",
    "department", "t-shirt fest", "tshirt fest", "sports meet", "dj night", "annual day"
  ]
};

export function parseNaturalLanguageInput(rawInput) {
  if (!rawInput || typeof rawInput !== "string") return null;
  const input = rawInput.trim();
  if (input.length < 2) return null;

  // Extract amount: handles "₹50", "Rs 50", "Rs. 50", "50 rs", "50/-", "50 rupay", "50 inr"
  const amountMatch =
    input.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d{1,2})?)\s*(?:\/-|rs|rupay|rupees|inr)?/i) ||
    input.match(/(\d+(?:\.\d{1,2})?)/);

  let amount = "";
  if (amountMatch) {
    amount = amountMatch[1];
  }

  // Detect category based on Indian keywords
  const lower = input.toLowerCase();
  let detectedCategory = null;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        detectedCategory = category;
        break;
      }
    }
    if (detectedCategory) break;
  }

  // Clean description by removing currency symbols and numbers
  let description = input
    .replace(/(?:₹|rs\.?|inr)\s*\d+(?:\.\d{1,2})?/gi, "")
    .replace(/\d+(?:\.\d{1,2})?\s*(?:\/-|rs|rupay|rupees|inr)/gi, "")
    .replace(/\b\d+(?:\.\d{1,2})?\b/g, "")
    .replace(/[/-]/g, " ")
    .trim();

  // Clean up extra whitespaces
  description = description.replace(/\s+/g, " ");

  // If description became empty, default to detected category or input
  if (!description || description.length < 2) {
    description = detectedCategory || input;
  }

  return {
    amount: amount || "",
    category: detectedCategory || "",
    description
  };
}
