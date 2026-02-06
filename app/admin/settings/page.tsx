"use client";

import { useEffect, useState } from "react";
import { Store, Mail, Phone, MapPin, DollarSign, Bell, Save, Loader2 } from "lucide-react";

type SettingsMap = Record<string, string>;

const DEFAULT_SETTINGS: SettingsMap = {
  store_name: "",
  store_email: "",
  store_phone: "",
  store_address: "",
  currency: "KES",
  order_email_enabled: "1",
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsMap>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setSettings({ ...DEFAULT_SETTINGS, ...data });
      })
      .catch(() => setSettings(DEFAULT_SETTINGS))
      .finally(() => setLoading(false));
  }, []);

  function updateSetting(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setMessage(null);
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      if (data.settings) setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
      setMessage({ type: "success", text: "Settings saved." });
    } catch (e) {
      setMessage({
        type: "error",
        text: e instanceof Error ? e.message : "Failed to save settings",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-card" />
        <div className="h-64 animate-pulse rounded-xl bg-card" />
        <div className="h-48 animate-pulse rounded-xl bg-card" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="mt-1 text-muted-foreground">
            Store and application settings.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save
        </button>
      </div>

      {message && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Store information */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
          <Store className="h-5 w-5 text-primary" />
          Store information
        </h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">
              Store name
            </label>
            <input
              type="text"
              value={settings.store_name ?? ""}
              onChange={(e) => updateSetting("store_name", e.target.value)}
              placeholder="FnM's Mini Mart"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">
              Contact email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={settings.store_email ?? ""}
                onChange={(e) => updateSetting("store_email", e.target.value)}
                placeholder="store@example.com"
                className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">
              Contact phone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="tel"
                value={settings.store_phone ?? ""}
                onChange={(e) => updateSetting("store_phone", e.target.value)}
                placeholder="+254..."
                className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">
              Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <textarea
                value={settings.store_address ?? ""}
                onChange={(e) => updateSetting("store_address", e.target.value)}
                placeholder="Street, area, city"
                rows={2}
                className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* General */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
          <DollarSign className="h-5 w-5 text-primary" />
          General
        </h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">
              Currency
            </label>
            <select
              value={settings.currency ?? "KES"}
              onChange={(e) => updateSetting("currency", e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
            >
              <option value="KES">KES</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-4">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Order confirmation emails</p>
                <p className="text-sm text-muted-foreground">
                  Send email to customers when an order is placed
                </p>
              </div>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={(settings.order_email_enabled ?? "1") === "1"}
                onChange={(e) =>
                  updateSetting("order_email_enabled", e.target.checked ? "1" : "0")
                }
                className="peer sr-only"
              />
              <div className="h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-border after:bg-background after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-primary" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
