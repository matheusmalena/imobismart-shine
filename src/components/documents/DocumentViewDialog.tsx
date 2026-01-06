import { useState, useEffect } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { PropertyDocument } from '@/types/property';

interface DocumentViewDialogProps {
  document: PropertyDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: (document: PropertyDocument) => void;
  getSignedUrl: (document: PropertyDocument) => Promise<string | null>;
}

export function DocumentViewDialog({
  document,
  open,
  onOpenChange,
  onDownload,
  getSignedUrl,
}: DocumentViewDialogProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && document) {
      setLoading(true);
      setSignedUrl(null);
      getSignedUrl(document).then((url) => {
        setSignedUrl(url);
        setLoading(false);
      });
    }
  }, [open, document, getSignedUrl]);

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
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : signedUrl ? (
            isImage ? (
              <img
                src={signedUrl}
                alt={document.name}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
            ) : isPdf ? (
              <iframe
                src={signedUrl}
                className="w-full h-[70vh]"
                title={document.name}
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <p>Visualização não disponível para este tipo de arquivo.</p>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <p>Não foi possível carregar o documento.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
