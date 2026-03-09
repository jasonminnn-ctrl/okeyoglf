import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PresetButtonProps {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  active?: boolean;
}

export function PresetButton({ label, onClick, icon, active }: PresetButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={cn(
        "h-auto py-2 px-3 text-xs font-normal whitespace-normal text-left justify-start",
        "border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all",
        active && "border-primary/50 bg-primary/10"
      )}
    >
      {icon && <span className="mr-1.5 flex-shrink-0">{icon}</span>}
      {label}
    </Button>
  );
}

interface PresetGroupProps {
  title: string;
  presets: { label: string; value: string }[];
  onSelect: (value: string) => void;
  selectedValue?: string;
}

export function PresetGroup({ title, presets, onSelect, selectedValue }: PresetGroupProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <PresetButton
            key={preset.value}
            label={preset.label}
            onClick={() => onSelect(preset.value)}
            active={selectedValue === preset.value}
          />
        ))}
      </div>
    </div>
  );
}
