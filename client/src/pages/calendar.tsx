import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock,
  FileText
} from "lucide-react";
import type { CalendarEvent } from "@shared/schema";

function EventCard({ event }: { event: CalendarEvent }) {
  return (
    <Card className="hover-elevate">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate" data-testid={`event-title-${event.id}`}>
              {event.title}
            </h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{event.startDate}</span>
                {event.endDate && <span>~ {event.endDate}</span>}
              </span>
              {event.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{event.location}</span>
                </span>
              )}
            </div>
            {event.description && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {event.description}
              </p>
            )}
          </div>
          {event.emailId && (
            <Badge variant="outline" className="shrink-0">
              <FileText className="h-3 w-3 mr-1" />
              이메일 #{event.emailId}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function CalendarPage() {
  const { data: events, isLoading } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/events"],
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary p-2">
                <CalendarIcon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">일정</h1>
                <p className="text-xs text-muted-foreground">이메일에서 추출된 일정 목록</p>
              </div>
            </div>
            {events && (
              <Badge variant="outline" className="gap-1">
                <CalendarIcon className="h-3 w-3" />
                {events.length}개 일정
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-12 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : events?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-4 mb-4">
                <CalendarIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">일정이 없습니다</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                이메일 검색 결과에서 "일정 추출" 버튼을 눌러 이메일의 일정을 추출해보세요.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4" data-testid="events-list">
            {events?.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
