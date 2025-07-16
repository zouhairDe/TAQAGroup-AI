"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import { rexService } from "@/lib/services/rex-service";
import type { CreateRexEntryInput } from "@/lib/services/rex-service";
import {
  ArrowLeft,
  Save,
  Plus,
  X,
  Upload,
  Tag,
  Trash2,
} from "lucide-react";

interface FormData {
  title: string;
  anomalyId: string;
  equipmentId: string;
  equipmentType: string;
  priority: string;
  rootCause: string;
  lessonsLearned: string;
  preventiveActions: string[];
  solution: string;
  timeToResolve: string;
  costImpact: string;
  downtimeHours: string;
  safetyImpact: boolean;
  environmentalImpact: boolean;
  productionImpact: boolean;
  impactLevel: string;
  knowledgeValue: string;
  category: string;
  site: string;
  zone: string;
}

const knowledgeValueOptions = [
  { value: "medium", label: "Normale" },
  { value: "medium", label: "Moyenne" },
  { value: "low", label: "Faible" },
];

const impactLevelOptions = [
  { value: "medium", label: "Normal" },
  { value: "medium", label: "Moyen" },
  { value: "low", label: "Faible" },
];

export default function CreateRexFromAnomaly() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    title: searchParams.get("title") || "",
    anomalyId: searchParams.get("anomalyId") || "",
    equipmentId: searchParams.get("equipmentId") || "",
    equipmentType: searchParams.get("equipmentType") || "",
    priority: searchParams.get("priority") || "medium",
    rootCause: "",
    lessonsLearned: "",
    preventiveActions: [],
    solution: "",
    timeToResolve: "",
    costImpact: "",
    downtimeHours: "",
    safetyImpact: searchParams.get("safetyImpact") === "true",
    environmentalImpact: searchParams.get("environmentalImpact") === "true",
    productionImpact: searchParams.get("productionImpact") === "true",
    impactLevel: "medium",
    knowledgeValue: "medium",
    category: "technical",
    site: searchParams.get("site") || "site1",
    zone: searchParams.get("zone") || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const rexData: CreateRexEntryInput = {
        ...formData,
        tags,
        status: "approved",
        preventiveActions: formData.preventiveActions,
        downtimeHours: formData.downtimeHours ? parseFloat(formData.downtimeHours) : undefined,
      };

      // Create multipart form data for file upload
      const formDataWithFiles = new FormData();
      
      // Add all fields from rexData
      Object.entries(rexData).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            formDataWithFiles.append(key, JSON.stringify(value));
          } else {
            formDataWithFiles.append(key, String(value));
          }
        }
      });

      // Add files
      attachments.forEach((file) => {
        formDataWithFiles.append("attachments", file);
      });

      await rexService.createRexEntry(rexData);
      router.push("/rex");
    } catch (err) {
      console.error("Error creating REX:", err);
      setError("Une erreur est survenue lors de la création du REX");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Créer un REX à partir de l'anomalie</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6">
              <Alert
                variant="error"
                title="Erreur"
                message={error}
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Basic Information */}
              <div className="space-y-4">
                {/* Read-only Fields */}
                <div>
                  <Label htmlFor="anomalyId">ID de l'anomalie</Label>
                  <Input
                    id="anomalyId"
                    value={formData.anomalyId}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>

                <div>
                  <Label htmlFor="equipmentId">ID de l'équipement</Label>
                  <Input
                    id="equipmentId"
                    value={formData.equipmentId}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>

                <div>
                  <Label htmlFor="equipmentType">Type d'équipement</Label>
                  <Input
                    id="equipmentType"
                    value={formData.equipmentType}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>

                <div>
                  <Label htmlFor="title">Titre</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Ex: Résolution de l'anomalie de tension instable"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="rootCause">Cause racine</Label>
                  <Textarea
                    id="rootCause"
                    value={formData.rootCause}
                    onChange={(e) => handleInputChange("rootCause", e.target.value)}
                    placeholder="Ex: Défaillance du régulateur de tension due à une surcharge prolongée"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="lessonsLearned">Leçons apprises</Label>
                  <Textarea
                    id="lessonsLearned"
                    value={formData.lessonsLearned}
                    onChange={(e) => handleInputChange("lessonsLearned", e.target.value)}
                    placeholder="Ex: Nécessité d'implémenter une surveillance continue des niveaux de tension"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="solution">Solution</Label>
                  <Textarea
                    id="solution"
                    value={formData.solution}
                    onChange={(e) => handleInputChange("solution", e.target.value)}
                    placeholder="Ex: Remplacement du régulateur et mise en place d'un système de monitoring"
                    required
                  />
                </div>
              </div>

              {/* Right Column - Impact and Additional Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="timeToResolve">Temps de résolution</Label>
                  <Input
                    id="timeToResolve"
                    value={formData.timeToResolve}
                    onChange={(e) => handleInputChange("timeToResolve", e.target.value)}
                    placeholder="Ex: 2 heures"
                  />
                </div>

                <div>
                  <Label htmlFor="costImpact">Impact financier</Label>
                  <Input
                    id="costImpact"
                    value={formData.costImpact}
                    onChange={(e) => handleInputChange("costImpact", e.target.value)}
                    placeholder="Ex: 5000 DH"
                  />
                </div>

                <div>
                  <Label htmlFor="downtimeHours">Heures d'arrêt</Label>
                  <Input
                    id="downtimeHours"
                    type="number"
                    value={formData.downtimeHours}
                    onChange={(e) => handleInputChange("downtimeHours", e.target.value)}
                    placeholder="Ex: 4"
                  />
                </div>

                <div>
                  <Label htmlFor="impactLevel">Niveau d'impact</Label>
                  <select
                    id="impactLevel"
                    value={formData.impactLevel}
                    onChange={(e) => handleInputChange("impactLevel", e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    {impactLevelOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="knowledgeValue">Valeur de la connaissance</Label>
                  <select
                    id="knowledgeValue"
                    value={formData.knowledgeValue}
                    onChange={(e) => handleInputChange("knowledgeValue", e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    {knowledgeValueOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Impact Flags */}
                <div className="space-y-2">
                  <Label>Impacts</Label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.safetyImpact}
                        onChange={(e) => handleInputChange("safetyImpact", e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span>Impact sur la sécurité</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.environmentalImpact}
                        onChange={(e) => handleInputChange("environmentalImpact", e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span>Impact environnemental</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.productionImpact}
                        onChange={(e) => handleInputChange("productionImpact", e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span>Impact sur la production</span>
                    </label>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <Label>Tags</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Ex: électrique, maintenance, urgent"
                    />
                    <Button
                      type="button"
                      onClick={handleAddTag}
                      variant="outline"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* File Attachments */}
                <div>
                  <Label>Pièces jointes</Label>
                  <div className="flex items-center gap-2 mb-2">
                    <Input
                      type="file"
                      onChange={handleFileChange}
                      multiple
                      className="hidden"
                      id="file-upload"
                    />
                    <Label
                      htmlFor="file-upload"
                      className="cursor-pointer flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Ajouter des fichiers
                    </Label>
                  </div>
                  <div className="space-y-2">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded"
                      >
                        <span className="text-sm truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? "Création en cours..." : "Créer le REX"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 