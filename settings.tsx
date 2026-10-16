import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { RECITERS, useSettings } from "@/lib/settings";
import { AccountCard } from "@/components/account/AccountCard";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · Al-Furqan" },
      {
        name: "description",
        content:
          "Choose your reciter, Arabic font size, translation visibility and theme for the Al-Furqan Quran reader.",
      },
      { property: "og:title", content: "Settings · Al-Furqan" },
      {
        property: "og:description",
        content: "Personalise recitation, typography and theme in Al-Furqan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { settings, update, reset } = useSettings();

  return (
    <div className="min-h-screen bg-background px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/surah/$number"
          params={{ number: "1" }}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to reader
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-foreground">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your preferences are saved on this device.
        </p>

        <section className="mt-8 space-y-6">
          <AccountCard />

          <div className="rounded-xl border bg-card p-5">
            <label htmlFor="reciter" className="block text-sm font-semibold text-card-foreground">
              Reciter
            </label>
            <p className="mt-1 text-xs text-muted-foreground">Voice used for recitation audio.</p>
            <select
              id="reciter"
              value={settings.reciterId}
              onChange={(event) => update({ reciterId: Number(event.target.value) })}
              className="mt-3 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {RECITERS.map((reciter) => (
                <option key={reciter.id} value={reciter.id}>
                  {reciter.name}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <p className="text-sm font-semibold text-card-foreground">Arabic script</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Tajweed colours highlight recitation rules.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {(["uthmani", "tajweed"] as const).map((script) => (
                <button
                  key={script}
                  onClick={() => update({ script })}
                  className={[
                    "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                    settings.script === script
                      ? "border-primary bg-primary text-primary-foreground"
                      : "text-card-foreground hover:bg-secondary",
                  ].join(" ")}
                >
                  {script === "uthmani" ? "Uthmani" : "Tajweed (coloured)"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-xl border bg-card p-5">
            {(
              [
                ["wordByWord", "Word-by-word", "Show each Arabic word with its English meaning."],
                [
                  "showTransliteration",
                  "Transliteration",
                  "Show Latin pronunciation of the Arabic.",
                ],
              ] as const
            ).map(([key, label, hint]) => (
              <label key={key} className="flex items-start justify-between gap-4">
                <span>
                  <span className="block text-sm font-semibold text-card-foreground">{label}</span>
                  <span className="block text-xs text-muted-foreground">{hint}</span>
                </span>
                <input
                  type="checkbox"
                  checked={settings[key]}
                  onChange={(e) => update({ [key]: e.target.checked })}
                  className="mt-1 h-4 w-4 accent-[var(--primary)]"
                />
              </label>
            ))}
          </div>

          <div className="rounded-xl border bg-card p-5">
            <label
              htmlFor="arabic-size"
              className="block text-sm font-semibold text-card-foreground"
            >
              Arabic font size · {settings.arabicSize}px
            </label>
            <input
              id="arabic-size"
              type="range"
              min={20}
              max={56}
              step={2}
              value={settings.arabicSize}
              onChange={(event) => update({ arabicSize: Number(event.target.value) })}
              className="mt-4 w-full accent-primary"
            />
            <p
              className="mt-4 text-right leading-loose text-card-foreground"
              style={{ fontFamily: "var(--font-arabic)", fontSize: `${settings.arabicSize}px` }}
            >
              ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ
            </p>
          </div>

          <ToggleRow
            label="Show English translation"
            description="Saheeh International translation under each verse."
            checked={settings.showTranslation}
            onChange={(value) => update({ showTranslation: value })}
          />

          <ToggleRow
            label="Continuous playback"
            description="Automatically play the next verse when one finishes."
            checked={settings.autoAdvance}
            onChange={(value) => update({ autoAdvance: value })}
          />

          <ToggleRow
            label="Dark theme"
            description="Easier reading at night."
            checked={settings.theme === "dark"}
            onChange={(value) => update({ theme: value ? "dark" : "light" })}
          />

          <button
            onClick={reset}
            className="rounded-lg border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
          >
            Reset to defaults
          </button>
        </section>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border bg-card p-5">
      <div>
        <p className="text-sm font-semibold text-card-foreground">{label}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={[
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-primary" : "bg-muted",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-all",
            checked ? "left-[1.375rem]" : "left-0.5",
          ].join(" ")}
        />
      </button>
    </div>
  );
}
