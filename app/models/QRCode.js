import mongoose from "mongoose";

const QRCodeSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
  },
  description: {
    type: String,
    required: true,
  },
  lastScannedUrl: {
    type: String,
    default: null,
  },
  lastScannedAt: {
    type: Date,
    default: null,
  },
  isCompromised: {
    type: Boolean,
    default: false,
  },
  scans: [
    {
      scannedUrl: String,
      scannedAt: Date,
      scannedBy: String,
      isCompromised: Boolean,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

QRCodeSchema.index({ location: "2dsphere" });

export default mongoose.models.QRCode || mongoose.model("QRCode", QRCodeSchema);
