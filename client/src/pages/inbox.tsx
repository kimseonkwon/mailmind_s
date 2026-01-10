import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Mail,
  User, 
  Clock,
  FileText,
  Loader2,
  Calendar,
  Sparkles,
  Inbox,
  Briefcase,
  Users,
  Paperclip,
  CheckCircle,
  Bell
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Email {
  id: number;
  subject: string;
  sender: string;
  date: string;
  body: string;
  classification?: string;
  classificationConfidence?: string;
  isProcessed?: string;
}

interface EventExtractionResponse {
  success: boolean;
  events: Array<{
    title: string;
    startDate: string;
    endDate?: string;
    location?: string;
    description?: string;
  }>;
}

const CATEGORIES = [
  { id: "all", label: "전체", icon: Inbox },
  { id: "업무요청", label: "업무요청", icon: Briefcase },
  { id: "회의", label: "회의", icon: Users },
  { id: "첨부파일", label: "첨부파일", icon: Paperclip },
  { id: "결재요청", label: "결재요청", icon: CheckCircle },
  { id: "공지", label: "공지", icon: Bell },
];

export default function InboxPage() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [extractingId, setExtractingId] = useState<number | null>(null);

  // 전체 이메일 목록 (카운트용)
  const { data: allEmails } = useQuery<Email[]>({
    queryKey: ["/api/emails"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/emails");
      return response.json();
    },
  });

  // 필터링된 이메일 목록
  const { data: emails, isLoading } = useQuery<Email[]>({
    queryKey: ["/api/emails", selectedCategory],
    queryFn: async () => {
      const url = selectedCategory === "all" 
        ? "/api/emails" 
        : `/api/emails?classification=${encodeURIComponent(selectedCategory)}`;
      const response = await apiRequest("GET", url);
      return response.json();
    },
  });

  const classifyMutation = useMutation({
    mutationFn: async (emailId: number) => {
      const response = await apiRequest("POST", `/api/emails/${emailId}/classify`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/emails"] });
      toast({
        title: "분류 완료",
        description: "이메일이 성공적으로 분류되었습니다.",
      });
    },
  });

  const classifyAllMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/emails/classify-all");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/emails"] });
      toast({
        title: "전체 분류 완료",
        description: `${data.classified}개의 이메일이 분류되었습니다.`,
      });
    },
    onError: () => {
      toast({
        title: "분류 실패",
        description: "이메일 분류 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const extractEventsMutation = useMutation({
    mutationFn: async (emailId: number) => {
      setExtractingId(emailId);
      const response = await apiRequest("POST", `/api/events/extract/${emailId}`);
      return response.json() as Promise<EventExtractionResponse>;
    },
    onSuccess: (data) => {
      setExtractingId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "일정 추출 완료",
        description: `${data.events.length}개의 일정이 추출되었습니다.`,
      });
    },
    onError: () => {
      setExtractingId(null);
    },
  });

  const filteredEmails = emails || [];
  const categoryCount = CATEGORIES.map(cat => ({
    ...cat,
    count: cat.id === "all" 
      ? allEmails?.length || 0
      : allEmails?.filter(e => e.classification === cat.id).length || 0
  }));

  return (
    <div className="flex h-screen">
      {/* 왼쪽 사이드바 - 분류 메뉴 */}
      <div className="w-64 border-r bg-muted/20">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Mail className="h-6 w-6" />
            메일함
          </h1>
        </div>
        <ScrollArea className="h-[calc(100vh-73px)]">
          <div className="p-2 space-y-1">
            {categoryCount.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1 text-left">{category.label}</span>
                  <Badge variant="outline" className="ml-auto">
                    {category.count}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* 오른쪽 메일 목록 */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {CATEGORIES.find(c => c.id === selectedCategory)?.label}
            <span className="text-muted-foreground ml-2">
              ({filteredEmails.length})
            </span>
          </h2>
          <Button
            variant="outline"
            onClick={() => classifyAllMutation.mutate()}
            disabled={classifyAllMutation.isPending}
          >
            {classifyAllMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                분류 중...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                전체 분류
              </>
            )}
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))
            ) : filteredEmails.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>이메일이 없습니다</p>
              </div>
            ) : (
              filteredEmails.map((email) => (
                <Card 
                  key={email.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedEmail(email)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">
                            {email.subject || "(제목 없음)"}
                          </h3>
                          {email.classification && (
                            <Badge variant="secondary" className="shrink-0">
                              {email.classification}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="truncate max-w-[200px]">{email.sender}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{email.date}</span>
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-1">
                          {email.body}
                        </p>
                      </div>
                      
                      {email.isProcessed !== "true" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            classifyMutation.mutate(email.id);
                          }}
                          disabled={classifyMutation.isPending}
                        >
                          {classifyMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* 이메일 상세 다이얼로그 */}
      <Dialog open={!!selectedEmail} onOpenChange={() => setSelectedEmail(null)}>
        <DialogContent className="max-w-4xl max-h-[95vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedEmail?.subject || "(제목 없음)"}</DialogTitle>
          </DialogHeader>
          
          {selectedEmail && (
            <div className="flex-1 overflow-hidden flex flex-col gap-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">발신자:</span>
                  <span>{selectedEmail.sender}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">날짜:</span>
                  <span>{selectedEmail.date}</span>
                </div>
                {selectedEmail.classification && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">분류:</span>
                    <Badge variant="secondary">{selectedEmail.classification}</Badge>
                    {selectedEmail.classificationConfidence && (
                      <Badge variant="outline" className="text-xs">
                        신뢰도: {selectedEmail.classificationConfidence}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex-1 overflow-y-auto border rounded-md p-4 bg-muted/50">
                <p className="whitespace-pre-wrap text-sm">{selectedEmail.body}</p>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                {selectedEmail.isProcessed !== "true" && (
                  <Button
                    variant="outline"
                    onClick={() => classifyMutation.mutate(selectedEmail.id)}
                    disabled={classifyMutation.isPending}
                  >
                    {classifyMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    분류하기
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => extractEventsMutation.mutate(selectedEmail.id)}
                  disabled={extractingId === selectedEmail.id}
                >
                  {extractingId === selectedEmail.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Calendar className="h-4 w-4 mr-2" />
                  )}
                  일정 추출
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
