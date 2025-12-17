import { useState, ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputType {
  id: string;
  label: string;
  content: ReactNode;
}

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  inputTypes: InputType[];
  onSubmit?: () => void;
  submitLabel?: string;
  isSubmitDisabled?: boolean;
}

export function AddModal({
  isOpen,
  onClose,
  title,
  description,
  inputTypes,
  onSubmit,
  submitLabel = '추가',
  isSubmitDisabled = false,
}: AddModalProps) {
  const [selectedType, setSelectedType] = useState(inputTypes[0]?.id);

  // Reset selected type when modal opens
  useEffect(() => {
    if (isOpen && inputTypes.length > 0) {
      setSelectedType(inputTypes[0].id);
    }
  }, [isOpen, inputTypes]);

  if (!isOpen) return null;

  const currentContent = inputTypes.find(t => t.id === selectedType)?.content;

  // Portal로 body에 직접 렌더링하여 z-index 문제 해결
  return createPortal(
    <>
      {/* Backdrop - 통일된 배경 처리 */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200]" 
        onClick={onClose} 
      />
      
      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-full max-w-lg max-h-[calc(100vh-4rem)]">
        <div className="bg-card border border-border rounded-lg shadow-2xl overflow-hidden flex flex-col h-[520px] max-h-[calc(100vh-4rem)]">
          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-border">
            <div>
              <h2 className="text-base font-semibold text-foreground">{title}</h2>
              {description && (
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 -m-1 hover:bg-muted rounded transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Type Selector - Radio Button Style (only if multiple types) */}
          {inputTypes.length > 1 && (
            <div className="px-5 pt-4">
              <div className="flex items-center gap-4">
                {inputTypes.map((type) => (
                  <label
                    key={type.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <div className="relative">
                      <input
                        type="radio"
                        name="inputType"
                        value={type.id}
                        checked={selectedType === type.id}
                        onChange={() => setSelectedType(type.id)}
                        className="sr-only"
                      />
                      <div className={cn(
                        'w-4 h-4 rounded-full border-2 transition-colors',
                        selectedType === type.id
                          ? 'border-primary'
                          : 'border-muted-foreground/40'
                      )}>
                        {selectedType === type.id && (
                          <div className="absolute inset-1 bg-primary rounded-full" />
                        )}
                      </div>
                    </div>
                    <span className={cn(
                      'text-sm transition-colors',
                      selectedType === type.id
                        ? 'text-foreground font-medium'
                        : 'text-muted-foreground'
                    )}>
                      {type.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Content - Fixed Height */}
          <div className="p-5 flex-1 min-h-0 overflow-y-auto">
            {currentContent}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border bg-muted/30">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium border border-border rounded-md hover:bg-muted transition-colors"
            >
              취소
            </button>
            <button
              onClick={onSubmit}
              disabled={isSubmitDisabled}
              className={cn(
                'px-4 py-2 text-xs font-medium rounded-md transition-colors',
                isSubmitDisabled
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              {submitLabel}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
