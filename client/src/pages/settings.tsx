import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Settings as SettingsIcon,
  Database,
  Folder,
  Server,
  HardDrive
} from "lucide-react";

interface StorageSettings {
  mode: string;
  dataDir: string;
  info: string;
}

interface OllamaStatus {
  connected: boolean;
  baseUrl: string;
}

export default function Settings() {
  const { data: storageSettings, isLoading: storageLoading } = useQuery<StorageSettings>({
    queryKey: ["/api/settings/storage"],
  });

  const { data: ollamaStatus, isLoading: ollamaLoading } = useQuery<OllamaStatus>({
    queryKey: ["/api/ollama/status"],
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary p-2">
              <SettingsIcon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">설정</h1>
              <p className="text-xs text-muted-foreground">저장소 및 AI 설정 관리</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              저장소 설정
            </CardTitle>
            <CardDescription>
              이메일 데이터가 저장되는 위치를 확인합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {storageLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">저장소 모드</span>
                  <Badge variant={storageSettings?.mode === "local" ? "default" : "secondary"}>
                    {storageSettings?.mode === "local" ? (
                      <>
                        <HardDrive className="h-3 w-3 mr-1" />
                        로컬 SQLite
                      </>
                    ) : (
                      <>
                        <Database className="h-3 w-3 mr-1" />
                        PostgreSQL
                      </>
                    )}
                  </Badge>
                </div>
                
                {storageSettings?.mode === "local" && storageSettings.dataDir && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">데이터 폴더</span>
                    <span className="text-sm font-mono bg-muted px-2 py-1 rounded flex items-center gap-1">
                      <Folder className="h-3 w-3" />
                      {storageSettings.dataDir}
                    </span>
                  </div>
                )}

                <div className="pt-2 text-sm text-muted-foreground border-t">
                  {storageSettings?.info}
                </div>

                <div className="bg-muted/50 rounded-md p-4 text-sm">
                  <p className="font-medium mb-2">저장소 모드 변경하기</p>
                  <p className="text-muted-foreground">
                    환경 변수를 통해 저장소 모드를 변경할 수 있습니다:
                  </p>
                  <ul className="mt-2 space-y-1 text-xs font-mono">
                    <li><code>STORAGE_MODE=local</code> - 로컬 SQLite 사용</li>
                    <li><code>DATA_DIR=/path/to/folder</code> - 데이터 저장 경로</li>
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              AI 서버 설정
            </CardTitle>
            <CardDescription>
              Ollama AI 서버 연결 상태를 확인합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {ollamaLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">연결 상태</span>
                  <Badge variant={ollamaStatus?.connected ? "default" : "destructive"}>
                    {ollamaStatus?.connected ? "연결됨" : "연결 안됨"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">서버 주소</span>
                  <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {ollamaStatus?.baseUrl || "http://localhost:11434"}
                  </span>
                </div>

                <div className="bg-muted/50 rounded-md p-4 text-sm">
                  <p className="font-medium mb-2">AI 기능</p>
                  <ul className="text-muted-foreground space-y-1">
                    <li>- 이메일 자동 분류 (업무, 개인, 회의 등)</li>
                    <li>- 일정 자동 추출 및 캘린더 연동</li>
                    <li>- AI 채팅 (이메일 내용 기반 답변)</li>
                  </ul>
                  {!ollamaStatus?.connected && (
                    <p className="mt-3 text-destructive">
                      AI 서버에 연결되지 않으면 자동 분류 및 일정 추출이 작동하지 않습니다.
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI 학습 데이터</CardTitle>
            <CardDescription>
              업로드된 이메일 데이터가 AI 응답에 어떻게 사용되는지 설명합니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                업로드된 모든 이메일 데이터는 AI 채팅 시 참고 자료로 활용됩니다.
              </p>
              <p>
                AI에게 질문하면, 관련된 이메일 내용을 자동으로 검색하여 
                맥락에 맞는 답변을 제공합니다.
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>이메일 내용 기반 질의응답</li>
                <li>일정 및 미팅 관련 정보 검색</li>
                <li>발신자/수신자 관련 정보 조회</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
