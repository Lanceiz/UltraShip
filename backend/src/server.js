require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { graphqlHTTP } = require("express-graphql");

const connectDB = require("./config/db");
const authMiddleware = require("./middleware/auth");
const schema = require("./graphql/schema");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(authMiddleware);

// Simple health check
app.get("/", (req, res) => {
  res.send("UltraShip GraphQL backend is running 🚀");
});

// GraphQL endpoint
app.use(
  "/graphql",
  graphqlHTTP((req) => ({
    schema,
    graphiql: true, // nice playground at /graphql
    context: {
      user: req.user, // available in resolvers
    },
    customFormatErrorFn: (err) => {
      // Optional: nicer error formatting
      return {
        message: err.message,
        locations: err.locations,
        path: err.path,
      };
    },
  }))
);

// Start server
const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}/graphql`);
  });
});
