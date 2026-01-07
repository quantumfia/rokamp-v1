import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
}

const modules = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
};

const formats = [
  'header',
  'bold',
  'italic',
  'underline',
  'list',
  'bullet',
  'link',
];

export function RichTextEditor({
  value,
  onChange,
  onBlur,
  placeholder = '내용을 입력하세요',
  className,
  error,
}: RichTextEditorProps) {
  return (
    <div
      className={cn(
        'rich-text-editor rounded-md overflow-hidden',
        error && 'ring-1 ring-destructive',
        className
      )}
    >
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
      />
    </div>
  );
}
