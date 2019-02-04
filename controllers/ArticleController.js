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
  db.Article.find({})
    .sort({date:-1})
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      var hbsObject = {
        articles: dbArticle
      };
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

// Update one article by an id
router.post("/save/:id", function(req, res) {
  // Update the article that matches the object id
  db.Article.findOneAndUpdate({ _id: req.params.id }, { saved: true }, { new: true })
  .then(function(dbArticle) {
      // If we were able to successfully update an Article
      res.send(dbArticle)
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
router.post("/addnote/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id, saved: true }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Articl
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
      result.articlePostID = $(this)
        .find(".voteuparrow")
        .data("postid")
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
