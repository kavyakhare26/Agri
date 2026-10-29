const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  resource: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource' },
  name: String,
  price: Number,
  quantity: Number,
});

const OrderSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [OrderItemSchema],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  deliveryAddress: {
    name: String,
    phone: String,
    village: String,
    district: String,
    state: String,
    pincode: String,
  },
  paymentMethod: { type: String, enum: ['cod', 'online'], default: 'cod' },
  notes: String,
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
