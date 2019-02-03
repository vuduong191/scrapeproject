var express = require("express");

var router = express.Router();
// Our scraping tools
var axios = require("axios");
var cheerio = require("cheerio");
// Require all models
var db = require("../models");

// Create all our routes and set up logic within those routes where required.
router.get("/", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({}).sort({date:-1})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      var hbsObject = {
        articles: dbArticle
      };
      console.log(hbsObject);
      res.render("index", hbsObject);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });

});
router.delete("/clear", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.remove()
    .then(function() {
      console.log("Delete all Data")
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


// A GET route for scraping the rugbydata website
router.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("http://www.rugbydata.com/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("article.post").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .find("h4")
        .children("a")
        .text();
      result.link = "http://www.rugbydata.com"+$(this)
        .find("h4")      
        .children("a")
        .attr("href");
      result.imageUrl = $(this)
        .find("img")
        .attr("src")?$(this)
        .find("img")
        .attr("src"):"https://cdn.dribbble.com/users/844846/screenshots/2855815/no_image_to_show_.jpg";
      result.openingText = $(this)
        .find(".entry-summary")
        .children("p")
        .text().slice(0,-10);
      result.date = new Date($(this)
        .find("time")
        .attr("datetime"))
      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    // Send a message to the client
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
router.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


// router.post("/api/cats", function(req, res) {
//   cat.create([
//     "name", "sleepy"
//   ], [
//     req.body.name, req.body.sleepy
//   ], function(result) {
//     // Send back the ID of the new quote
//     res.json({ id: result.insertId });
//   });
// });

// router.put("/api/cats/:id", function(req, res) {
//   var condition = "id = " + req.params.id;

//   console.log("condition", condition);

//   cat.update({
//     sleepy: req.body.sleepy
//   }, condition, function(result) {
//     if (result.changedRows == 0) {
//       // If no rows were changed, then the ID must not exist, so 404
//       return res.status(404).end();
//     } else {
//       res.status(200).end();
//     }
//   });
// });

// router.delete("/api/cats/:id", function(req, res) {
//   var condition = "id = " + req.params.id;

//   cat.delete(condition, function(result) {
//     if (result.affectedRows == 0) {
//       // If no rows were changed, then the ID must not exist, so 404
//       return res.status(404).end();
//     } else {
//       res.status(200).end();
//     }
//   });
// });

// Export routes for server.js to use.
module.exports = router;
