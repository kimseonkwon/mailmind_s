import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, CalendarPlus } from "lucide-react";
import type { Email } from "@shared/schema";

type UnextractedEmailListProps = {
  emails: Email[];
  onCreateEvent: (email: Email) => void;
};

export default function UnextractedEmailList({
  emails,
  onCreateEvent,
}: UnextractedEmailListProps) {
  if (emails.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          일정이 추출되지 않은 이메일이 없습니다.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {emails.map((email) => (
        <Card key={email.id}>
          <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{email.subject}</span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                <span>{email.sender}</span>
                <span className="mx-2">•</span>
                <span>{email.date}</span>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => onCreateEvent(email)}
              className="self-start md:self-auto"
            >
              <CalendarPlus className="mr-2 h-4 w-4" />
              일정 추가
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
