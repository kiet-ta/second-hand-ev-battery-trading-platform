# Electric Vehicle Dealer Management System

## Overview

The **Electric Vehicle Dealer Management System (EVDMS)** is a software platform designed to manage electric vehicle sales through authorized dealers.
It provides a centralized system that connects **Dealers** and the **EV Manufacturer**, supporting:

* Product, stock, and distribution management for the manufacturer.
* Sales, customer, and payment management for dealers.
* Reporting, analytics, and demand forecasting for both sides.

## Features

### Dealer (Staff / Manager)

* **Vehicle Information**: view vehicle catalog, configurations, prices, and compare models.
* **Sales Management**: generate quotations, sales orders, and contracts; manage promotions; order vehicles from the manufacturer; track delivery status; support multiple payment methods (full payment, installment).
* **Customer Management**: store customer records, manage test drive appointments, capture feedback and complaints.
* **Reports**: sales performance per staff, customer and manufacturer debt reports.

### EV Manufacturer (Staff / Admin)

* **Product & Distribution Management**: manage vehicle models, versions, colors; track global stock; allocate vehicles to dealers; define wholesale prices, discounts, and dealer-specific promotions.
* **Dealer Management**: manage contracts, sales targets, debts, and dealer accounts.
* **Reports & Analytics**: sales by region and dealer, inventory status, sales velocity, demand forecasting with AI.

## Architecture

**Tech Stack**

* **Frontend**: React (JavaScript, Vite/CRA).
* **Backend**: ASP.NET Core Web API (C#).
* **Database**: MySQL.
* **Containerization**: Docker & Docker Compose.

## Installation & Usage

### 1. Clone repository

```bash
git clone https://github.com/your-username/ev-dealer-management.git
cd ev-dealer-management
```

### 2. Environment variables

Create a `.env` file in the root directory:

```env
# Backend
ASPNETCORE_ENVIRONMENT=Development
ConnectionStrings__Default=server=db;port=3306;database=evdb;user=root;password=rootpassword;

# Frontend
VITE_API_URL=http://localhost:5000/api
```

### 3. Docker Compose

`docker-compose.yml`:

```yaml
services:
  db:
    image: mysql:8.0
    container_name: ev_mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: evdb
    ports:
      - "3307:3306"
    volumes:
      - db_data:/var/lib/mysql

  backend:
    build: ./backend
    container_name: ev_backend
    depends_on:
      - db
    environment:
      - ConnectionStrings__Default=server=db;port=3306;database=evdb;user=root;password=rootpassword
    ports:
      - "5000:5000"

  frontend:
    build: ./frontend
    container_name: ev_frontend
    depends_on:
      - backend
    environment:
      - VITE_API_URL=http://localhost:5000/api
    ports:
      - "3000:3000"

volumes:
  db_data:
```

### 4. Run project

```bash
docker-compose up --build
```

Access the services at:

* Frontend: `http://localhost:3000`
* Backend: `http://localhost:5000/api`
* Database: `localhost:3307`

## Roadmap

* [ ] Authentication & Authorization (JWT).
* [ ] Role-based access (Dealer Staff, Dealer Manager, EV Staff, Admin).
* [ ] Realtime notifications (SignalR / WebSocket).
* [ ] AI-powered demand forecasting.
* [ ] Unit and integration testing.

## Contributing

Pull requests are welcome. Please open an issue first to discuss major changes.
