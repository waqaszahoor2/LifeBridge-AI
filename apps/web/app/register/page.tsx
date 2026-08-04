"use client";

import { FormEvent, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PageIntro } from "@/components/PageIntro";
import { TopBar } from "@/components/TopBar";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setMessage(`Account created for ${name}! Please sign in.`);
  };

  return (
    <AppShell>
      <TopBar title="Create Account" />
      <PageIntro
        title="Register for LifeBridge AI"
        description="Get personalized job, scholarship, disaster, and skill matching."
      />
      <form className="profile-form" onSubmit={handleSubmit}>
        <label className="full">
          Full Name
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
        </label>
        <label className="full">
          Email Address
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.org" />
        </label>
        <label className="full">
          Password
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </label>
        <button type="submit" className="primary">Create Account</button>
        {message && <p className="success-note">{message}</p>}
      </form>
    </AppShell>
  );
}
