"use client";

import { useState } from "react";

export default function Home() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    requirement: "",
  });

  async function submit() {
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    console.log(data);

    alert("Submitted!");
  }

  return (
    <main className="max-w-xl mx-auto p-10 space-y-4">

      <input
        placeholder="Name"
        className="border p-2 w-full"
        onChange={(e)=>setForm({...form,name:e.target.value})}
      />

      <input
        placeholder="Email"
        className="border p-2 w-full"
        onChange={(e)=>setForm({...form,email:e.target.value})}
      />

      <input
        placeholder="Phone"
        className="border p-2 w-full"
        onChange={(e)=>setForm({...form,phone:e.target.value})}
      />

      <input
        placeholder="Company"
        className="border p-2 w-full"
        onChange={(e)=>setForm({...form,company:e.target.value})}
      />

      <textarea
        placeholder="Requirement"
        className="border p-2 w-full"
        onChange={(e)=>setForm({...form,requirement:e.target.value})}
      />

      <button
        onClick={submit}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Submit
      </button>

    </main>
  );
}
