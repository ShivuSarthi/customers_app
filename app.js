const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Load customers data
let customers = JSON.parse(fs.readFileSync("customers.json", "utf8"));

// Helper functions
const saveCustomers = () => {
  fs.writeFileSync(
    "customers.json",
    JSON.stringify(customers, null, 2),
    "utf8"
  );
};

const validateCustomer = (customer) => {
  const existingCities = customers.map((c) => c.city);
  const existingCompanies = customers.map((c) => c.company);
  return (
    customer.id &&
    customer.first_name &&
    customer.last_name &&
    existingCities.includes(customer.city) &&
    existingCompanies.includes(customer.company)
  );
};

// List customers with search and pagination
app.get("/customers", (req, res) => {
  const { first_name, last_name, city, page = 1, limit = 10 } = req.query;
  let results = customers;

  if (first_name) {
    results = results.filter((c) =>
      c.first_name.toLowerCase().includes(first_name.toLowerCase())
    );
  }
  if (last_name) {
    results = results.filter((c) =>
      c.last_name.toLowerCase().includes(last_name.toLowerCase())
    );
  }
  if (city) {
    results = results.filter((c) =>
      c.city.toLowerCase().includes(city.toLowerCase())
    );
  }

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedResults = results.slice(startIndex, endIndex);

  res.json(paginatedResults);
});

// Get single customer by ID
app.get("/customers/:id", (req, res) => {
  const customer = customers.find((c) => c.id === parseInt(req.params.id));
  if (!customer) {
    return res.status(404).json({ error: "Customer not found" });
  }
  res.json(customer);
});

// List all unique cities with number of customers
app.get("/cities", (req, res) => {
  const cityCounts = customers.reduce((acc, customer) => {
    acc[customer.city] = (acc[customer.city] || 0) + 1;
    return acc;
  }, {});
  res.json(cityCounts);
});

// Add a new customer with validation
app.post("/customers", (req, res) => {
  const newCustomer = req.body;
  if (!validateCustomer(newCustomer)) {
    return res.status(400).json({ error: "Invalid customer data" });
  }
  customers.push(newCustomer);
  saveCustomers();
  res.status(201).json(newCustomer);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
