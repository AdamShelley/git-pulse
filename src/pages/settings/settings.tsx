import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { Button } from "@/components/ui/button";
import { FolderOpen, Github, Inspect } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth-store";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Settings {
  theme: string;
  notifications: boolean;
  font_size: string;
  file_directory: string;
}

const Settings = () => {
  const settings = useSettingsStore((state) => state);
  const updateSettings = useSettingsStore((state) => state.updateSettings);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  const [isSaving, setIsSaving] = useState(false);
  const [_saveStatus, setSaveStatus] = useState("");
  const [_vaultPath, setVaultPath] = useState("");
  const [_AIKey, setAIKey] = useState<string>(settings.api_key || "");
  const [selectAPIKey, setSelectAPIKey] = useState(false);

  const handleChange = async (key: keyof Settings, value: any) => {
    // Update the store directly
    await updateSettings({ [key]: value });
    console.log("New settings after change:", useSettingsStore.getState());
  };

  const saveSettings = async (settingsToSave = settings) => {
    setIsSaving(true);
    setSaveStatus("Saving...");

    const updatedSettings = {
      ...settingsToSave,
      showApiInput: true,
      api_key: _AIKey,
    };

    try {
      await invoke("save_settings", { settings: updatedSettings });
      console.log(updatedSettings);
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
        await updateSettings({ ...settings, file_directory: selected });
      }
    } catch (err) {}
  };

  const setClaudeAPIKey = async () => {
    setSelectAPIKey((prev) => !prev);
  };

  const setKeyHandler = (key: string) => {
    setAIKey(key);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>
          Manage your application preferences and connections.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-4">
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 items-center gap-4">
                <label className="text-sm font-medium">Theme</label>
                <Select
                  onValueChange={(e) => handleChange("theme", e)}
                  value={settings.theme || "system"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent className="font-inter">
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 items-center gap-4">
                <label className="text-sm font-medium">Font Size</label>
                <Select
                  onValueChange={(e) => handleChange("font_size", e)}
                  value={settings.font_size || "medium"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent className="font-inter">
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="connections" className="space-y-4">
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Obsidian Vault</h4>
                  <p className="text-sm text-muted-foreground">
                    {settings.file_directory || "No vault selected"}
                  </p>
                </div>
                <Button onClick={selectVaultPath} variant="outline" size="sm">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Select Path
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Anthropic API</h4>
                  <p className="text-sm text-muted-foreground">
                    {settings.api_key ? "API Key configured" : "No API key set"}
                  </p>
                </div>
                <Button onClick={setClaudeAPIKey} variant="outline" size="sm">
                  <Inspect className="h-4 w-4 mr-2" />
                  Configure API
                </Button>
              </div>
              {selectAPIKey && (
                <Input
                  type="password"
                  value={_AIKey}
                  placeholder="Enter your Anthropic API key"
                  onChange={(e) => setKeyHandler(e.target.value)}
                />
              )}

              {!isLoggedIn && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">GitHub Account</h4>
                      <p className="text-sm text-muted-foreground">
                        Connect your GitHub account
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Github className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <div className="space-y-4 pt-4">
              <div className="flex flex-row items-center justify-end space-x-5">
                <Checkbox
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={(checked) =>
                    handleChange("notifications", checked)
                  }
                />
                <div className="">
                  <label
                    htmlFor="notifications"
                    className="text-sm font-medium leading-none"
                  >
                    Enable Notifications
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about updates and important changes
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4">
          <Button onClick={() => saveSettings()} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Settings;
