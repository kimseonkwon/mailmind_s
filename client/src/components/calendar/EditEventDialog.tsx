import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CalendarEvent } from "@shared/schema";

type EditEventDialogProps = {
  event: CalendarEvent | null;
  onSave: (event: CalendarEvent) => void;
  onDelete: (event: CalendarEvent) => void;
  onCancel: () => void;
};

function toInputValue(value?: string | null) {
  if (!value) return "";
  if (value.includes("T")) return value.slice(0, 16);
  if (value.includes(" ")) return value.replace(" ", "T").slice(0, 16);
  return `${value}T00:00`;
}

function toEventValue(value: string) {
  return value ? value.replace("T", " ") : "";
}

export default function EditEventDialog({
  event,
  onSave,
  onDelete,
  onCancel,
}: EditEventDialogProps) {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");

  const isOpen = Boolean(event);

  useEffect(() => {
    setTitle(event?.title ?? "");
    setStartDate(toInputValue(event?.startDate ?? ""));
    setEndDate(toInputValue(event?.endDate ?? ""));
    setDescription(event?.description ?? "");
  }, [event]);

  const canSave = useMemo(() => title.trim().length > 0, [title]);

  const handleSave = () => {
    if (!event) return;
    onSave({
      ...event,
      title: title.trim(),
      startDate: toEventValue(startDate),
      endDate: toEventValue(endDate),
      description: description.trim(),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>일정 수정</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-event-title">일정 제목</Label>
            <Input
              id="edit-event-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="일정 제목을 입력하세요"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-event-start">시작 날짜/시간</Label>
            <Input
              id="edit-event-start"
              type="datetime-local"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-event-end">종료 날짜/시간</Label>
            <Input
              id="edit-event-end"
              type="datetime-local"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-event-description">메모</Label>
            <Textarea
              id="edit-event-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="메모를 입력하세요"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={!event}>
                삭제
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>일정을 삭제할까요?</AlertDialogTitle>
                <AlertDialogDescription>
                  삭제한 일정은 복구할 수 없습니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction onClick={() => event && onDelete(event)}>
                  삭제
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="outline" onClick={onCancel}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            저장
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
