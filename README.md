# Web Scraping Project

### Rugbydata.com Scraping

#### Overview

This is week 18 assignment, in which we first learned about NoSQL database, using mongodb and mongoose. Also in this week, we learned web scraping using axios and cheerio API. Our app runs on Node.js + Express with handlebars templating engine

#### Features

##### Scraping Articles from www.rugbydata.com/
The app allows users to scrape all the news that appears on the homepage of rubydata.com website and display them in bootstrap card format. Each card comes with "save" and "add note and save" functions. All data scraped is saved in mongodb database.

![Scraping](/public/assets/images/demo1.gif)

##### Add Note and Save Articles
Users can choose to save an article with/without note and have access to those articles/notes later.

![Save](/public/assets/images/demo2.gif)

##### Scraping Only New Articles
Luckily each articles on www.rugbydata.com comes with a post ID. By storing these IDs and comparing the new articles' IDs with the current ones, the app notifies users if there's no new articles

![New articles](/public/assets/images/demo3.gif)