// const express = require('express')
// const mongoose = require('mongoose')
// // const dotenv = require('dotenv')
// const cors = require('cors')
// dotenv.config()
// require('dotenv').config();
// console.log("MONGO_URI:", process.env.MONGO_URI);

// const authRouter = require('./routes/auth') 
// const userRouter = require('./routes/user') 
// const productRouter = require('./routes/product') 
// const cartRouter = require('./routes/cart') 
// const orderRouter = require('./routes/order')
// const checkoutRouter = require('./routes/checkout')
// const { 
//   handleMalformedJson,
//   formatCelebrateErrors
// } = require('./middlewares/handleError')

// const app = express()


// // mongodb
// mongoose.connect(process.env.DB_URL, {
//   useUnifiedTopology: true,
//   useNewUrlParser: true
// }).then(() => console.log("Connected to database"))
// 	.catch(err => console.error(err))


// // global middlewares
// app.use(cors())
// app.use(express.json())
// app.use(handleMalformedJson) // handle common req errors


// // routes
// app.use("/auth", authRouter)
// app.use("/users", userRouter)
// app.use("/products", productRouter)
// app.use("/carts", cartRouter)
// app.use("/orders", orderRouter)
// app.use("/checkout", checkoutRouter)

// // server status
// app.get("/", (req, res) => {
// 	res.json({status: "ok"})
// })

// // format celebrate paramater validation errors
// app.use(formatCelebrateErrors)

// app.listen(process.env.PORT || 5000, () => {
// 	console.log(`Listening on port ${process.env.PORT || 5000}`)
// })


// 1️⃣ Load environment variables (must be first)
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import your routers
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const productRouter = require('./routes/product');
const cartRouter = require('./routes/cart');
const orderRouter = require('./routes/order');
const checkoutRouter = require('./routes/checkout');

// Import your custom error handling middlewares
const { 
  handleMalformedJson, 
  formatCelebrateErrors 
} = require('./middlewares/handleError');

// 2️⃣ Create Express app
const app = express();

// 3️⃣ Debug env variables
console.log("PORT:", process.env.PORT);
console.log("MONGO_URI:", process.env.MONGO_URI);

// 4️⃣ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => {
  console.error("MongoDB connection error:", err);
  process.exit(1); // Stop app if DB connection fails
});

// 5️⃣ Global middlewares
app.use(cors());
app.use(express.json()); // parse JSON
app.use(handleMalformedJson); // handle common malformed JSON errors
app.use("/images", express.static("images"));

// 6️⃣ Routes
app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/products", productRouter);
app.use("/carts", cartRouter);
app.use("/orders", orderRouter);
app.use("/checkout", checkoutRouter);

// 7️⃣ Health check endpoint
app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

// 8️⃣ Celebrate validation error formatting
app.use(formatCelebrateErrors);

// 9️⃣ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
