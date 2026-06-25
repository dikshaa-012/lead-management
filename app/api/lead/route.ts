import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { GoogleGenAI } from "@google/genai";
import nodemailer from "nodemailer";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const BASE_URL = process.env.BASE_URL!;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("Incoming Body:", body);

    let category = "General";
    let priority = "Medium";

    // ---------------- AI ----------------
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `
Analyze this customer requirement.

Requirement:
${body.requirement}

Return ONLY valid JSON.

{
  "category":"",
  "priority":""
}
`,
      });

      const text = response.text ?? "";

      try {
        const result = JSON.parse(text);
        category = result.category || "General";
        priority = result.priority || "Medium";
      } catch {
        console.log("Gemini returned invalid JSON");
      }
    } catch (err) {
      console.log("Gemini unavailable. Continuing...");
      console.error(err);
    }

    // ---------------- FIREBASE ----------------
    const docRef = await addDoc(collection(db, "leads"), {
      ...body,
      category,
      priority,
      emailSent: true,
      opened: false,
      clicked: false,
      createdAt: serverTimestamp(),
    });

    console.log("Saved to Firestore:", docRef.id);

    const leadId = docRef.id;

    // ---------------- EMAIL ----------------
    try {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: body.email,
        subject: "Thank you for contacting us",

        html: `
          <h2>Hi ${body.name},</h2>

          <p>Thank you for contacting us.</p>

          <p><strong>Requirement:</strong></p>

          <p>${body.requirement}</p>

          <p><strong>Category:</strong> ${category}</p>

          <p><strong>Priority:</strong> ${priority}</p>

          <img
            src="${BASE_URL}/api/open?id=${leadId}"
            width="1"
            height="1"
            style="display:none"
            alt=""
          />

          <br/>

          <a href="${BASE_URL}/api/click?id=${leadId}">
            Learn More
          </a>

          <br/><br/>

          <p>Regards,</p>
          <p>Lead Management Team</p>
        `,
      });

      console.log("Email sent");
      console.log(info);

    } catch (err) {
      console.error("Email failed:");
      console.error(err);
    }

    return NextResponse.json({
      success: true,
      category,
      priority,
      leadId,
    });

  } catch (err) {
    console.error("API ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        message:
          err instanceof Error
            ? err.message
            : String(err),
      },
      {
        status: 500,
      }
    );
  }
}
