import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";

const productSchema = new mongoose.Schema({
  title: { type: String, unique: true, required: true }, 
  description: { type: String, index: "text", required: true }, 
  thumbnail: { type: String, required: false }, 
  code: { type: String, required: true }, 
  price: { type: Number, required: true }, 
  stock: { type: Number, required: true }, 
  category: { type: String, index: true, required: true }, 
  thumbnails: [String], 
  status: {
    type: Boolean,
    default: true,
    required: false, 
  },
  tags: { type: Array }, 
  created_at: { type: Date, default: Date.now() }, 
});

productSchema.plugin(paginate);

const Product = mongoose.model("Product", productSchema);

export default Product;