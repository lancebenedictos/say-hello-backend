import "dotenv/config";
import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import passport from "passport";
import bodyParser from "body-parser";
import { Strategy as LocalStrategy } from "passport-local";

import User from "./models/User.js";
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// session
app.use(
  session({
    secret: "your secret key",
    resave: false,
    saveUninitialized: true,
    // @ts-ignore TS2322
    store: new MongoStore({ mongoUrl: process.env.MONGO_URL }),
  })
);

// connect mongo
mongoose.connect(process.env.MONGO_URL);

// setup passport
const strategy = new LocalStrategy(User.authenticate());
passport.use(strategy);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.json({ status: 200, data: { message: "success" } });
});

app.post("/register", function (req, res) {
  User.register(
    new User({
      email: req.body.email,
      username: req.body.username,
    }),
    req.body.password,
    function (err, msg) {
      if (err) {
        res.send(err);
      } else {
        res.send({ message: "Successful" });
      }
    }
  );
});

app.post("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.send({ message: "Successful" });
  });
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login-failure",
    successRedirect: "/login-success",
  }),
  (err, req, res, next) => {
    if (err) next(err);
  }
);

app.get("/login-failure", (req, res, next) => {
  console.log(req.session);
  res.send("Login Attempt Failed.");
});

app.get("/login-success", (req, res, next) => {
  console.log(req.session);
  res.send("Login Attempt was successful.");
});

app.listen("8000", () => {
  console.log("listening");
});
