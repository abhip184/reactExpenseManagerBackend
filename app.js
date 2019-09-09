const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const userRoutes = require("./api/routes/users");
const accountRoutes = require("./api/routes/accounts");
const transectionRoutes = require("./api/routes/transections");

mongoose
  .connect(
    "mongodb+srv://dbUser:" +
      process.env.mongopass +
      "@learning-cluster-gv442.mongodb.net/test?retryWrites=true&w=majority",
    {
      useNewUrlParser: true
    }
  )
  .then(() => {
    console.log("connected to mongo cluster");
  })
  .catch(err => {
    console.log(err);
    console.log("failed to connect to Mongo cluster");
  });

mongoose.Promise = global.Promise;
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});
app.use("/accounts", accountRoutes);
app.use("/transections", transectionRoutes);
app.use("/users", userRoutes);
app.use((req, res, next) => {
  const error = new Error("Route Not found... Please check URL and Metheod  ");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
      message: error.message
  });
});

module.exports = app;
