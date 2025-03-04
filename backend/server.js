const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 8899;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"], // Allow both origins
    credentials: true,
  })
);

// Routes
app.use("/api/user", require("./routes/auth-route"));
app.use("/api/product", require("./routes/product-route"));
app.use("/api/cart", require("./routes/cart-route"));
app.use("/api/order", require("./routes/order-route"));
app.use("/api/user", require("./routes/user-route"));

app.get("/", (req, res) => {
  res.send("API Working");
});

app.listen(port, () => console.log(`Server started on PORT : ${port}`));
