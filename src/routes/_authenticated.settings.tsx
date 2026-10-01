import { createFileRoute } from "@tanstack/react-router";

import { DetailList, PageIntro, Panel } from "@/components/common/PageIntro";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme, type ThemeChoice } from "@/providers/ThemeProvider";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Command Hub" },
      { name: "description", content: "Account and appearance settings for Command Hub." },
      { property: "og:title", content: "Settings — Command Hub" },
      { property: "og:description", content: "Account and appearance settings for Command Hub." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const { choice, setChoice } = useTheme();

  return (
    <div className="space-y-6">
      <PageIntro title="Settings" />
      <Panel title="Account">
        <DetailList
          items={[
            { label: "Email", value: user?.email },
            { label: "User ID", value: user?.id },
            { label: "Session", value: "HTTP-only session cookie" },
          ]}
        />
      </Panel>
      <Panel title="Appearance" description="Stored on this device.">
        <div className="p-4">
          <ToggleGroup
            type="single"
            variant="outline"
            value={choice}
            onValueChange={(v) => v && setChoice(v as ThemeChoice)}
            aria-label="Theme"
          >
            <ToggleGroupItem value="light">Light</ToggleGroupItem>
            <ToggleGroupItem value="dark">Dark</ToggleGroupItem>
            <ToggleGroupItem value="system">System</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </Panel>
    </div>
  );
}
