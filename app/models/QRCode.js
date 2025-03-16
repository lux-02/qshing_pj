import mongoose from "mongoose";

const QRCodeSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  lastScannedAt: {
    type: Date,
    default: null,
  },
  lastScannedUrl: {
    type: String,
    default: null,
  },
  isCompromised: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.QRCode || mongoose.model("QRCode", QRCodeSchema);
