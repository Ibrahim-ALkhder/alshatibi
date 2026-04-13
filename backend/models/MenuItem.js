import mongoose from 'mongoose';

const menuItemSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    nameAr: { type: String, required: true },
    description: String,
    descriptionAr: String,
    price: { type: Number, required: true },
    image: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    isAvailable: { type: Boolean, default: true },
    stock: { type: Number, default: 0, min: 0 },
    preparationTime: { type: Number, default: 15 },
    options: [
      {
        name: String,
        nameAr: String,
        choices: [
          {
            name: String,
            nameAr: String,
            price: Number,
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

// استخدم async function بدون next
menuItemSchema.pre('save', async function () {
  // تأكد من تحديث isAvailable بناءً على المخزون
  if (this.stock <= 0) {
    this.isAvailable = false;
  } else {
    this.isAvailable = true;
  }
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
export default MenuItem;