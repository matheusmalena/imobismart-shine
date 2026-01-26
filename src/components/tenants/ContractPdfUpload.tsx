import { useRef, useState } from 'react';
import { FileText, Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ContractPdfUploadProps {
  file: File | null;
  existingUrl: string | null;
  onFileChange: (file: File | null) => void;
  isUploading?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function ContractPdfUpload({
  file,
  existingUrl,
  onFileChange,
  isUploading = false,
}: ContractPdfUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (selectedFile: File | null) => {
    if (!selectedFile) {
      onFileChange(null);
      return;
    }

    // Validate file type
    if (selectedFile.type !== 'application/pdf') {
      toast.error('Apenas arquivos PDF são permitidos');
      return;
    }

    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error('O arquivo deve ter no máximo 10MB');
      return;
    }

    onFileChange(selectedFile);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    handleFileSelect(selectedFile);
    // Reset input to allow re-selecting same file
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0] || null;
    handleFileSelect(droppedFile);
  };

  const handleRemove = () => {
    onFileChange(null);
  };

  const displayName = file?.name || (existingUrl ? 'Contrato anexado' : null);

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        onChange={handleInputChange}
        className="hidden"
        disabled={isUploading}
      />

      {displayName ? (
        <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
          <FileText className="h-8 w-8 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{displayName}</p>
            {file && (
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            )}
            {!file && existingUrl && (
              <p className="text-xs text-muted-foreground">Documento salvo</p>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            disabled={isUploading}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer
            transition-colors hover:bg-muted/50
            ${dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
            ${isUploading ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          {isUploading ? (
            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
          ) : (
            <Upload className="h-8 w-8 text-muted-foreground" />
          )}
          <p className="mt-2 text-sm text-muted-foreground text-center">
            {isUploading ? 'Enviando...' : 'Arraste um PDF ou clique para selecionar'}
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Máximo 10MB
          </p>
        </div>
      )}
    </div>
  );
}
