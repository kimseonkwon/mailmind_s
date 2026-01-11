import { useState } from "react";
import { Link } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, User, Clock, CalendarPlus } from "lucide-react";
import EventCreateDialog from "@/components/calendar/EventCreateDialog";
import type { Email } from "@shared/schema";

type EventCreatePayload = {
  emailId: number;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
};

export default function UnextractedEmailsPage() {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [createEmail, setCreateEmail] = useState<Email | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: emails = [], isLoading } = useQuery<Email[]>({
    queryKey: ["/api/emails/unextracted"],
  });

  const createEventMutation = useMutation({
    mutationFn: async (payload: EventCreatePayload) => {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("일정 생성에 실패했습니다.");
      }
    },
    onSuccess: async () => {
      setCreateEmail(null);
      setSelectedEmail(null);
      await queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/emails/unextracted"] });
    },
    onError: (error) => {
      toast({
        title: "일정 생성 실패",
        description: error instanceof Error ? error.message : "다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  const handleCreateSave = (payload: EventCreatePayload) => {
    createEventMutation.mutate(payload);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary p-2">
                <Mail className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">미추출 이메일</h1>
                <p className="text-xs text-muted-foreground">
                  일정이 연결되지 않은 이메일 목록
                </p>
              </div>
            </div>
            <Badge variant="outline">총 {emails.length}건</Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 rounded-full bg-muted p-1">
            <Link href="/calendar?tab=calendar">
              <Button size="sm" variant="ghost">
                캘린더
              </Button>
            </Link>
            <Link href="/calendar?tab=list">
              <Button size="sm" variant="ghost">
                일정 목록
              </Button>
            </Link>
            <Button size="sm" variant="default">
              미추출 이메일
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : emails.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              미추출 이메일이 없습니다.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {emails.map((email) => (
              <Card key={email.id}>
                <CardContent
                  className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between cursor-pointer"
                  onClick={() => setSelectedEmail(email)}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{email.subject}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{email.sender}</span>
                      <span>•</span>
                      <span>{email.date}</span>
                    </div>
                  </div>
                  <Badge variant="outline">일정 없음</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog
          open={!!selectedEmail}
          onOpenChange={(open) => !open && setSelectedEmail(null)}
        >
          <DialogContent className="max-w-4xl max-h-[95vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>{selectedEmail?.subject}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto pr-2">
              {selectedEmail && (
                <div className="space-y-4">
                  <div className="grid gap-2 text-sm">
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
                  </div>
                  <div>
                    <span className="text-sm font-medium">내용:</span>
                    <div className="mt-2 p-4 bg-muted rounded-md">
                      <p className="text-sm whitespace-pre-wrap">{selectedEmail.body}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="border-t pt-4 flex justify-end">
              <Button onClick={() => setCreateEmail(selectedEmail)}>
                <CalendarPlus className="mr-2 h-4 w-4" />
                일정 추가
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <EventCreateDialog
          email={createEmail}
          onSave={handleCreateSave}
          onCancel={() => setCreateEmail(null)}
        />
      </main>
    </div>
  );
}
