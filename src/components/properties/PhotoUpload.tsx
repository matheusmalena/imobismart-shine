import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Camera, Loader2, Trash2, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageCropDialog } from './ImageCropDialog';

interface PhotoUploadProps {
  currentPhotoUrl?: string | null;
  previewUrl?: string | null;
  onPhotoChange: (url: string | null) => void;
  onFileSelect: (file: File) => void;
  onPreviewChange?: (url: string | null) => void;
  isUploading?: boolean;
  className?: string;
}

export function PhotoUpload({ 
  currentPhotoUrl, 
  previewUrl: externalPreviewUrl,
  onPhotoChange, 
  onFileSelect,
  onPreviewChange,
  isUploading,
  className 
}: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create data URL for crop dialog
    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
      setCropDialogOpen(true);
    };
    reader.readAsDataURL(file);
    
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    // Create preview URL from cropped blob
    const croppedUrl = URL.createObjectURL(croppedBlob);
    onPreviewChange?.(croppedUrl);
    
    // Convert blob to file and send to parent
    const file = new File([croppedBlob], 'cropped-image.jpg', { type: 'image/jpeg' });
    onFileSelect(file);
    
    setImageToCrop(null);
  };

  const handleRemove = () => {
    onPreviewChange?.(null);
    onPhotoChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayUrl = externalPreviewUrl || currentPhotoUrl;

  return (
    <div className={cn("space-y-3", className)}>
      <Label>Foto do Imóvel</Label>
      <div className="relative">
        <div className={cn(
          "relative h-48 rounded-xl overflow-hidden border-2 border-dashed transition-colors",
          displayUrl ? "border-transparent" : "border-border hover:border-primary/50"
        )}>
          {displayUrl ? (
            <>
              <img 
                src={displayUrl} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity">
                <div className="absolute bottom-3 left-3 right-3 flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Camera className="h-4 w-4 mr-1" />
                    Alterar
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleRemove}
                    disabled={isUploading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {isUploading && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-foreground transition-colors bg-secondary/30 hover:bg-secondary/50"
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              ) : (
                <>
                  <div className="p-3 rounded-full bg-primary/10">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Clique para enviar</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG até 5MB</p>
                  </div>
                </>
              )}
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {imageToCrop && (
        <ImageCropDialog
          open={cropDialogOpen}
          onOpenChange={setCropDialogOpen}
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
