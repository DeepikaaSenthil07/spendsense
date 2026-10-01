# SpendSense

SpendSense is a full-stack personal finance tracker that helps users record, manage, and understand their income and expenses through a simple dashboard.

It also includes a smart transaction category suggestion feature that analyzes the transaction title and description and suggests a suitable spending category with a confidence score.

## Features

- Add income and expense transactions
- Edit and delete transactions
- Categorize transactions
- Validate transaction details
- Prevent future-dated transactions
- Calculate total income, expenses, and current balance
- Track current month's spending
- View spending by category
- View spending breakdown through a pie chart
- Search transactions
- Filter transactions by type and category
- View financial insights
- Smart category suggestions using transaction details
- Confidence score and matched keywords for category suggestions
- Responsive dashboard interface

## Smart Category Suggestion

SpendSense includes a rule-based intelligent category suggestion system.

The system analyzes:

- Transaction title
- Transaction description
- Relevant keywords

It then returns:

- Suggested category
- Confidence score
- Matched keywords
- Reason for the suggestion

The user can choose to accept or dismiss the suggestion.

This feature provides an early foundation for introducing more advanced machine-learning-based classification in future projects.

## Tech Stack

### Frontend
- React
- JavaScript
- HTML
- CSS
- Recharts
- Vite

### Backend
- Java
- Spring Boot
- REST API
- Maven

### Database
- Relational database through Spring Data JPA

### Development Tools
- Git
- GitHub
- Visual Studio Code

## Architecture

```text
User
  │
  ▼
React Frontend
  │
  │ REST API
  ▼
Spring Boot Backend
  │
  ├── Transaction Controller
  ├── Transaction Service
  ├── Category Suggestion Service
  │
  ▼
Database