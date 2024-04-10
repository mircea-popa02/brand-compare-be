require("dotenv").config();

const express = require("express");
const app = express();

const cors = require("cors");
const e = require("express");
app.use(cors());

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(express.json());

const api_url = "https://app.socialinsider.io/api";

const ProfileTypes = {
  INSTAGRAM: "instagram_profile",
  FACEBOOK: "facebook_page",
  TWITTER: "twitter_profile",
};

async function fetchProfileData(profile_type, id, start, end) {
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
  // console.log(data);
  console.log("data before")
  console.log(data.resp[id]["07-04-2024"]);
  console.log(data.resp[id]["07-04-2024"]);
  data = Object.keys(data.resp[id]).map((key) => {
    return data.resp[id][key];
  });

  console.log("Data after")
  console.log(data);
  return data;
}

app.post("/brand-data", (req, res) => {
  const { start, end, profiles } = req.body;

  console.log(req.body);

  if (end < start) {
    res.status(400).send("End date must be after start date");
    return;
  }

  if (!profiles || profiles.length === 0) {
    res.status(400).send("Profiles must be provided");
    return;
  }

  const isValidProfileType = profiles.every((profile) => {
    return Object.values(ProfileTypes).includes(profile.profile_type);
  });

  if (!isValidProfileType) {
    res.status(400).send("Invalid profile type");
    return;
  }

  const promises = profiles.map((profile) => {
    const { profile_type, id } = profile;

    return fetchProfileData(profile_type, id, start, end);
  });

  Promise.all(promises).then((data) => {
    const followers = data.reduce(
      (total, profile) => total + Math.max(...profile.map((p) => p.followers)),
      0
    );

    const mergedData = data.reduce((acc, curr) => {
      return acc.concat(curr);
    }, []);

    engagement = mergedData.reduce((acc, curr) => {
      return acc + curr.engagement;
    }, 0);

    res.send({ engagement, followers });
  });
});

app.get("/brands", (req, res) => {
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

    return data.result;
  }

  fetchBrands().then((data) => {
    res.send(data);
  });
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
