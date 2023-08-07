const mongoose = require("mongoose");

const composeSchema = new mongoose.Schema({
    post: String
});

const Compose = mongoose.model("List", composeSchema);

module.exports = Compose;