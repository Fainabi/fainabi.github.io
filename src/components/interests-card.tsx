import { Lightbulb } from "lucide-react";

interface InterestsCardProps {
  interests: string[];
}

export function InterestsCard({ interests }: InterestsCardProps) {
  if (interests.length === 0) return null;

  return (
    <div className="mt-12 rounded-lg border border-dashed bg-muted/30 px-5 py-4 text-sm">
      <div className="mb-3 flex items-center gap-2 font-semibold">
        <Lightbulb className="h-4 w-4" />
        Also in this paper
      </div>
      <ul className="list-inside list-disc space-y-1 text-muted-foreground">
        {interests.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
