import mongoose from 'mongoose';

const orderSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
        name: String,
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        options: [{ name: String, choice: String, price: Number }],
      },
    ],
    totalPrice: { type: Number, required: true },
    deliveryAddress: {
      street: String,
      city: String,
      area: String,
      building: String,
      floor: String,
      apartment: String,
      notes: String,
    },
    phone: { type: String, required: true },
    status: {
      type: String,
      enum: ['Preparing', 'Ready', 'Out for delivery', 'Delivered'],
      default: 'Preparing',
    },
    paymentMethod: { type: String, enum: ['cash', 'card'], default: 'cash' },
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    deliveredAt: Date,
    // ---------- حقول جديدة للمندوب ----------
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryDriver', default: null },
    deliveryFee: { type: Number, default: 20 },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;