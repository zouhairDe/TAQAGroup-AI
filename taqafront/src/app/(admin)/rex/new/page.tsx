"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import { rexService } from "@/lib/services/rex-service";
import { EquipmentAutocomplete } from "@/components/ui/equipment-autocomplete";
import { Equipment } from "@/types/database-types";
import { 
  ArrowLeft,
  Save,
  CheckCircle,
  FileText,
  AlertTriangle,
  Lightbulb,
  Shield,
  Plus,
  X,
  Upload,
  Tag,
  Building,
  MapPin,
  User,
  Calendar,
  Wrench,
  Zap,
  Target,
  BarChart3,
  Star,
  TrendingUp,
  Clock,
  DollarSign,
  Timer,
  Mic,
  BookOpen,
  Info,
  Eye,
  Download,
  Image,
  Video,
  Settings,
  Paperclip,
  Trash2,
  HelpCircle
} from "lucide-react";

// Options for dropdowns
const equipmentTypeOptions = [
  { value: "", label: "Sélectionner un type" },
  { value: "mechanical", label: "Mécanique" },
  { value: "electrical", label: "Électrique" },
  { value: "hydraulic", label: "Hydraulique" },
  { value: "instrumentation", label: "Instrumentation" },
  { value: "thermal", label: "Thermique" },
  { value: "control", label: "Contrôle" }
];

const categoryOptions = [
  { value: "", label: "Sélectionner une catégorie" },
  { value: "maintenance_preventive", label: "Maintenance Préventive" },
  { value: "maintenance_corrective", label: "Maintenance Corrective" },
  { value: "amelioration_continue", label: "Amélioration Continue" },
  { value: "innovation", label: "Innovation" },
  { value: "optimisation", label: "Optimisation" },
  { value: "securite", label: "Sécurité" }
];

const knowledgeValueOptions = [
  { value: "", label: "Évaluer la valeur" },
  { value: "low", label: "Valeur faible" },
  { value: "medium", label: "Valeur moyenne" },
  { value: "medium", label: "Valeur normale" }
];

const priorityOptions = [
  { value: "", label: "Sélectionner la priorité" },
  { value: "low", label: "Faible" },
  { value: "medium", label: "Moyenne" },
  { value: "medium", label: "Normale" },
  { value: "critical", label: "Critique" }
];

const siteOptions = [
  { value: "", label: "Sélectionner un site" },
  { value: "noor_ouarzazate", label: "Noor Ouarzazate" },
  { value: "noor_midelt", label: "Noor Midelt" },
  { value: "noor_atlas", label: "Noor Atlas" }
];

export default function NewREXPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    anomalyId: "",
    equipmentId: "",
    equipmentType: "",
    category: "",
    priority: "medium",
    knowledgeValue: "medium",
    rootCause: "",
    solution: "",
    lessonsLearned: "",
    timeToResolve: "",
    costImpact: "",
    downtimeHours: "",
    problemDescription: "",
    effectiveness: "",
    site: "",
    zone: "",
    equipment: "",
    safetyImpact: false,
    environmentalImpact: false,
    productionImpact: false,
    preventiveActions: [""],
    attachments: [] as Array<{ name: string; size: string; type: string }>,
    tags: [] as string[]
  });
  const [preventiveActions, setPreventiveActions] = useState<string[]>([""]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [currentTag, setCurrentTag] = useState("");
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  // Form validation function
  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.title.trim()) errors.push("Le titre est requis");
    if (!formData.category.trim()) errors.push("La catégorie est requise");
    if (!formData.site.trim()) errors.push("Le site est requis");
    if (!formData.zone.trim()) errors.push("La zone est requise");
    if (!formData.priority.trim()) errors.push("La priorité est requise");
    if (!formData.problemDescription.trim()) errors.push("La description du problème est requise");
    if (!formData.rootCause.trim()) errors.push("La cause racine est requise");
    if (!formData.lessonsLearned.trim()) errors.push("Les leçons apprises sont requises");
    if (!formData.solution.trim()) errors.push("La solution est requise");
    if (!formData.knowledgeValue.trim()) errors.push("La valeur de connaissance est requise");
    if (!formData.equipmentType.trim()) errors.push("Le type d'équipement est requis");
    if (!formData.effectiveness.trim()) errors.push("L'efficacité est requise");
    
    if (errors.length > 0) {
      setError(`Veuillez remplir les champs requis: ${errors.join(", ")}`);
      return false;
    }
    
    return true;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreventiveActionChange = (index: number, value: string) => {
    const updated = [...preventiveActions];
    updated[index] = value;
    setPreventiveActions(updated);
  };

  const addPreventiveAction = () => {
    setPreventiveActions([...preventiveActions, ""]);
  };

  const removePreventiveAction = (index: number) => {
    if (preventiveActions.length > 1) {
      setPreventiveActions(preventiveActions.filter((_, i) => i !== index));
    }
  };

  const addTag = () => {
    if (customTag.trim() && !formData.tags.includes(customTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, customTag.trim()]
      }));
      setCustomTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    // Validate form before submission
    const isValid = validateForm();
    if (!isValid) {
      setLoading(false);
      return;
    }

    try {
      // Prepare the data according to the backend schema
      const rexData = {
        title: formData.title,
        anomalyId: formData.anomalyId || undefined,
        equipmentId: formData.equipmentId || undefined,
        equipmentType: formData.equipmentType || undefined,
        category: formData.category,
        subcategory: undefined,
        site: formData.site,
        zone: formData.zone || undefined,
        building: undefined, // Building is not in the new formData state, so it's not included
        status: 'draft',
        priority: formData.priority,
        rootCause: formData.rootCause,
        lessonsLearned: formData.lessonsLearned,
        preventiveActions: preventiveActions.filter(action => action.trim()),
        solution: formData.solution,
        timeToResolve: formData.timeToResolve || undefined,
        costImpact: formData.costImpact || undefined,
        downtimeHours: formData.downtimeHours ? parseFloat(formData.downtimeHours) : undefined,
        safetyImpact: formData.safetyImpact,
        environmentalImpact: formData.environmentalImpact,
        productionImpact: formData.productionImpact,
        impactLevel: undefined,
        tags: formData.tags,
        knowledgeValue: formData.knowledgeValue,
        effectiveness: undefined,
        summary: undefined,
        equipment: formData.equipment || undefined
      };      // Call the REX service to create the entry
      const result = await rexService.createRexEntry(rexData);
      
      // TODO: Handle file uploads if attachments exist
      if (attachments.length > 0) {
        console.log('File uploads not yet implemented:', attachments);
      }
      
      // Redirect to REX list page
      router.push('/rex');
    } catch (err) {
      console.error('Error creating REX:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la création du REX');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    setError(null);

    // Validate form before saving draft
    const isValid = validateForm();
    if (!isValid) {
      setLoading(false);
      return;
    }

    try {
      // Similar to handleSubmit but with status: 'draft'
      const rexData = {
        title: formData.title,
        anomalyId: formData.anomalyId || undefined,
        equipmentId: formData.equipmentId || undefined,
        equipmentType: formData.equipmentType || undefined,
        category: formData.category,
        subcategory: undefined,
        site: formData.site,
        zone: formData.zone || undefined,
        building: undefined, // Building is not in the new formData state, so it's not included
        status: 'draft',
        priority: formData.priority,
        rootCause: formData.rootCause,
        lessonsLearned: formData.lessonsLearned,
        preventiveActions: preventiveActions.filter(action => action.trim()),
        solution: formData.solution,
        timeToResolve: formData.timeToResolve || undefined,
        costImpact: formData.costImpact || undefined,
        downtimeHours: formData.downtimeHours ? parseFloat(formData.downtimeHours) : undefined,
        safetyImpact: formData.safetyImpact,
        environmentalImpact: formData.environmentalImpact,
        productionImpact: formData.productionImpact,
        impactLevel: undefined,
        tags: formData.tags,
        knowledgeValue: formData.knowledgeValue,
        effectiveness: undefined,
        summary: undefined,
        equipment: formData.equipment || undefined
      };      const response = await rexService.createRexEntry(rexData);
      
      // Show success message and redirect
      router.push('/rex');
    } catch (err) {
      console.error('Error saving REX draft:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la sauvegarde du brouillon');
    } finally {
      setLoading(false);
    }
  };

  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case "mechanical": return <Wrench className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
      case "electrical": return <Zap className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
      case "hydraulic": return <Target className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
      case "instrumentation": return <BarChart3 className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
      default: return <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              Nouveau Retour d&apos;Expérience
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Créer un nouveau REX pour capitaliser les connaissances
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            startIcon={<Save className="h-4 w-4" />}
          >
            Sauvegarder
          </Button>
          <Button
            onClick={handleSubmit}
            startIcon={<CheckCircle className="h-4 w-4" />}
          >
            Publier REX
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="error" title="Erreur" message={error} />
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left Column - Main Form */}
        <div className="xl:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 shadow-theme-xs">
                  <FileText className="h-5 w-5" />
                </div>
                <CardTitle>Informations de Base</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title">Titre du REX <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Titre descriptif du retour d'expérience"
                />
              </div>

              {/* Equipment Selection */}
              <EquipmentAutocomplete
                value={selectedEquipment?.name || ""}
                onChange={(value, equipment) => {
                  if (equipment) {
                    setSelectedEquipment(equipment);
                    setFormData({...formData, equipmentId: equipment.id, equipmentType: equipment.type});
                  } else {
                    setFormData({...formData, equipmentId: value});
                  }
                }}
                onEquipmentSelect={(equipment) => {
                  setSelectedEquipment(equipment);
                  setFormData({...formData, equipmentId: equipment.id, equipmentType: equipment.type});
                }}
                label="Équipement"
                placeholder="Rechercher un équipement..."
                showIdField={true}
                selectedEquipmentId={formData.equipmentId}
                onEquipmentIdChange={(id) => {
                  setFormData({...formData, equipmentId: id});
                }}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="category">Catégorie <span className="text-red-500">*</span></Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="operation">Opération</SelectItem>
                      <SelectItem value="safety">Sécurité</SelectItem>
                      <SelectItem value="environment">Environnement</SelectItem>
                      <SelectItem value="quality">Qualité</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="equipmentType">Type d'équipement</Label>
                  <Select value={formData.equipmentType} onValueChange={(value) => setFormData({...formData, equipmentType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mechanical">Mécanique</SelectItem>
                      <SelectItem value="electrical">Électrique</SelectItem>
                      <SelectItem value="hydraulic">Hydraulique</SelectItem>
                      <SelectItem value="instrumentation">Instrumentation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="site">Site <span className="text-red-500">*</span></Label>
                  <Input
                    id="site"
                    value={formData.site}
                    onChange={(e) => setFormData({...formData, site: e.target.value})}
                    placeholder="Nom du site"
                  />
                </div>

                <div>
                  <Label htmlFor="zone">Zone</Label>
                  <Input
                    id="zone"
                    value={formData.zone}
                    onChange={(e) => setFormData({...formData, zone: e.target.value})}
                    placeholder="Zone spécifique"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analysis */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 shadow-theme-xs">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <CardTitle>Analyse</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="rootCause">Cause Racine <span className="text-red-500">*</span></Label>
                <Textarea
                  id="rootCause"
                  value={formData.rootCause}
                  onChange={(e) => setFormData({...formData, rootCause: e.target.value})}
                  placeholder="Description détaillée de la cause racine"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="lessonsLearned">Leçons Apprises <span className="text-red-500">*</span></Label>
                <Textarea
                  id="lessonsLearned"
                  value={formData.lessonsLearned}
                  onChange={(e) => setFormData({...formData, lessonsLearned: e.target.value})}
                  placeholder="Leçons tirées de cette expérience"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Solution */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 shadow-theme-xs">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <CardTitle>Solution</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="solution">Solution Appliquée <span className="text-red-500">*</span></Label>
                <Textarea
                  id="solution"
                  value={formData.solution}
                  onChange={(e) => setFormData({...formData, solution: e.target.value})}
                  placeholder="Description détaillée de la solution mise en place"
                  rows={4}
                />
              </div>

              <div>
                <Label>Actions Préventives</Label>
                <div className="space-y-3">
                  {preventiveActions.map((action, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={action}
                        onChange={(e) => {
                          const newActions = [...preventiveActions];
                          newActions[index] = e.target.value;
                          setPreventiveActions(newActions);
                        }}
                        placeholder={`Action préventive ${index + 1}`}
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          const newActions = preventiveActions.filter((_, i) => i !== index);
                          setPreventiveActions(newActions);
                        }}
                        className="shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => setPreventiveActions([...preventiveActions, ""])}
                    startIcon={<Plus className="h-4 w-4" />}
                  >
                    Ajouter une action
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Additional Information */}
        <div className="space-y-6">
          {/* Impact */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 shadow-theme-xs">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <CardTitle>Impact</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="timeToResolve">Temps de Résolution</Label>
                <Input
                  id="timeToResolve"
                  value={formData.timeToResolve}
                  onChange={(e) => setFormData({...formData, timeToResolve: e.target.value})}
                  placeholder="Ex: 2h 30m"
                />
              </div>

              <div>
                <Label htmlFor="costImpact">Impact Financier</Label>
                <Input
                  id="costImpact"
                  value={formData.costImpact}
                  onChange={(e) => setFormData({...formData, costImpact: e.target.value})}
                  placeholder="Ex: 1000 MAD"
                />
              </div>

              <div>
                <Label htmlFor="downtimeHours">Temps d'Arrêt (heures)</Label>
                <Input
                  id="downtimeHours"
                  type="number"
                  value={formData.downtimeHours}
                  onChange={(e) => setFormData({...formData, downtimeHours: e.target.value})}
                  placeholder="Ex: 4"
                />
              </div>

              <div className="space-y-2">
                <Label>Type d'Impact</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="safetyImpact"
                      checked={formData.safetyImpact}
                      onChange={(e) => setFormData({...formData, safetyImpact: e.target.checked})}
                      className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <Label htmlFor="safetyImpact" className="cursor-pointer">Impact sur la sécurité</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="environmentalImpact"
                      checked={formData.environmentalImpact}
                      onChange={(e) => setFormData({...formData, environmentalImpact: e.target.checked})}
                      className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <Label htmlFor="environmentalImpact" className="cursor-pointer">Impact environnemental</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="productionImpact"
                      checked={formData.productionImpact}
                      onChange={(e) => setFormData({...formData, productionImpact: e.target.checked})}
                      className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <Label htmlFor="productionImpact" className="cursor-pointer">Impact sur la production</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 shadow-theme-xs">
                  <Paperclip className="h-5 w-5" />
                </div>
                <CardTitle>Pièces Jointes</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div
                  className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-600 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Cliquez pour ajouter des fichiers
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    PDF, Images, ou Documents (max 10MB)
                  </p>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </div>

                {attachments.length > 0 && (
                  <div className="space-y-2">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                        </div>
                        <button
                          onClick={() => {
                            const newFiles = attachments.filter((_, i) => i !== index);
                            setAttachments(newFiles);
                          }}
                          className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}