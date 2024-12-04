import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { Button } from "@/components/ui/button";
import { FolderOpen, Github } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import useSettingsStore from "@/stores/settings-store";

interface Settings {
  theme: string;
  notifications: boolean;
  font_size: string;
  file_directory: string;
}

const Settings = () => {
  const [settings, setSettings] = useState<Settings>({
    theme: "system",
    notifications: true,
    font_size: "",
    file_directory: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [vaultPath, setVaultPath] = useState("");

  const loadSettings = async () => {
    console.log("Loading settings");
    try {
      const settings = useSettingsStore.getState();

      console.log(settings);
      setSettings(settings);
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const handleChange = async (key: keyof Settings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
  };

  const saveSettings = async (settingsToSave = settings) => {
    setIsSaving(true);
    setSaveStatus("Saving...");

    console.log(settingsToSave);

    try {
      await invoke("save_settings", { settings: settingsToSave });
      setSaveStatus("Settings saved successfully");
      toast.success("Settings saved successfully");
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      setSaveStatus("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const selectVaultPath = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Select Obsidian Vault Directory",
      });
      if (selected) {
        setVaultPath(selected);
        setSettings({ ...settings, file_directory: selected });
      }
    } catch (err) {}
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <Card className="bg-zinc-900/50 border-zinc-700/50 ">
      <CardHeader>
        <CardTitle className="flex text-md font-medium items-center gap-2 m-0">
          Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-8">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-2">Theme</label>
          <Select
            onValueChange={(e) => handleChange("theme", e)}
            value={settings.theme || "System"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent className="font-inherit">
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-medium text-sm">Font Size</label>
          <Select
            onValueChange={(e) => handleChange("font_size", e)}
            value={settings.font_size || "Medium"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Font Size" />
            </SelectTrigger>
            <SelectContent className="font-inherit ">
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="large">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-3 flex items-center justify-end gap-2 w-full">
          <Checkbox
            id="notifications"
            checked={settings.notifications}
            onCheckedChange={(checked) =>
              handleChange("notifications", checked)
            }
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="notifications"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Turn on notifications
            </label>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-end gap-2 w-full">
          <Button onClick={selectVaultPath} variant="outline" className="">
            <FolderOpen className="h-4 w-4" />
          </Button>
          <label
            className="font-medium text-sm flex flex-col"
            htmlFor="vaultPath"
          >
            Select Obsidian vault path
            <span className="text-zinc-400">
              Currently selected path: {settings.file_directory}
            </span>
          </label>
        </div>

        <div className="mt-3 flex items-center justify-end gap-2 w-full">
          <Button onClick={selectVaultPath} variant="outline" className="">
            <Github className="h-4 w-4" />
          </Button>
          <label className="font-medium text-sm" htmlFor="vaultPath">
            OAuth Login
          </label>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 items-center justify-center mt-2">
        <Button
          onClick={() => saveSettings()}
          disabled={isSaving}
          className="px-4 py-2 rounded disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Settings;
