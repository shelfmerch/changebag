import "dotenv/config";
import mongoose from "mongoose";
import ApiPartner from "../models/ApiPartner";

function usage() {
  // eslint-disable-next-line no-console
  console.log(
    [
      "Usage:",
      "  ts-node src/scripts/createApiPartner.ts <businessName> <businessEmail> <contactName> [rateLimitPerMinute]",
      "",
      "Examples:",
      '  ts-node src/scripts/createApiPartner.ts \"Acme Inc\" dev@acme.com \"Jane Doe\" 120',
      "",
      "Environment:",
      "  MONGODB_URI must be set"
    ].join("\n")
  );
}

async function main() {
  const [, , businessName, businessEmail, contactName, rateLimitArg] = process.argv;
  if (!businessName || !businessEmail || !contactName) {
    usage();
    process.exit(1);
  }

  const rateLimitPerMinute = rateLimitArg ? parseInt(rateLimitArg, 10) : undefined;
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set");
  }

  await mongoose.connect(MONGODB_URI);

  const existing = await ApiPartner.findOne({ businessName });
  if (existing) {
    // eslint-disable-next-line no-console
    console.log("Partner already exists:", {
      id: existing._id,
      businessName: existing.businessName,
      apiKey: existing.apiKey,
      isActive: existing.isActive
    });
    await mongoose.disconnect();
    return;
  }

  const partner = new ApiPartner({
    businessName,
    businessEmail,
    contactName,
    isActive: true,
    rateLimitPerMinute
  });

  await partner.save();

  // eslint-disable-next-line no-console
  console.log("✅ API partner created:");
  // eslint-disable-next-line no-console
  console.log({
    id: partner._id,
    businessName: partner.businessName,
    businessEmail: partner.businessEmail,
    contactName: partner.contactName,
    apiKey: partner.apiKey,
    rateLimitPerMinute: partner.rateLimitPerMinute,
    isActive: partner.isActive
  });

  await mongoose.disconnect();
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to create API partner:", err);
  process.exit(1);
});

