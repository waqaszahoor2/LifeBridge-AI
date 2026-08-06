"use client";

import { FormEvent, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PageIntro } from "@/components/PageIntro";
import { TopBar } from "@/components/TopBar";
import { defaultProfile, readLocalProfile, saveLocalProfile } from "@/lib/profile";

export default function ProfilePage() {
  const [profile, setProfile] = useState(() => readLocalProfile() || defaultProfile);
  const [saved, setSaved] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    saveLocalProfile(profile);
    setSaved(true);
  }

  return (
    <AppShell>
      <TopBar title="Personal Profile" />
      <PageIntro
        title="Improve your recommendations"
        description="This browser-local profile powers the public demo without creating an account. Do not store sensitive information here. Authenticated profile APIs are also included for production integration."
      />
      <form className="profile-form" onSubmit={submit}>
        <label>Country<input value={profile.country} onChange={(event) => setProfile({ ...profile, country: event.target.value })} /></label>
        <label>City<input value={profile.city} onChange={(event) => setProfile({ ...profile, city: event.target.value })} /></label>
        <label>Study level<input value={profile.study_level} onChange={(event) => setProfile({ ...profile, study_level: event.target.value })} /></label>
        <label>Field of study<input value={profile.field_of_study} onChange={(event) => setProfile({ ...profile, field_of_study: event.target.value })} /></label>
        <label className="full">Skills<input value={(profile.skills || []).join(", ")} onChange={(event) => setProfile({ ...profile, skills: event.target.value.split(",").map((value) => value.trim()).filter(Boolean) })} /></label>
        <label className="full">Interests<input value={(profile.interests || []).join(", ")} onChange={(event) => setProfile({ ...profile, interests: event.target.value.split(",").map((value) => value.trim()).filter(Boolean) })} /></label>
        <button type="submit" className="primary">Save local profile</button>
        {saved && <span className="success-note">Saved. Refresh the home feed to apply it.</span>}
      </form>
    </AppShell>
  );
}
