import { useState } from "react";
import { Plus, Trash2, Edit2, Save, X, GripVertical } from "lucide-react";
import { PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  StarterQuestion,
  DEFAULT_STARTER_QUESTIONS,
  ICON_MAP,
  ICON_OPTIONS,
  COLOR_OPTIONS,
} from "@/data/starterQuestions";
import { toast } from "sonner";

export default function ChatbotStarterPage() {
  const [questions, setQuestions] = useState<StarterQuestion[]>(DEFAULT_STARTER_QUESTIONS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<StarterQuestion | null>(null);
  const [formData, setFormData] = useState({
    text: "",
    icon: "Car",
    color: "text-blue-400",
  });

  const resetForm = () => {
    setFormData({ text: "", icon: "Car", color: "text-blue-400" });
  };

  const handleAdd = () => {
    if (!formData.text.trim()) {
      toast.error("질문 내용을 입력해주세요");
      return;
    }
    const newQuestion: StarterQuestion = {
      id: Date.now().toString(),
      text: formData.text,
      icon: formData.icon,
      color: formData.color,
    };
    setQuestions([...questions, newQuestion]);
    setIsAddModalOpen(false);
    resetForm();
    toast.success("추천 질문이 추가되었습니다");
  };

  const handleEdit = () => {
    if (!editingQuestion || !formData.text.trim()) {
      toast.error("질문 내용을 입력해주세요");
      return;
    }
    setQuestions(
      questions.map((q) =>
        q.id === editingQuestion.id
          ? { ...q, text: formData.text, icon: formData.icon, color: formData.color }
          : q
      )
    );
    setEditingQuestion(null);
    resetForm();
    toast.success("추천 질문이 수정되었습니다");
  };

  const handleDelete = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
    toast.success("추천 질문이 삭제되었습니다");
  };

  const openEditModal = (question: StarterQuestion) => {
    setEditingQuestion(question);
    setFormData({
      text: question.text,
      icon: question.icon,
      color: question.color,
    });
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingQuestion(null);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="챗봇 스타터 관리"
        description="챗봇 초기 화면에 표시되는 추천 질문을 관리합니다."
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">추천 질문 목록</CardTitle>
          <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            추가
          </Button>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              등록된 추천 질문이 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((question) => {
                const IconComponent = ICON_MAP[question.icon];
                return (
                  <div
                    key={question.id}
                    className="flex items-center gap-3 p-4 border border-border rounded-lg bg-muted/20"
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                    <div className={question.color}>
                      {IconComponent && <IconComponent className="w-5 h-5" />}
                    </div>
                    <span className="flex-1 text-sm">{question.text}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditModal(question)}
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
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 미리보기 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">미리보기</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
            {questions.map((q) => {
              const IconComponent = ICON_MAP[q.icon];
              return (
                <div
                  key={q.id}
                  className="flex items-start gap-3 p-4 text-left border border-border rounded-lg bg-muted/30"
                >
                  <div className={q.color}>
                    {IconComponent && <IconComponent className="w-5 h-5" />}
                  </div>
                  <span className="text-sm text-foreground">{q.text}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 추가/수정 모달 */}
      <Dialog open={isAddModalOpen || !!editingQuestion} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? "추천 질문 수정" : "추천 질문 추가"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="question-text">질문 내용</Label>
              <Input
                id="question-text"
                placeholder="예: 동절기 차량 사고 예방 대책은?"
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>아이콘</Label>
                <Select
                  value={formData.icon}
                  onValueChange={(value) => setFormData({ ...formData, icon: value })}
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
              </div>
              <div className="space-y-2">
                <Label>색상</Label>
                <Select
                  value={formData.color}
                  onValueChange={(value) => setFormData({ ...formData, color: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLOR_OPTIONS.map((option) => (
                      <SelectItem key={option.id} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${option.value.replace('text-', 'bg-')}`} />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              취소
            </Button>
            <Button onClick={editingQuestion ? handleEdit : handleAdd}>
              {editingQuestion ? "수정" : "추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
