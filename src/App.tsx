import { Toaster } from "sonner";
import "./App.css";
import IssuesDashboard from "./dashboard/dashboard";

function App() {
  return (
    <>
      <Toaster />
      <main className="dark text-white bg-zinc-900 w-screen h-screen overflow-x-hidden font-inconsolata p-5">
        <IssuesDashboard />
      </main>
    </>
  );
}

export default App;
