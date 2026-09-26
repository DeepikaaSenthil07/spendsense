import { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
const [filterType, setFilterType] = useState('ALL');
const [filterCategory, setFilterCategory] = useState('ALL');
  const formSectionRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'EXPENSE',
    category: '',
    description: '',
    date: ''
  });

  // -----------------------------
  // FETCH TRANSACTIONS
  // -----------------------------

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

  // -----------------------------
  // DASHBOARD CALCULATIONS
  // -----------------------------

  const totalIncome = transactions
    .filter((transaction) => transaction.type === 'INCOME')
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0
    );

  const totalExpenses = transactions
    .filter((transaction) => transaction.type === 'EXPENSE')
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0
    );

  const balance = totalIncome - totalExpenses;

  // -----------------------------
  // CATEGORY CALCULATIONS
  // -----------------------------

  const categoryTotals = {};

  transactions
    .filter((transaction) => transaction.type === 'EXPENSE')
    .forEach((transaction) => {
      const category = transaction.category;

      categoryTotals[category] =
        (categoryTotals[category] || 0) +
        Number(transaction.amount);
    });

  let highestCategory = '';
  let highestCategoryAmount = 0;

  Object.entries(categoryTotals).forEach(
    ([category, amount]) => {
      if (amount > highestCategoryAmount) {
        highestCategory = category;
        highestCategoryAmount = amount;
      }
    }
  );

  // -----------------------------
  // MONTHLY CALCULATIONS
  // -----------------------------

  const currentDate = new Date();

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const monthlyTransactions = transactions.filter(
    (transaction) => {
      const transactionDate = new Date(transaction.date);

      return (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      );
    }
  );

  const monthlyIncome = monthlyTransactions
    .filter((transaction) => transaction.type === 'INCOME')
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0
    );

  const monthlyExpenses = monthlyTransactions
    .filter((transaction) => transaction.type === 'EXPENSE')
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0
    );

  const monthlyBalance =
    monthlyIncome - monthlyExpenses;
    const filteredTransactions = transactions.filter(
  (transaction) => {

    const search = searchTerm.toLowerCase();

    const matchesSearch =
      transaction.title
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
  // -----------------------------
  // FORM HANDLING
  // -----------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });
  };

  // -----------------------------
  // ADD / UPDATE TRANSACTION
  // -----------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingId
        ? `http://localhost:8080/transactions/${editingId}`
        : 'http://localhost:8080/transactions';

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount)
        })
      });

      if (!response.ok) {
        throw new Error(
          editingId
            ? 'Failed to update transaction'
            : 'Failed to create transaction'
        );
      }

      const savedTransaction = await response.json();

      if (editingId) {
        setTransactions((prevTransactions) =>
          prevTransactions.map((transaction) =>
            transaction.id === editingId
              ? savedTransaction
              : transaction
          )
        );

        alert('Transaction updated successfully!');
      } else {
        setTransactions((prevTransactions) => [
          ...prevTransactions,
          savedTransaction
        ]);

        alert('Transaction added successfully!');
      }

      // Reset form
      setFormData({
        title: '',
        amount: '',
        type: 'EXPENSE',
        category: '',
        description: '',
        date: ''
      });

      setEditingId(null);

    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Could not save transaction.');
    }
  };

  // -----------------------------
  // START EDITING
  // -----------------------------

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

  // -----------------------------
  // CANCEL EDIT
  // -----------------------------

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

  // -----------------------------
  // DELETE TRANSACTION
  // -----------------------------

  const handleDelete = async (id) => {
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

      // If deleting the transaction currently being edited
      if (editingId === id) {
        handleCancelEdit();
      }

      alert('Transaction deleted successfully!');

    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Could not delete transaction.');
    }
  };

  // -----------------------------
  // UI
  // -----------------------------

  return (
    <div className="app">

      {/* Header */}

      <header className="header">
        <h1>SpendSense</h1>
        <p>
          Personal Finance & Spending Intelligence
        </p>
      </header>

      <main className="main-content">

        {/* Dashboard */}

        <section className="dashboard">

          <div className="summary-card">
            <h3>Total Balance</h3>
            <p>₹{balance.toFixed(2)}</p>
          </div>

          <div className="summary-card">
            <h3>Total Income</h3>
            <p>₹{totalIncome.toFixed(2)}</p>
          </div>

          <div className="summary-card">
            <h3>Total Expenses</h3>
            <p>₹{totalExpenses.toFixed(2)}</p>
          </div>

        </section>

        {/* Monthly Overview */}

        <section className="monthly-section">

          <h2>Monthly Overview</h2>

          <div className="monthly-grid">

            <div className="monthly-card">
              <h3>Monthly Income</h3>
              <p>
                ₹{monthlyIncome.toFixed(2)}
              </p>
            </div>

            <div className="monthly-card">
              <h3>Monthly Expenses</h3>
              <p>
                ₹{monthlyExpenses.toFixed(2)}
              </p>
            </div>

            <div className="monthly-card">
              <h3>Monthly Balance</h3>
              <p>
                ₹{monthlyBalance.toFixed(2)}
              </p>
            </div>

          </div>

        </section>

        {/* Spending by Category */}

        <section className="category-section">

          <h2>Spending by Category</h2>

          {Object.keys(categoryTotals).length === 0 ? (
            <p>No expense data available.</p>
          ) : (
            <div className="category-grid">

              {Object.entries(categoryTotals).map(
                ([category, amount]) => (

                  <div
                    className="category-card"
                    key={category}
                  >
                    <h3>{category}</h3>

                    <p>
                      ₹{amount.toFixed(2)}
                    </p>
                  </div>

                )
              )}

            </div>
          )}

        </section>

        {/* Spending Insight */}

        <section className="insights-section">

          <h2>Spending Insight</h2>

          {highestCategory ? (

            <div className="insight-card">

              <h3>
                💡 Highest Spending Category
              </h3>

              <p>
                You spend the most on{' '}
                <strong>
                  {highestCategory}
                </strong>.
              </p>

              <p>
                Total spent:{' '}
                <strong>
                  ₹{highestCategoryAmount.toFixed(2)}
                </strong>
              </p>

            </div>

          ) : (

            <p>
              No expense data available for insights.
            </p>

          )}

        </section>

        {/* Add / Edit Transaction */}

        <section
          className="form-section"
          ref={formSectionRef}
          >

          <h2>
            {editingId
              ? 'Edit Transaction'
              : 'Add Transaction'}
          </h2>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Title</label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Example: Lunch"
                required
              />
            </div>

            <div className="form-group">
              <label>Amount</label>

              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Example: 250"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Type</label>

              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="EXPENSE">
                  Expense
                </option>

                <option value="INCOME">
                  Income
                </option>
              </select>
            </div>

            <div className="form-group">
              <label>Category</label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select category
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
            </div>

            <div className="form-group">
              <label>Description</label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Optional description"
              />
            </div>

            <div className="form-group">
              <label>Date</label>

              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <button
              className="add-btn"
              type="submit"
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

          </form>

        </section>

        {/* Transactions */}

        <section className="transactions-section">

  <h2>Transactions</h2>

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
      <option value="ALL">All Types</option>
      <option value="INCOME">Income</option>
      <option value="EXPENSE">Expense</option>
    </select>

    <select
      value={filterCategory}
      onChange={(e) =>
        setFilterCategory(e.target.value)
      }
    >
      <option value="ALL">All Categories</option>
      <option value="FOOD">Food</option>
      <option value="TRANSPORT">Transport</option>
      <option value="EDUCATION">Education</option>
      <option value="SHOPPING">Shopping</option>
      <option value="ENTERTAINMENT">
        Entertainment
      </option>
      <option value="HEALTH">Health</option>
      <option value="BILLS">Bills</option>
      <option value="OTHER">Other</option>
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
              <strong>Category:</strong>{' '}
              {transaction.category}
            </p>

            <p>
              <strong>Description:</strong>{' '}
              {transaction.description ||
                'No description'}
            </p>

            <p>
              <strong>Date:</strong>{' '}
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