import User from "../models/User.js";
import { Webhook } from "svix";
import getRawBody from "raw-body"; // <-- to read raw body

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

const clerkWebhooks = async (req, res) => {
  try {
    // Get raw body as string
    const payload = (await getRawBody(req)).toString("utf-8");

    // Extract required headers for signature verification
    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    // Verify the webhook using svix
    const wh = new Webhook(webhookSecret);
    const evt = wh.verify(payload, headers);

    const { data, type } = evt;

    console.log("✅ Clerk Webhook Type:", type);
    console.log("📦 Data:", data);

    const userData = {
      _id: data.id,
      email: data.email_addresses?.[0]?.email_address || "",
      username: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
      image: data.image_url || "",
      recentSearchedCities: [],
    };

    switch (type) {
      case "user.created":
        await User.create(userData);
        break;

      case "user.updated":
        await User.findByIdAndUpdate(data.id, userData);
        break;

      case "user.deleted":
        await User.findByIdAndDelete(data.id);
        break;

      default:
        console.log(" Unhandled webhook type:", type);
        break;
    }

    return res.status(200).json({ success: true, message: "Webhook received" });
  } catch (err) {
    console.error(" Webhook Error:", err.message);
    return res.status(400).json({ success: false, message: "user not authorized" });
  }
};

export default clerkWebhooks;
