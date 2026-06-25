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

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ---------- AI Classification ----------
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

    let category = "General";
    let priority = "Medium";

    try {
      const result = JSON.parse(response.text!);
      category = result.category;
      priority = result.priority;
    } catch {}

    // ---------- Save Lead ----------
    const docRef = await addDoc(collection(db, "leads"), {
      ...body,
      category,
      priority,
      emailSent: true,
      opened: false,
      clicked: false,
      createdAt: serverTimestamp(),
    });

    const leadId = docRef.id;

    // ---------- Send Email ----------
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: body.email,
      subject: "Thank you for contacting us",

      html: `
        <h2>Hi ${body.name},</h2>

        <p>Thank you for reaching out.</p>

        <p>We received your requirement:</p>

        <p><strong>${body.requirement}</strong></p>

        <p>
          Category:
          <strong>${category}</strong>
        </p>

        <p>
          Priority:
          <strong>${priority}</strong>
        </p>

        <br/>

        <img
          src="http://localhost:3000/api/open?id=${leadId}"
          width="1"
          height="1"
          alt=""
        />

        <a
          href="http://localhost:3000/api/click?id=${leadId}"
        >
          Learn More
        </a>

        <br/><br/>

        <p>Regards,</p>
        <p>Lead Management Team</p>
      `,
    });

    return NextResponse.json({
      success: true,
      category,
      priority,
      leadId,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}
