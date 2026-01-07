import { useState, useEffect } from "react";
import { Settings, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/common";
import {
  StarterQuestion,
  ICON_MAP,
  ICON_OPTIONS,
  COLOR_OPTIONS,
} from "@/data/starterQuestions";
import { toast } from "sonner";

interface StarterQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: StarterQuestion[];
  onSave: (questions: StarterQuestion[]) => void;
}

export function StarterQuestionsModal({
  isOpen,
  onClose,
  questions,
  onSave,
}: StarterQuestionsModalProps) {
  const [localQuestions, setLocalQuestions] = useState<StarterQuestion[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ text: "", icon: "", color: "" });

  useEffect(() => {
    if (isOpen) {
      setLocalQuestions([...questions]);
      setEditingId(null);
    }
  }, [isOpen, questions]);

  const handleEdit = (question: StarterQuestion) => {
    setEditingId(question.id);
    setEditForm({
      text: question.text,
      icon: question.icon,
      color: question.color,
    });
  };

  const handleSaveEdit = () => {
    if (!editForm.text.trim()) {
      toast.error("질문 내용을 입력해주세요");
      return;
    }

    setLocalQuestions((prev) =>
      prev.map((q) =>
        q.id === editingId
          ? { ...q, text: editForm.text, icon: editForm.icon, color: editForm.color }
          : q
      )
    );
    setEditingId(null);
    setEditForm({ text: "", icon: "", color: "" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ text: "", icon: "", color: "" });
  };

  const handleDelete = (id: string) => {
    setLocalQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleSave = () => {
    onSave(localQuestions);
    toast.success("스타터 질문이 저장되었습니다");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            스타터 질문 관리
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-3 max-h-[400px] overflow-y-auto">
          {localQuestions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              등록된 스타터 질문이 없습니다.
            </div>
          ) : (
            localQuestions.map((question) => {
              const IconComponent = ICON_MAP[question.icon];
              const isEditing = editingId === question.id;

              if (isEditing) {
                return (
                  <div
                    key={question.id}
                    className="p-4 border border-primary/30 rounded-lg bg-muted/30 space-y-3"
                  >
                    <FormField label="질문 내용" required>
                      <Input
                        value={editForm.text}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, text: e.target.value }))
                        }
                        placeholder="질문 내용을 입력하세요"
                      />
                    </FormField>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="아이콘">
                        <Select
                          value={editForm.icon}
                          onValueChange={(value) =>
                            setEditForm((prev) => ({ ...prev, icon: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ICON_OPTIONS.map((option) => {
                              const IconComp = ICON_MAP[option.id];
                              return (
                                <SelectItem key={option.id} value={option.id}>
                                  <div className="flex items-center gap-2">
                                    {IconComp && <IconComp className="w-4 h-4" />}
                                    <span>{option.label}</span>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </FormField>
                      <FormField label="색상">
                        <Select
                          value={editForm.color}
                          onValueChange={(value) =>
                            setEditForm((prev) => ({ ...prev, color: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {COLOR_OPTIONS.map((option) => (
                              <SelectItem key={option.id} value={option.value}>
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-3 h-3 rounded-full ${option.value.replace(
                                      "text-",
                                      "bg-"
                                    )}`}
                                  />
                                  <span>{option.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormField>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                        취소
                      </Button>
                      <Button size="sm" onClick={handleSaveEdit}>
                        확인
                      </Button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={question.id}
                  className="flex items-center gap-3 p-3 border border-border rounded-lg bg-muted/20"
                >
                  <div className={question.color}>
                    {IconComponent && <IconComponent className="w-5 h-5" />}
                  </div>
                  <span className="flex-1 text-sm">{question.text}</span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(question)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(question.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSave}>저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
