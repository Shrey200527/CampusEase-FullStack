const express = require("express");
const cors = require("cors");
const app = express();
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const PORT = process.env.PORT || 5000;

// ------------------ Middleware ------------------
app.use(cors());
app.use(express.json());

// Serve frontend & static files
app.use(express.static(path.join(__dirname, 'public')));
app.use("/images", express.static(path.join(__dirname, "public", "images")));
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

// ------------------ Create Uploads Folder ------------------
const uploadDir = path.join(__dirname, "public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ------------------ Multer Setup ------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// ------------------ Load Listings ------------------
const listingsFilePath = path.join(__dirname, "data", "listings.json");
let listings = JSON.parse(fs.readFileSync(listingsFilePath));

// ------------------ API Routes ------------------

// POST - Add new listing
app.post("/api/listings", upload.single("image"), (req, res) => {
  const newListing = JSON.parse(req.body.data);
  newListing.id = listings.length + 1;

  if (req.file) {
    newListing.images = [`/uploads/${req.file.filename}`];
  } else {
    newListing.images = ["placeholder.jpg"];
  }

  listings.push(newListing);

  fs.writeFileSync(listingsFilePath, JSON.stringify(listings, null, 2));
  res.status(201).json({ message: "Listing added", listing: newListing });
});

// GET - All listings with optional filters
app.get("/api/listings", (req, res) => {
  const { category, mode, keyword } = req.query;
  let filteredListings = listings;

  if (category) {
    filteredListings = filteredListings.filter(
      (item) => item.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (mode) {
    filteredListings = filteredListings.filter(
      (item) => item.mode && item.mode.toLowerCase() === mode.toLowerCase()
    );
  }

  if (keyword) {
    filteredListings = filteredListings.filter((item) =>
      item.keywords.some((k) =>
        k.toLowerCase().includes(keyword.toLowerCase())
      )
    );
  }

  res.json(filteredListings);
});

// GET - Listing by ID
app.get("/api/listings/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const listing = listings.find((item) => item.id === id);
  if (listing) {
    res.json(listing);
  } else {
    res.status(404).json({ message: "Listing not found" });
  }
});

// ------------------ Start Server ------------------
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
