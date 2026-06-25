"use client";

import { useEffect, useState } from "react";

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  requirement: string;
  category: string;
  priority: string;
  emailSent: boolean;
  opened: boolean;
  clicked: boolean;
};

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then(setLeads);
  }, []);

  const total = leads.length;
  const sent = leads.filter((l) => l.emailSent).length;
  const opened = leads.filter((l) => l.opened).length;
  const clicked = leads.filter((l) => l.clicked).length;

  const openRate = total
    ? Math.round((opened / total) * 100)
    : 0;

  const clickRate = total
    ? Math.round((clicked / total) * 100)
    : 0;

  return (
    <main className="max-w-7xl mx-auto p-8">

      <h1 className="text-3xl font-bold mb-8">
        Lead Dashboard
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">

        <Card title="Total Leads" value={total} />
        <Card title="Emails Sent" value={sent} />
        <Card title="Emails Opened" value={opened} />
        <Card title="Open Rate" value={`${openRate}%`} />
        <Card title="Links Clicked" value={clicked} />
        <Card title="Click Rate" value={`${clickRate}%`} />

      </div>

      <table className="w-full border">

        <thead className="bg-gray-100">

          <tr>

            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Company</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Priority</th>
            <th className="border p-2">Opened</th>
            <th className="border p-2">Clicked</th>

          </tr>

        </thead>

        <tbody>

          {leads.map((lead) => (

            <tr key={lead.id}>

              <td className="border p-2">{lead.name}</td>

              <td className="border p-2">{lead.email}</td>

              <td className="border p-2">{lead.company}</td>

              <td className="border p-2">{lead.category}</td>

              <td className="border p-2">{lead.priority}</td>

              <td className="border p-2">
                {lead.opened ? "✅" : "❌"}
              </td>

              <td className="border p-2">
                {lead.clicked ? "✅" : "❌"}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </main>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="border rounded-lg p-5 shadow">

      <p className="text-gray-500">{title}</p>

      <h2 className="text-3xl font-bold mt-2">
        {value}
      </h2>

    </div>
  );
}
