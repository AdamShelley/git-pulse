import { useState } from "react";
import { AlertCircle, ChevronDown, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { invoke } from "@tauri-apps/api/core";

interface FileAnalyzerProps {
  repoName: string;
  issueNumber: string | number;
}

const FileAnalyzer = ({ repoName, issueNumber }: FileAnalyzerProps) => {
  const [loading, setLoading] = useState(false);
  interface AnalysisResult {
    path: string;
    reason: string;
    confidence: number;
  }
  const [results, setResults] = useState<AnalysisResult[] | null>(null);
  const [error, setError] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const analyzeFiles = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await invoke("get_relevant_files", {
        input: {
          repo_name: repoName,
          issue_number: parseInt(String(issueNumber)),
        },
      });
      setResults(data as AnalysisResult[]);
      setIsExpanded(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="flex gap-4">
        <Button
          onClick={analyzeFiles}
          disabled={loading || !repoName || !issueNumber}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            "Analyze"
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {results && (
        <Card
          className={`transition-all duration-300 ${
            isExpanded ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">Analysis Results</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <ChevronDown
                className={`transform transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </Button>
          </div>
          <CardContent
            className={`transition-all duration-300 ${
              isExpanded ? "max-h-96" : "max-h-0"
            } overflow-auto`}
          >
            {results.map((item, index) => (
              <div key={index} className="py-2 border-b last:border-0">
                <div className="font-medium">{item.path}</div>
                <div className="text-sm text-gray-600">{item.reason}</div>
                <div className="text-sm text-gray-500">
                  Confidence: {(item.confidence * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileAnalyzer;
