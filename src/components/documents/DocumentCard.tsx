import { useState, useEffect } from 'react';
import { FileText, Image, Download, Trash2, Eye, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DOCUMENT_CATEGORY_LABELS, type PropertyDocument } from '@/types/property';

interface DocumentCardProps {
  document: PropertyDocument;
  onView: (document: PropertyDocument) => void;
  onDownload: (document: PropertyDocument) => void;
  onDelete?: (document: PropertyDocument) => void;
  getThumbnailUrl?: (fileUrl: string) => Promise<string | null>;
}

export function DocumentCard({ document, onView, onDownload, onDelete, getThumbnailUrl }: DocumentCardProps) {
  const isImage = document.file_type?.startsWith('image/');
  const Icon = isImage ? Image : FileText;
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isLoadingThumbnail, setIsLoadingThumbnail] = useState(false);

  useEffect(() => {
    if (isImage && getThumbnailUrl) {
      setIsLoadingThumbnail(true);
      getThumbnailUrl(document.file_url)
        .then(url => setThumbnailUrl(url))
        .finally(() => setIsLoadingThumbnail(false));
    }
  }, [document.file_url, isImage, getThumbnailUrl]);

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Tamanho desconhecido';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Card className="group hover:shadow-md transition-all hover:border-primary/20 overflow-hidden">
      <CardContent className="p-0">
        {/* Thumbnail for images */}
        {isImage && (
          <div className="h-32 w-full bg-muted flex items-center justify-center overflow-hidden border-b border-border/50">
            {isLoadingThumbnail ? (
              <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
            ) : thumbnailUrl ? (
              <img 
                src={thumbnailUrl} 
                alt={document.name} 
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <Image className="h-10 w-10 text-muted-foreground/50" />
            )}
          </div>
        )}
        
        <div className="p-4">
          <div className="flex items-start gap-3">
            {!isImage && (
              <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
                <Icon className="h-5 w-5 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate" title={document.name}>
                {document.name}
              </h4>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {DOCUMENT_CATEGORY_LABELS[document.category]}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {formatFileSize(document.file_size)}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {formatDate(document.created_at)}
              </p>
            </div>
          </div>
          
          {/* Action buttons - always visible on mobile, hover on desktop */}
          <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/50 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" onClick={() => onView(document)} className="flex-1 h-8 text-xs gap-1">
              <Eye className="h-3.5 w-3.5" />
              Ver
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDownload(document)} className="flex-1 h-8 text-xs gap-1">
              <Download className="h-3.5 w-3.5" />
              Baixar
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(document)}
                className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
