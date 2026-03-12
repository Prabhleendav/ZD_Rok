const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		unique: true,
	},
	description: {
		type: String,
		required: true,
	},
	image: {
		type: String,
		required: true,
	},
	price: { 
		type: Number,
		required: true,
	},
	inStock: {
		type: Boolean,
		default: true,
	},
	
	quantity: {
		type: Number,
		default: 0
	},
	categories: { type: Array },
	size: { type: Array },
	color: { type: Array },
}, 
	{timestamps: true}
)

module.exports = mongoose.model("Product", ProductSchema)