const RESOURCES = [
  {
    file: "christian_family_command_center.xlsx",
    title: "Christian Family Command Center Workbook",
    description:
      "Meal planning, budget & giving, family schedule, prayer & Scripture, and habit tracker in one spreadsheet.",
  },
  {
    file: "Prayer_Weekly_Planner_Branded.pdf",
    title: "Prayer & Weekly Planner (branded)",
    description: "The full printable weekly planner, prayer journal, and Scripture memory pages.",
  },
  {
    file: "Prayer_Weekly_Planner.pdf",
    title: "Prayer & Weekly Planner (simple)",
    description: "A plain, unbranded version of the weekly planner.",
  },
  {
    file: "Weekly_Family_Reset_Checklist.pdf",
    title: "Weekly Family Reset Checklist",
    description: "A one-page checklist to reset your home, schedule, and heart each Sunday.",
  },
  {
    file: "McGowan_HQ_Master_Dashboard.xlsx",
    title: "HQ Master Dashboard",
    description: "Portfolio priorities, 90-day roadmap, launch checklist, and KPI tracking.",
  },
];

export default function ResourcesPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-brand-green">Resources</h1>
      <p className="mt-1 text-sm text-foreground/70">
        Printable planners and trackers, ready to download and use offline.
      </p>

      <ul className="mt-6 space-y-3">
        {RESOURCES.map((r) => (
          <li
            key={r.file}
            className="flex items-center justify-between gap-4 rounded-xl border border-brand-border bg-brand-card px-4 py-3"
          >
            <div>
              <p className="font-medium">{r.title}</p>
              <p className="text-sm text-foreground/60">{r.description}</p>
            </div>
            <a
              href={`/resources/${r.file}`}
              download
              className="shrink-0 rounded-full bg-brand-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-green-light"
            >
              Download
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
