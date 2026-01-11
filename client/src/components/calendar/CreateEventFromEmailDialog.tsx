import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Email } from "@shared/schema";

type CreateEventPayload = {
  title: string;
  startDate: string;
  endDate: string;
  description: string;
  emailId: number;
};

type CreateEventFromEmailDialogProps = {
  email: Email | null;
  onSave: (payload: CreateEventPayload) => void;
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

export default function CreateEventFromEmailDialog({
  email,
  onSave,
  onCancel,
}: CreateEventFromEmailDialogProps) {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");

  const isOpen = Boolean(email);

  useEffect(() => {
    setTitle(email?.subject ?? "");
    setStartDate(toInputValue(email?.date ?? ""));
    setEndDate("");
    setDescription("");
  }, [email]);

  const canSave = useMemo(() => title.trim().length > 0, [title]);

  const handleSave = () => {
    if (!email) return;
    onSave({
      title: title.trim(),
      startDate: toEventValue(startDate),
      endDate: toEventValue(endDate),
      description: description.trim(),
      emailId: email.id,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>일정 추가</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="create-event-title">일정 제목</Label>
            <Input
              id="create-event-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="일정 제목을 입력하세요"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="create-event-start">시작 날짜/시간</Label>
            <Input
              id="create-event-start"
              type="datetime-local"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="create-event-end">종료 날짜/시간</Label>
            <Input
              id="create-event-end"
              type="datetime-local"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="create-event-description">메모</Label>
            <Textarea
              id="create-event-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="메모를 입력하세요"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
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
