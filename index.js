require("dotenv").config();

const express = require("express");
const app = express();

const cors = require("cors");
app.use(cors());

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(express.json());

const api_url = "https://app.socialinsider.io/api";


async function fetchProfileData(profile_type, id, start, end) {
  console.log("fetching data for", start, end);
  const response = await fetch(api_url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.API_KEY,
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "socialinsider_api.get_profile_data",
      params: {
        id,
        profile_type,
        date: {
          start,
          end,
          timezone: "Europe/London",
        },
      },
    }),
  });

  let data = await response.json();

  console.log(id)

  data = Object.keys(data.resp[id]).map((key) => {
    return data.resp[id][key];
  });
  console.log(data)

  let engagement = 0;
  let max_followers = 0;
  data.map((day) => {
    if (day.engagement) {
      engagement += day.engagement;
    }
    if (day.followers) {
      max_followers = Math.max(max_followers, day.followers);
    }
  });
  console.log("done fetching data for", id);
  return { id, engagement, followers: max_followers };
}

app.get("/brands", (req, res) => {
  const { start, end } = req.query;
  if (end < start) {
    res.status(400).send("End date must be after start date");
    return;
  }

  async function fetchBrands() {
    const response = await fetch(api_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.API_KEY,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 0,
        method: "socialinsider_api.get_brands",
        params: {
          projectname: "API_test",
        },
      }),
    });

    let data = await response.json();
    data = data.result;

    const brandData = data.map((brand) => {
      const profiles = brand.profiles.map((profile) => {
        return fetchProfileData(profile.profile_type, profile.id, start, end);
      });

      return Promise.all(profiles);
    });

    const brandStats = await Promise.all(brandData);
    // append brandStats to data
    data = data.map((brand, index) => {
      brand.engagement = 0;
      brand.followers = 0;
      brandStats[index].map((profile) => {
        brand.engagement += profile.engagement;
        brand.followers = Math.max(brand.followers, profile.followers);
      });
      return brand;
    });

    return data;
  }

  fetchBrands().then((data) => {
    res.send(data);
  });
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
