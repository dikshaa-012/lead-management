import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id");

  if (id) {
    await updateDoc(doc(db, "leads", id), {
      clicked: true,
    });
  }

  return NextResponse.redirect("https://google.com");
}
