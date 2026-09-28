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

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [suggestedCategory, setSuggestedCategory] = useState('');
  const formSectionRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'EXPENSE',
    category: '',
    description: '',
    date: ''
  });

  // Fetch all transactions
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

  // Load transactions when page opens
  useEffect(() => {
    fetchTransactions();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });
  };
const suggestCategory = async (title, description) => {
  if (!title.trim() && !description.trim()) {
    setSuggestedCategory('');
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:8080/transactions/suggest-category?title=${encodeURIComponent(
        title
      )}&description=${encodeURIComponent(description)}`
    );

    if (response.ok) {
      const category = await response.text();
      setSuggestedCategory(category);
    }
  } catch (error) {
    console.error(
      'Error suggesting category:',
      error
    );
  }
};
  // Submit new transaction
  const handleSubmit = async (e) => {
    e.preventDefault();

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

    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Could not save transaction.');
    }
  };

  // Delete transaction
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

  // Start editing a transaction
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

    setTimeout(() => {
      formSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };

  // Update existing transaction
  const handleUpdate = async (e) => {
    e.preventDefault();

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

    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Could not update transaction.');
    }
  };

  // Cancel editing
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
      const category = transaction.category;

      categoryTotals[category] =
        (categoryTotals[category] || 0) +
        Number(transaction.amount);
    });

  // Data used by pie chart
  const chartData = Object.entries(categoryTotals).map(
    ([category, amount]) => ({
      name: category,
      value: amount
    })
  );

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

            <input
              type="text"
              name="title"
              placeholder="Transaction title"
              value={formData.title}
              onChange={(e) => {
  const value = e.target.value;

  const updatedFormData = {
    ...formData,
    title: value
  };

  setFormData(updatedFormData);

  suggestCategory(
    value,
    formData.description
  );
}}
              required
            />

            <input
              type="number"
              name="amount"
              placeholder="Amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
            />

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

            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />

            <textarea
  placeholder="Description"
  value={formData.description}
  onChange={(e) => {
  const value = e.target.value;

  const updatedFormData = {
    ...formData,
    description: value
  };

  setFormData(updatedFormData);

  suggestCategory(
    formData.title,
    value
  );
}}
/>

{suggestedCategory && (
  <div className="category-suggestion">
    <span>
      Suggested category: <strong>{suggestedCategory}</strong>
    </span>

    <button
      type="button"
      className="use-suggestion-btn"
      onClick={() => {
        setFormData({
          ...formData,
          category: suggestedCategory
        });
      }}
    >
      Use {suggestedCategory}
    </button>
  </div>
)}

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
                          fill={[
                            '#6366f1',
                            '#22c55e',
                            '#f59e0b',
                            '#ef4444',
                            '#06b6d4',
                            '#a855f7',
                            '#ec4899',
                            '#84cc16'
                          ][index % 8]}
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
                        className="edit-btn"
                        onClick={() =>
                          handleEdit(transaction)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() =>
                          handleDelete(transaction.id)
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