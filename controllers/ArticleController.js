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

router.get("/postID", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({}).select({ "articlePostID": 1, "_id": 0})
    .then(function(dbPostID) {
      // If we were able to successfully find postID, we save them
      let postIdList = dbPostID.map(function (post) {
        return post.articlePostID
      });
      console.log(postIdList)
      return postIdList 
    })
    .then(function(postList) {       
      axios.get("http://www.rugbydata.com/").then(function(response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);
        var newarticle = false;
        // Now, we grab every article tag, and check if postid already exists:
        $("article.post").each(function(i, element) {
          let PostId=$(this).find(".voteuparrow").data("postid").toString();
          console.log(PostId)
          console.log("include or not: "+ postList.includes(PostId))
          if(!postList.includes(PostId)){
            newarticle=true;
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
              .data("postid");
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
              .attr("datetime"));
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
          };
        });
        if(newarticle){
          res.json({"newarticle":true})
        } else {
          res.json({"newarticle":false})
        }
      });
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
})

// Display saved articles
router.get("/savedarticles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({saved: true})
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

module.exports = router;
