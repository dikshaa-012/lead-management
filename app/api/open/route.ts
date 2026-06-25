import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id");

  if (id) {
    await updateDoc(doc(db, "leads", id), {
      opened: true,
    });
  }

  // 1x1 transparent gif
  const pixel = Buffer.from(
    "R0lGODlhAQABAPAAAP///wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==",
    "base64"
  );

  return new Response(pixel, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-cache",
    },
  });
}
