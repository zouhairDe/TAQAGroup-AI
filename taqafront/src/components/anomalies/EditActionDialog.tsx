import { useState } from 'react';
import { AnomalyAction } from '@/types/database-types';
import { AnomalyService } from '@/lib/services/anomaly-service';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';

interface EditActionDialogProps {
  action: AnomalyAction | null;
  onClose: () => void;
  onSave: () => void;
}

export function EditActionDialog({ action, onClose, onSave }: EditActionDialogProps) {
  const [formData, setFormData] = useState<Partial<AnomalyAction>>(
    action ? {
      title: action.title,
      description: action.description,
      category: action.category,
      status: action.status,
      priority: action.priority,
      severity: action.severity,
    } : {}
  );

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!action) return;

    try {
      setLoading(true);
      await AnomalyService.updateAnomalyAction(action.anomalyId, action.id, formData);
      toast({
        title: "Succès",
        description: "L'action a été mise à jour avec succès",
      });
      onSave();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'action",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!action) return null;

  return (
    <Dialog open={!!action} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier l'action</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Titre</label>
            <Input
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Catégorie</label>
            <Input
              value={formData.category || ''}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Statut</label>
              <Input
                value={formData.status || ''}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Priorité</label>
              <Input
                value={formData.priority || ''}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sévérité</label>
              <Input
                value={formData.severity || ''}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 