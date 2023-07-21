import express from "express";
import axios from "axios";
import 'dotenv/config'
import { DateTime } from 'luxon';

const app = express();
const port = 3000;
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const GeoAPI = "http://api.openweathermap.org/geo/1.0/direct"
const WeatherAPI = "https://api.openweathermap.org/data/2.5/weather"
const cities = ["London", "Paris", "Amsterdam", "Toronto", "Beijing", "Tokyo", "Barcelona", "Rio de Janeiro", "New York City"]
var data = []

app.get("/", async (req, res) => {
    var city = "";
    if (!req.body.city) {
        city = cities[Math.floor(Math.random() * cities.length)];
    }
    await renderCity(city, res);
});

app.post("/find", async (req, res) => {
    console.log(req.body)
    await renderCity(req.body.city, res);
});

async function renderCity(city, res) {
    console.log(`City: ${city}`);
    try {
        const geoResult = await axios.get(GeoAPI, { params: { q: city, limit: 1, appid: process.env.Weather_API } });
        const lon = geoResult.data[0].lon
        const lat = geoResult.data[0].lat
        const weatherResult = await axios.get(WeatherAPI, { params: { lon: lon, lat: lat, appid: process.env.Weather_API, units: 'metric' } })
        const time = DateTime.utc().plus({ seconds: weatherResult.data.timezone })
        const entry = {
            city: `${geoResult.data[0].name}, ${geoResult.data[0].country}`,
            time: time.toFormat("MMM d yyyy, h:mm a"),
            lon: lon.toFixed(2),
            lat: lat.toFixed(2),
            icon: weatherResult.data.weather[0].icon,
            desc: weatherResult.data.weather[0].description,
            humidity: weatherResult.data.main.humidity,
            temp: weatherResult.data.main.temp.toFixed(1),
            feels: weatherResult.data.main.feels_like.toFixed(1),
        }
        data.push(entry);
        res.render("index.ejs", { data: data });
    } catch (error) {
        console.log(error);
        res.render("index.ejs");
    }
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
