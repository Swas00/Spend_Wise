const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/api\/expenses$/, "");
  }
  return import.meta.env.PROD ? "" : "http://127.0.0.1:5001";
};

const BASE_URL = getBaseUrl();

// Helper to retrieve token from localStorage
export const getStoredToken = () => {
  try {
    return localStorage.getItem("spendwise-token");
  } catch {
    return null;
  }
};

// Helper for JSON headers with Authorization
const getAuthHeaders = () => {
  const token = getStoredToken();
  const headers = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

// -------------------------------------------------------------
// Authentication Endpoints
// -------------------------------------------------------------

export const registerUser = async (userData) => {
  const response = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(userData)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Registration failed");
  }
  return data;
};

export const loginUser = async (credentials) => {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(credentials)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Authentication failed");
  }
  return data;
};

export const getProfile = async () => {
  const response = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: getAuthHeaders()
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch user profile");
  }
  return data;
};

export const requestPasswordReset = async (email) => {
  const response = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to request password reset");
  }
  return data;
};

export const verifyRecoveryCode = async (email, code) => {
  const response = await fetch(`${BASE_URL}/api/auth/verify-recovery-code`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, code })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Invalid or expired recovery code");
  }
  return data;
};

export const resetPassword = async (payload) => {
  const response = await fetch(`${BASE_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to reset password");
  }
  return data;
};

// -------------------------------------------------------------
// Expenses Endpoints (Authenticated)
// -------------------------------------------------------------

export const getExpenses = async () => {
  const response = await fetch(`${BASE_URL}/api/expenses`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch expenses: ${response.statusText}`);
  }
  return response.json();
};

export const createExpense = async (expenseData) => {
  const response = await fetch(`${BASE_URL}/api/expenses`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(expenseData)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to create expense");
  }
  return data;
};

export const updateExpense = async (id, expenseData) => {
  const response = await fetch(`${BASE_URL}/api/expenses/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(expenseData)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update expense");
  }
  return data;
};

export const deleteExpense = async (id) => {
  const response = await fetch(`${BASE_URL}/api/expenses/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to delete expense");
  }
  return data;
};

// -------------------------------------------------------------
// Income Endpoints
// -------------------------------------------------------------

export const getIncomes = async () => {
  const response = await fetch(`${BASE_URL}/api/incomes`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch income stream");
  }
  return response.json();
};

export const createIncome = async (incomeData) => {
  const response = await fetch(`${BASE_URL}/api/incomes`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(incomeData)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to record income");
  }
  return data;
};

export const deleteIncome = async (id) => {
  const response = await fetch(`${BASE_URL}/api/incomes/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to delete income");
  }
  return data;
};

// -------------------------------------------------------------
// Student Budget Endpoints
// -------------------------------------------------------------

export const getCurrentBudget = async (month) => {
  const url = month
    ? `${BASE_URL}/api/budgets/current?month=${month}`
    : `${BASE_URL}/api/budgets/current`;
  const response = await fetch(url, {
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch budget");
  }
  return response.json();
};

export const saveBudget = async (budgetData) => {
  const response = await fetch(`${BASE_URL}/api/budgets`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(budgetData)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to save budget");
  }
  return data;
};

// -------------------------------------------------------------
// Savings Goals Endpoints
// -------------------------------------------------------------

export const getSavingsGoals = async () => {
  const response = await fetch(`${BASE_URL}/api/goals`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch savings goals");
  }
  return response.json();
};

export const createSavingsGoal = async (goalData) => {
  const response = await fetch(`${BASE_URL}/api/goals`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(goalData)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to create savings goal");
  }
  return data;
};

export const depositToSavingsGoal = async (id, amount) => {
  const response = await fetch(`${BASE_URL}/api/goals/${id}/deposit`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ amount })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to deposit to savings goal");
  }
  return data;
};

export const deleteSavingsGoal = async (id) => {
  const response = await fetch(`${BASE_URL}/api/goals/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to delete savings goal");
  }
  return data;
};

// -------------------------------------------------------------
// Split Bill Endpoints (Roommates & Friends)
// -------------------------------------------------------------

export const getSplitBills = async () => {
  const response = await fetch(`${BASE_URL}/api/splits`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch split bills");
  }
  return response.json();
};

export const createSplitBill = async (splitData) => {
  const response = await fetch(`${BASE_URL}/api/splits`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(splitData)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to create split bill");
  }
  return data;
};

export const toggleSettleParticipant = async (billId, participantIndex) => {
  const response = await fetch(`${BASE_URL}/api/splits/${billId}/settle/${participantIndex}`, {
    method: "PATCH",
    headers: getAuthHeaders()
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update settlement status");
  }
  return data;
};

export const deleteSplitBill = async (id) => {
  const response = await fetch(`${BASE_URL}/api/splits/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to delete split bill");
  }
  return data;
};

// -------------------------------------------------------------
// AI Student Financial Advisor & Insights
// -------------------------------------------------------------

export const getStudentInsights = async () => {
  const response = await fetch(`${BASE_URL}/api/advisor/insights`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch student insights");
  }
  return response.json();
};

export const askAIAdvisor = async (query) => {
  const response = await fetch(`${BASE_URL}/api/advisor/query`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ query })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Advisor query failed");
  }
  return data;
};
