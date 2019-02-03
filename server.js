var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

var PORT = process.env.PORT || 8080;

var app = express();

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static("public"));

// Configure middleware
// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse application body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Require all models
var db = require("./models");

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Import routes and give the server access to them.
var routes = require("./controllers/ArticleController.js");

app.use(routes);


// Connect to the Mongo DB
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scrapeproject";

mongoose.connect(MONGODB_URI);

// Start our server so that it can begin listening to client requests.
app.listen(PORT, function() {
  // Log (server-side) when our server has started
  console.log("Server listening on: http://localhost:" + PORT);
});
