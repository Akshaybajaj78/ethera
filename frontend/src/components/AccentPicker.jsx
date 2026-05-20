import { useTheme } from "../state/ThemeContext.jsx";

const options = [
  { value: "indigo", label: "Indigo" },
  { value: "emerald", label: "Emerald" },
  { value: "rose", label: "Rose" },
  { value: "amber", label: "Amber" },
  { value: "cyan", label: "Cyan" },
];

export function AccentPicker() {
  const { accent, setAccent } = useTheme();
  return (
    <div className="hidden sm:block">
      <select className="input py-2 text-sm" value={accent} onChange={(e) => setAccent(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            Theme: {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

