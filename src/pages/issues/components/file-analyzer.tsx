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
    <div className="w-full mx-auto">
      <div className="flex gap-4">
        <Button
          onClick={analyzeFiles}
          disabled={loading || !repoName || !issueNumber || !!results}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            "Analyse with AI"
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
          className={`transition-all duration-300 w-full ${
            isExpanded ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="p-1 border-b flex justify-between items-center">
            <h3 className="text-sm font-semibold">Analysis Results</h3>
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
            className={`transition-all duration-300 p-0 ${
              isExpanded ? "max-h-96" : "max-h-0"
            } overflow-auto`}
          >
            {results.map((item, index) => (
              <div key={index} className="p-2">
                <div className="font-medium text-sm">{item.path}</div>
                <div className="text-xs text-gray-600 mt-1">{item.reason}</div>
                <div className="text-xs text-gray-500 mt-1">
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
