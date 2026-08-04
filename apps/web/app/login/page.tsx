"use client";

import { FormEvent, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PageIntro } from "@/components/PageIntro";
import { TopBar } from "@/components/TopBar";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setMessage(`Logged in successfully as ${email} (Demo Session active)`);
  };

  return (
    <AppShell>
      <TopBar title="User Authentication" />
      <PageIntro
        title="Sign In to LifeBridge AI"
        description="Access personalized recommendations across web and mobile platforms."
      />
      <form className="profile-form" onSubmit={handleSubmit}>
        <label className="full">
          Email Address
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.org" />
        </label>
        <label className="full">
          Password
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </label>
        <button type="submit" className="primary">Sign In</button>
        {message && <p className="success-note">{message}</p>}
      </form>
    </AppShell>
  );
}
