"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { User, Mail, Phone, Lock, Check, X } from "lucide-react";

interface Profile {
  id: number;
  name: string | null;
  email: string;
  phone: string | null;
}

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState<"name" | "phone" | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.id) {
          setProfile(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function startEditing(field: "name" | "phone") {
    setEditingField(field);
    setEditValue(profile?.[field] || "");
  }

  function cancelEditing() {
    setEditingField(null);
    setEditValue("");
  }

  async function saveField() {
    if (!editingField) return;

    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [editingField]: editValue }),
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setEditingField(null);

        // Update session if name changed
        if (editingField === "name") {
          await updateSession({ name: editValue });
        }
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-card" />
        <div className="h-64 animate-pulse rounded-xl bg-card" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Account Settings</h1>

      {/* Profile */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 font-semibold text-foreground">Profile</h2>
        <div className="space-y-4">
          {/* Name */}
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Name</p>
              {editingField === "name" ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="rounded border border-border bg-background px-2 py-1 text-sm focus:border-primary focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={saveField}
                    disabled={saving}
                    className="rounded p-1 text-green-600 hover:bg-green-500/10"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="rounded p-1 text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <p className="font-medium text-foreground">
                  {profile?.name || "Not set"}
                </p>
              )}
            </div>
            {editingField !== "name" && (
              <button
                onClick={() => startEditing("name")}
                className="text-sm font-medium text-primary hover:underline"
              >
                Edit
              </button>
            )}
          </div>

          {/* Email (not editable) */}
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Mail className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium text-foreground">{profile?.email}</p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Phone className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Phone</p>
              {editingField === "phone" ? (
                <div className="flex items-center gap-2">
                  <input
                    type="tel"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="rounded border border-border bg-background px-2 py-1 text-sm focus:border-primary focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={saveField}
                    disabled={saving}
                    className="rounded p-1 text-green-600 hover:bg-green-500/10"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="rounded p-1 text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <p className="font-medium text-foreground">
                  {profile?.phone || "Not set"}
                </p>
              )}
            </div>
            {editingField !== "phone" && (
              <button
                onClick={() => startEditing("phone")}
                className="text-sm font-medium text-primary hover:underline"
              >
                {profile?.phone ? "Edit" : "Add"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 font-semibold text-foreground">Security</h2>
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Lock className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">Password</p>
            <p className="text-sm text-muted-foreground">••••••••</p>
          </div>
          <button className="text-sm font-medium text-primary hover:underline">
            Change
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
        <h2 className="mb-2 font-semibold text-destructive">Danger Zone</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Once you delete your account, there is no going back.
        </p>
        <button className="rounded-lg border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10">
          Delete Account
        </button>
      </div>
    </div>
  );
}
