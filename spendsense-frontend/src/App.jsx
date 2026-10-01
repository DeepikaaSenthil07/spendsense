import { useEffect, useRef, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './App.css';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [categorySuggestion, setCategorySuggestion] = useState(null);
  const [isSuggestingCategory, setIsSuggestingCategory] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');

  const formSectionRef = useRef(null);
  const suggestionRequestRef = useRef(0);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'EXPENSE',
    category: '',
    description: '',
    date: ''
  });

  // =========================
  // FETCH TRANSACTIONS
  // =========================

  const fetchTransactions = async () => {
    try {
      const response = await fetch(
        'http://localhost:8080/transactions'
      );

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // =========================
  // FORM HANDLING
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // =========================
  // CATEGORY SUGGESTION
  // =========================

  const getCategorySuggestion = async (title, description) => {
  if (!title.trim() && !description.trim()) {
    setCategorySuggestion(null);
    setIsSuggestingCategory(false);
    return;
  }

  const requestId = ++suggestionRequestRef.current;

  setIsSuggestingCategory(true);

  try {
    const response = await fetch(
      `http://localhost:8080/transactions/suggest-category-details?title=${encodeURIComponent(
        title
      )}&description=${encodeURIComponent(description)}`
    );

    if (!response.ok) {
      throw new Error("Failed to get category suggestion");
    }

    const data = await response.json();

    if (requestId !== suggestionRequestRef.current) {
      return;
    }

    setCategorySuggestion(data);
  } catch (error) {
    if (requestId !== suggestionRequestRef.current) {
      return;
    }

    console.error("Category suggestion error:", error);
    setCategorySuggestion(null);
  } finally {
    if (requestId === suggestionRequestRef.current) {
      setIsSuggestingCategory(false);
    }
  }
};
useEffect(() => {
  const title = formData.title.trim();
  const description = formData.description.trim();

  if (!title && !description) {
    setCategorySuggestion(null);
    return;
  }

  const timer = setTimeout(() => {
    getCategorySuggestion(title, description);
  }, 500);

  return () => clearTimeout(timer);
}, [formData.title, formData.description]);

  // =========================
  // SUBMIT NEW TRANSACTION
  // =========================
  const validateTransaction = () => {
  const title = formData.title.trim();
  const amount = Number(formData.amount);
  const category = formData.category;
  const date = formData.date;

  if (!title) {
    alert('Please enter a transaction title.');
    return false;
  }

  if (!formData.amount || isNaN(amount) || amount <= 0) {
    alert('Amount must be greater than zero.');
    return false;
  }

  if (!category) {
    alert('Please select a category.');
    return false;
  }

  if (!date) {
    alert('Please select a date.');
    return false;
  }

  const selectedDate = new Date(`${date}T00:00:00`);
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  if (selectedDate > today) {
    alert('Transaction date cannot be in the future.');
    return false;
  }

  return true;
};
  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateTransaction()) {
    return;
  }

  try {
      const response = await fetch(
        'http://localhost:8080/transactions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save transaction');
      }

      const newTransaction = await response.json();

      setTransactions((prevTransactions) => [
        ...prevTransactions,
        newTransaction
      ]);

      alert('Transaction added successfully.');

      setFormData({
        title: '',
        amount: '',
        type: 'EXPENSE',
        category: '',
        description: '',
        date: ''
      });

      setCategorySuggestion(null);

    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Could not save transaction.');
    }
  };

  // =========================
  // DELETE TRANSACTION
  // =========================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this transaction?'
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/transactions/${id}`,
        {
          method: 'DELETE'
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }

      setTransactions((prevTransactions) =>
        prevTransactions.filter(
          (transaction) => transaction.id !== id
        )
      );

      alert('Transaction deleted successfully.');

    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Could not delete transaction.');
    }
  };

  // =========================
  // EDIT TRANSACTION
  // =========================

  const handleEdit = (transaction) => {
    setEditingId(transaction.id);

    setFormData({
      title: transaction.title || '',
      amount: transaction.amount || '',
      type: transaction.type || 'EXPENSE',
      category: transaction.category || '',
      description: transaction.description || '',
      date: transaction.date || ''
    });

    setCategorySuggestion(null);

    setTimeout(() => {
      formSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };

  // =========================
  // UPDATE TRANSACTION
  // =========================

  const handleUpdate = async (e) => {
  e.preventDefault();

  if (!validateTransaction()) {
    return;
  }

  try {
      const response = await fetch(
        `http://localhost:8080/transactions/${editingId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update transaction');
      }

      const updatedTransaction = await response.json();

      setTransactions((prevTransactions) =>
        prevTransactions.map((transaction) =>
          transaction.id === editingId
            ? updatedTransaction
            : transaction
        )
      );

      alert('Transaction updated successfully.');

      setEditingId(null);

      setFormData({
        title: '',
        amount: '',
        type: 'EXPENSE',
        category: '',
        description: '',
        date: ''
      });

      setCategorySuggestion(null);

    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Could not update transaction.');
    }
  };

  // =========================
  // CANCEL EDIT
  // =========================

  const handleCancelEdit = () => {
    setEditingId(null);

    setFormData({
      title: '',
      amount: '',
      type: 'EXPENSE',
      category: '',
      description: '',
      date: ''
    });

    setCategorySuggestion(null);
  };

  // =========================
  // FINANCIAL CALCULATIONS
  // =========================

  const totalIncome = transactions
    .filter(
      (transaction) => transaction.type === 'INCOME'
    )
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0
    );

  const totalExpense = transactions
    .filter(
      (transaction) => transaction.type === 'EXPENSE'
    )
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0
    );

  const currentBalance = totalIncome - totalExpense;

  const transactionCount = transactions.length;

  const thisMonthExpense = transactions
    .filter((transaction) => {
      const transactionDate = new Date(
        transaction.date
      );

      const today = new Date();

      return (
        transaction.type === 'EXPENSE' &&
        transactionDate.getMonth() ===
          today.getMonth() &&
        transactionDate.getFullYear() ===
          today.getFullYear()
      );
    })
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0
    );
 
  // =========================
  // CATEGORY TOTALS
  // =========================

  const categoryTotals = {};

  transactions
    .filter(
      (transaction) => transaction.type === 'EXPENSE'
    )
    .forEach((transaction) => {
      const category = transaction.category || 'OTHER';

      categoryTotals[category] =
        (categoryTotals[category] || 0) +
        Number(transaction.amount);
    });
    // =========================
// MONTHLY SPENDING
// =========================

const monthlyTotals = {};

transactions
  .filter((transaction) => transaction.type === 'EXPENSE')
  .forEach((transaction) => {
    if (!transaction.date) {
      return;
    }

    const month = transaction.date.substring(0, 7);

    monthlyTotals[month] =
      (monthlyTotals[month] || 0) +
      Number(transaction.amount);
  });

const monthlyData = Object.entries(monthlyTotals)
  .sort(([monthA], [monthB]) => monthA.localeCompare(monthB))
  .map(([month, amount]) => ({
    month,
    amount
  }));
// =========================
// FINANCIAL INSIGHTS
// =========================

const expenseTransactions = transactions.filter(
  (transaction) => transaction.type === 'EXPENSE'
);

const largestExpense = expenseTransactions.reduce(
  (largest, transaction) => {
    if (!largest || Number(transaction.amount) > Number(largest.amount)) {
      return transaction;
    }

    return largest;
  },
  null
);

const averageExpense =
  expenseTransactions.length > 0
    ? totalExpense / expenseTransactions.length
    : 0;

const largestCategory =
  Object.entries(categoryTotals).length > 0
    ? Object.entries(categoryTotals).reduce(
        (largest, current) =>
          current[1] > largest[1] ? current : largest
      )
    : null;
    <section className="monthly-section">
  <h2>Monthly Spending</h2>

  {monthlyData.length === 0 ? (
    <p className="empty-message">
      No monthly spending data available yet.
    </p>
  ) : (
    <div className="monthly-grid">
      {monthlyData.map(({ month, amount }) => {
        const [year, monthNumber] = month.split('-');

        const monthName = new Date(
          Number(year),
          Number(monthNumber) - 1
        ).toLocaleString('en-US', {
          month: 'long',
          year: 'numeric'
        });

        return (
          <div
            className="monthly-card"
            key={month}
          >
            <h3>{monthName}</h3>

            <p>
              ₹{amount.toFixed(2)}
            </p>
          </div>
        );
      })}
    </div>
  )}
</section>
  // =========================
  // PIE CHART DATA
  // =========================

  const chartData = Object.entries(categoryTotals).map(
    ([category, amount]) => ({
      name: category,
      value: amount
    })
  );

  const chartColors = [
    '#6366f1',
    '#22c55e',
    '#f59e0b',
    '#ef4444',
    '#06b6d4',
    '#a855f7',
    '#ec4899',
    '#84cc16'
  ];

  // =========================
  // SEARCH & FILTER
  // =========================

  const filteredTransactions = transactions.filter(
    (transaction) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        (transaction.title || '')
          .toLowerCase()
          .includes(search) ||
        (transaction.description || '')
          .toLowerCase()
          .includes(search);

      const matchesType =
        filterType === 'ALL' ||
        transaction.type === filterType;

      const matchesCategory =
        filterCategory === 'ALL' ||
        transaction.category === filterCategory;

      return (
        matchesSearch &&
        matchesType &&
        matchesCategory
      );
    }
  );

  // =========================
  // RENDER
  // =========================

  return (
    <div className="app">

      {/* Header */}

      <header className="header">

        <h1>SpendSense</h1>

        <p>
          Personal Finance Tracker
        </p>

      </header>

      <main className="main-content">

        {/* Hero */}

        <section className="hero">

          <h2>
            Track. Understand. Spend Smarter.
          </h2>

          <p>
            Manage your income and expenses
            in one simple place.
          </p>

        </section>

        {/* =========================
            FINANCIAL SUMMARY
        ========================= */}

        <section className="financial-summary">

          <div className="summary-card">

            <span>Total Income</span>

            <h3>
              ₹{totalIncome.toFixed(2)}
            </h3>

          </div>

          <div className="summary-card">

            <span>Total Expense</span>

            <h3>
              ₹{totalExpense.toFixed(2)}
            </h3>

          </div>

          <div className="summary-card">

            <span>Current Balance</span>

            <h3>
              ₹{currentBalance.toFixed(2)}
            </h3>

          </div>

          <div className="summary-card">

            <span>This Month's Spending</span>

            <h3>
              ₹{thisMonthExpense.toFixed(2)}
            </h3>

          </div>

          <div className="summary-card">

            <span>Total Transactions</span>

            <h3>
              {transactionCount}
            </h3>

          </div>

        </section>
        <section className="insights-section">
  <h2>Financial Insights</h2>

  <div className="insight-grid">

    <div className="insight-card">
      <span>Top Spending Category</span>

      <h3>
        {largestCategory
          ? largestCategory[0]
          : 'No data'}
      </h3>

      <p>
        {largestCategory
          ? `₹${Number(largestCategory[1]).toFixed(2)} spent`
          : 'Add expenses to see insights.'}
      </p>
    </div>

    <div className="insight-card">
      <span>Largest Expense</span>

      <h3>
        {largestExpense
          ? largestExpense.title
          : 'No data'}
      </h3>

      <p>
        {largestExpense
          ? `₹${Number(largestExpense.amount).toFixed(2)}`
          : 'Add expenses to see insights.'}
      </p>
    </div>

    <div className="insight-card">
      <span>Average Expense</span>

      <h3>
        ₹{averageExpense.toFixed(2)}
      </h3>

      <p>
        Based on {expenseTransactions.length} expense
        {expenseTransactions.length === 1 ? '' : 's'}
      </p>
    </div>

  </div>
</section>
        {/* =========================
            MONTHLY SPENDING
        ========================= */}

        <section className="monthly-section">
          <h2>Monthly Spending</h2>

          {monthlyData.length === 0 ? (
            <p className="empty-message">
              No monthly spending data available yet.
            </p>
          ) : (
            <div className="monthly-grid">
              {monthlyData.map(({ month, amount }) => {
                const [year, monthNumber] =
                  month.split('-');

                const monthName = new Date(
                  Number(year),
                  Number(monthNumber) - 1
                ).toLocaleString('en-US', {
                  month: 'long',
                  year: 'numeric'
                });

                return (
                  <div
                    className="monthly-card"
                    key={month}
                  >
                    <h3>{monthName}</h3>

                    <p>
                      ₹{amount.toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
        {/* =========================
            TRANSACTION FORM
        ========================= */}

        <section
          className="form-section"
          ref={formSectionRef}
        >

          <h2>
            {editingId
              ? 'Edit Transaction'
              : 'Add Transaction'}
          </h2>

          <form
            onSubmit={
              editingId
                ? handleUpdate
                : handleSubmit
            }
          >

            {/* Title */}

            <input
  type="text"
  name="title"
  placeholder="Transaction title"
  value={formData.title}
  onChange={(e) => {
  setFormData({
    ...formData,
    title: e.target.value
  });
}}
  required
/>

            {/* Amount */}

            <input
              type="number"
              name="amount"
              placeholder="Amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              min="0.01"
              required
            />

            {/* Type */}

            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >

              <option value="EXPENSE">
                Expense
              </option>

              <option value="INCOME">
                Income
              </option>

            </select>

            {/* Category */}

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >

              <option value="">
                Select Category
              </option>

              <option value="FOOD">
                Food
              </option>

              <option value="TRANSPORT">
                Transport
              </option>

              <option value="EDUCATION">
                Education
              </option>

              <option value="SHOPPING">
                Shopping
              </option>

              <option value="ENTERTAINMENT">
                Entertainment
              </option>

              <option value="HEALTH">
                Health
              </option>

              <option value="BILLS">
                Bills
              </option>

              <option value="OTHER">
                Other
              </option>

            </select>

            {/* Date */}

            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />

            {/* Description */}

            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={(e) => {
  setFormData({
    ...formData,
    description: e.target.value
  });
}}
            />

            {/* =========================
                CATEGORY SUGGESTION
            ========================= */}
            {isSuggestingCategory && (
  <div className="category-suggestion analyzing">
    <span>Analyzing transaction...</span>
  </div>
)}
            {categorySuggestion && (
  <div className="category-suggestion">
    <div className="suggestion-info">
      <div>
        Suggested category:{' '}
        <strong>{categorySuggestion.category}</strong>
      </div>

      <div className="confidence-section">
  <div className="confidence-header">
    <span>Confidence</span>

    <strong>
      {Math.round(categorySuggestion.confidence * 100)}%
    </strong>
  </div>

  <div className="confidence-bar">
    <div
      className="confidence-fill"
      style={{
        width: `${Math.min(
          categorySuggestion.confidence * 100,
          100
        )}%`
      }}
    />
  </div>
</div>

      {categorySuggestion.matchedKeywords?.length > 0 && (
        <div>
          Matched keywords:{' '}
          <strong>
            {categorySuggestion.matchedKeywords.join(', ')}
          </strong>
        </div>
      )}

      <div>
        {categorySuggestion.reason}
      </div>
    </div>

    <div className="suggestion-actions">
      <button
        type="button"
        className="use-suggestion-btn"
        onClick={() => {
          setFormData({
            ...formData,
            category: categorySuggestion.category
          });

          setCategorySuggestion(null);
        }}
      >
        Use {categorySuggestion.category}
      </button>

      <button
        type="button"
        className="dismiss-suggestion-btn"
        onClick={() => {
          setCategorySuggestion(null);
        }}
      >
        Dismiss
      </button>
    </div>
  </div>
)}

            {/* Form Actions */}

            <div className="form-actions">

              <button
                type="submit"
                className="submit-btn"
              >
                {editingId
                  ? 'Update Transaction'
                  : 'Add Transaction'}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCancelEdit}
                >
                  Cancel Edit
                </button>
              )}

            </div>

          </form>

        </section>

        {/* =========================
            SPENDING BY CATEGORY
        ========================= */}

        <section className="category-section">

          <h2>
            Spending by Category
          </h2>

          {Object.keys(categoryTotals).length === 0 ? (

            <p>
              No expense data available yet.
            </p>

          ) : (

            <div className="category-list">

              {Object.entries(categoryTotals).map(
                ([category, amount]) => (

                  <div
                    className="category-item"
                    key={category}
                  >

                    <span>
                      {category}
                    </span>

                    <strong>
                      ₹{amount.toFixed(2)}
                    </strong>

                  </div>

                )
              )}

            </div>

          )}

        </section>

        {/* =========================
            SPENDING CHART
        ========================= */}

        <section className="chart-section">

          <h2>
            Spending Breakdown
          </h2>

          {chartData.length === 0 ? (

            <p>
              No expense data available for
              the chart.
            </p>

          ) : (

            <div className="chart-container">

              <ResponsiveContainer
                width="100%"
                height={350}
              >

                <PieChart>

                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label
                  >

                    {chartData.map(
                      (entry, index) => (

                        <Cell
                          key={`cell-${index}`}
                          fill={
                            chartColors[
                              index %
                              chartColors.length
                            ]
                          }
                        />

                      )
                    )}

                  </Pie>

                  <Tooltip
                    formatter={(value) =>
                      `₹${Number(value).toFixed(2)}`
                    }
                  />

                  <Legend />

                </PieChart>

              </ResponsiveContainer>

            </div>

          )}

        </section>

        {/* =========================
            TRANSACTIONS
        ========================= */}

        <section className="transactions-section">

          <h2>
            Transactions
          </h2>

          {/* Search and filters */}

          <div className="filter-bar">

            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />

            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value)
              }
            >

              <option value="ALL">
                All Types
              </option>

              <option value="INCOME">
                Income
              </option>

              <option value="EXPENSE">
                Expense
              </option>

            </select>

            <select
              value={filterCategory}
              onChange={(e) =>
                setFilterCategory(e.target.value)
              }
            >

              <option value="ALL">
                All Categories
              </option>

              <option value="FOOD">
                Food
              </option>

              <option value="TRANSPORT">
                Transport
              </option>

              <option value="EDUCATION">
                Education
              </option>

              <option value="SHOPPING">
                Shopping
              </option>

              <option value="ENTERTAINMENT">
                Entertainment
              </option>

              <option value="HEALTH">
                Health
              </option>

              <option value="BILLS">
                Bills
              </option>

              <option value="OTHER">
                Other
              </option>

            </select>

            <button
              className="clear-filter-btn"
              type="button"
              onClick={() => {
                setSearchTerm('');
                setFilterType('ALL');
                setFilterCategory('ALL');
              }}
            >
              Clear
            </button>

          </div>

          {/* Transaction cards */}

          {filteredTransactions.length === 0 ? (

            <p className="empty-message">
              No matching transactions found.
            </p>

          ) : (

            <div className="transaction-grid">

              {filteredTransactions.map(
                (transaction) => (

                  <div
                    className={`transaction-card ${
                      transaction.type.toLowerCase()
                    }`}
                    key={transaction.id}
                  >

                    <div className="transaction-header">

                      <h3>
                        {transaction.title}
                      </h3>

                      <span className="transaction-type">
                        {transaction.type}
                      </span>

                    </div>

                    <p className="transaction-amount">

                      ₹
                      {Number(
                        transaction.amount
                      ).toFixed(2)}

                    </p>

                    <p>

                      <strong>
                        Category:
                      </strong>{' '}

                      {transaction.category}

                    </p>

                    <p>

                      <strong>
                        Description:
                      </strong>{' '}

                      {transaction.description ||
                        'No description'}

                    </p>

                    <p>

                      <strong>
                        Date:
                      </strong>{' '}

                      {transaction.date}

                    </p>

                    <div className="transaction-actions">

                      <button
                        type="button"
                        className="edit-btn"
                        onClick={() =>
                          handleEdit(transaction)
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() =>
                          handleDelete(
                            transaction.id
                          )
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default App;