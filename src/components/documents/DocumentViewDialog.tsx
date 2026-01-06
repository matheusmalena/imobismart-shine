import { X, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { PropertyDocument } from '@/types/property';

interface DocumentViewDialogProps {
  document: PropertyDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: (document: PropertyDocument) => void;
}

export function DocumentViewDialog({
  document,
  open,
  onOpenChange,
  onDownload,
}: DocumentViewDialogProps) {
  if (!document) return null;

  const isImage = document.file_type?.startsWith('image/');
  const isPdf = document.file_type === 'application/pdf';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="truncate pr-4">{document.name}</DialogTitle>
          <Button variant="outline" size="sm" onClick={() => onDownload(document)}>
            <Download className="h-4 w-4 mr-2" />
            Baixar
          </Button>
        </DialogHeader>
        <div className="flex-1 overflow-auto min-h-0">
          {isImage ? (
            <img
              src={document.file_url}
              alt={document.name}
              className="w-full h-auto max-h-[70vh] object-contain"
            />
          ) : isPdf ? (
            <iframe
              src={document.file_url}
              className="w-full h-[70vh]"
              title={document.name}
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <p>Visualização não disponível para este tipo de arquivo.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
