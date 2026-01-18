const Listing = require("../models/listing");
const axios = require("axios");
const categories = require("../utils/categories");

module.exports.index = async (req, res) => {
  const { q, category } = req.query;

  let filter = {};

  if (category) {
    filter.category = category;
  }

  const search = q?.trim();
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
      { country: { $regex: search, $options: "i" } },
    ];
  }

  let allListings = await Listing.find(filter);

  res.render("./listings/index.ejs", { allListings, category, q });
};

module.exports.renderNewForm = (req, res) => {
  res.render("./listings/new.ejs", { categories });
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }
  return res.render("./listings/show.ejs", { listing, categories });
};

module.exports.createListing = async (req, res) => {
  const geoRes = await axios.get("https://nominatim.openstreetmap.org/search", {
    params: {
      q: `${req.body.listing.location}, ${req.body.listing.country}`,
      format: "json",
      limit: 1,
    },
    headers: {
      "User-Agent": "wanderlust-student-project",
    },
  });

  const lat = Number(geoRes.data[0].lat);
  const lng = Number(geoRes.data[0].lon);

  let url = req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  newListing.geometry = {
    type: "Point",
    coordinates: [lng, lat], // GeoJSON order
  };

  let savedListing = await newListing.save();
  req.flash("success", "New Listing Created");
  res.redirect("/listings");
  console.log(req.user)
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  let orginalImageUrl = listing.image.url;
  orginalImageUrl = orginalImageUrl.replace("/upload", "/upload/w_250");
  res.render("./listings/edit.ejs", { listing, orginalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, req.body.listing);

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
