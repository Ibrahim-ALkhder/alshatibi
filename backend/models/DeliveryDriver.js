import mongoose from 'mongoose';

const deliveryDriverSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['available', 'busy', 'offline'], default: 'available' },
    currentOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    totalDeliveries: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const DeliveryDriver = mongoose.model('DeliveryDriver', deliveryDriverSchema);
export default DeliveryDriver;