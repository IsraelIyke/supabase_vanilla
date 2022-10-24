const PORT = process.env.PORT || 3003;
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/results", (req, res) => {
  const website = req.query.website;
  const keyword = req.query.keyword;
  puppeteer.use(StealthPlugin());
  (async () => {
    try {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();

      await page.goto(website, { timeout: 0 });

      const grabParagraph = await page.evaluate(() => {
        const pgTag = document.querySelector("body");
        return pgTag.innerText;
      });

      const boolTrueArray = [];
      const boolFalseArray = [];
      const lowKeyword = keyword.toLowerCase();

      const lowGrabParagraph = grabParagraph.toLowerCase();
      const myArray = lowKeyword.split(" ");
      const newArray = myArray.map((element) => {
        const bool = lowGrabParagraph.includes(element);
        if (bool) {
          boolTrueArray.push(bool);
        } else {
          boolFalseArray.push(bool);
        }
      });
      let dbStatus = "";
      if (boolTrueArray.length > 0 && boolFalseArray.length == 0) {
        dbStatus = "Perfect";
      } else if (boolTrueArray.length > 0 && boolFalseArray.length > 0) {
        dbStatus = "Partial";
      } else if (boolTrueArray.length == 0 && boolFalseArray.length > 0) {
        dbStatus = "No";
      }
      res.json(dbStatus);
      await browser.close();
    } catch (e) {
      console.log(`There is a problem here ${e}`);
    }
  })();
});

app.listen(PORT, () => console.log(`Server running`));
