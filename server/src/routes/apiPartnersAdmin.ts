import { Router, Request, Response } from "express";
import ApiPartner from "../models/ApiPartner";
import { authGuard, adminGuard } from "../middleware/authGuard";

type CreatePartnerBody = {
  businessName: string;
  businessEmail: string;
  contactName: string;
  rateLimitPerMinute?: number;
};

type UpdatePartnerBody = {
  isActive?: boolean;
  rateLimitPerMinute?: number;
};

const router = Router();

// Admin-only: manage API partners (issue/revoke keys, set limits)
router.use(authGuard);
router.use(adminGuard);

router.get("/", async (_req: Request, res: Response) => {
  const partners = await ApiPartner.find().sort({ createdAt: -1 });
  res.json({ success: true, partners });
});

router.post("/", async (req: Request, res: Response) => {
  const body = req.body as Partial<CreatePartnerBody>;

  if (!body.businessName || !body.businessEmail || !body.contactName) {
    return res.status(400).json({
      success: false,
      message: "businessName, businessEmail, and contactName are required"
    });
  }

  const existing = await ApiPartner.findOne({ businessName: body.businessName });
  if (existing) {
    return res.status(409).json({
      success: false,
      message: "A partner with that businessName already exists"
    });
  }

  const partner = new ApiPartner({
    businessName: body.businessName,
    businessEmail: body.businessEmail,
    contactName: body.contactName,
    isActive: true,
    rateLimitPerMinute: body.rateLimitPerMinute
  });

  await partner.save();

  // IMPORTANT: We return apiKey here so you can copy it to the customer.
  // In a production billing portal, you would show it once and store only a hash.
  return res.status(201).json({
    success: true,
    partner
  });
});

router.patch("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const body = req.body as Partial<UpdatePartnerBody>;

  const partner = await ApiPartner.findById(id);
  if (!partner) {
    return res.status(404).json({ success: false, message: "Partner not found" });
  }

  if (typeof body.isActive === "boolean") partner.isActive = body.isActive;
  if (typeof body.rateLimitPerMinute === "number") partner.rateLimitPerMinute = body.rateLimitPerMinute;

  await partner.save();
  return res.json({ success: true, partner });
});

export default router;

