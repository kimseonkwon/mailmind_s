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

type EventCreatePayload = {
  emailId: number;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
};

type EventCreateDialogProps = {
  email: Email | null;
  onSave: (payload: EventCreatePayload) => void;
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

export default function EventCreateDialog({
  email,
  onSave,
  onCancel,
}: EventCreateDialogProps) {
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
      emailId: email.id,
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
          <DialogTitle>일정 추가</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="event-create-title">제목</Label>
            <Input
              id="event-create-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="일정 제목을 입력하세요"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="event-create-start">시작 날짜/시간</Label>
            <Input
              id="event-create-start"
              type="datetime-local"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="event-create-end">종료 날짜/시간</Label>
            <Input
              id="event-create-end"
              type="datetime-local"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="event-create-description">메모</Label>
            <Textarea
              id="event-create-description"
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
