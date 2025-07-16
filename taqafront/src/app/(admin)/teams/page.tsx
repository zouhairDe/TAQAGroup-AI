"use client";

import React, { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users,
  Star,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Award,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Edit,
  Eye,
  BarChart3,
  Target,
  Wrench,
  Shield,
  Brain,
  User,
  Settings,
  Download
} from "lucide-react";

// Mock teams data
const teams = [
  {
    id: "alpha",
    name: "Équipe Alpha",
    lead: {
      name: "Hassan Alami",
      email: "h.alami@taqa.ma",
      phone: "+212 661 234 567",
      experience: "12 ans"
    },
    members: [
      { name: "Hassan Alami", role: "Chef d'équipe", skills: ["Leadership", "Mécanique", "Hydraulique"], rating: 4.9, experience: "12 ans" },
      { name: "Youssef Bennani", role: "Technicien Senior", skills: ["Mécanique", "Soudure"], rating: 4.7, experience: "8 ans" },
      { name: "Rachid Amrani", role: "Technicien", skills: ["Hydraulique", "Pneumatique"], rating: 4.5, experience: "5 ans" },
      { name: "Karim Fassi", role: "Technicien", skills: ["Mécanique", "Maintenance"], rating: 4.3, experience: "3 ans" },
      { name: "Mohamed Tazi", role: "Apprenti", skills: ["Mécanique de base"], rating: 4.0, experience: "1 an" }
    ],
    specialties: ["Turbines", "Gros équipements", "Maintenance mécanique"],
    location: "Noor Ouarzazate",
    availability: 80,
    currentTasks: 2,
    completedTasks: 45,
    rating: 4.8,
    performance: {
      efficiency: 92,
      quality: 95,
      safety: 98,
      onTime: 88
    },
    certifications: ["ISO 9001", "Sécurité industrielle", "Soudure certifiée"]
  },
  {
    id: "beta",
    name: "Équipe Beta", 
    lead: {
      name: "Fatima Zahra Benali",
      email: "f.benali@taqa.ma",
      phone: "+212 662 345 678",
      experience: "10 ans"
    },
    members: [
      { name: "Fatima Zahra Benali", role: "Chef d'équipe", skills: ["Leadership", "Électrique", "Automatisation"], rating: 4.8, experience: "10 ans" },
      { name: "Omar Kettani", role: "Technicien Senior", skills: ["Électrique", "Instrumentation"], rating: 4.6, experience: "7 ans" },
      { name: "Aicha Mansouri", role: "Technicien", skills: ["Automatisation", "PLC"], rating: 4.4, experience: "4 ans" },
      { name: "Samir Idrissi", role: "Technicien", skills: ["Électrique", "Câblage"], rating: 4.2, experience: "2 ans" }
    ],
    specialties: ["Systèmes électriques", "Contrôle-commande", "Automatisation"],
    location: "Noor Midelt",
    availability: 60,
    currentTasks: 3,
    completedTasks: 38,
    rating: 4.6,
    performance: {
      efficiency: 89,
      quality: 93,
      safety: 96,
      onTime: 85
    },
    certifications: ["Habilitation électrique", "Automatisation Siemens", "Sécurité ATEX"]
  },
  {
    id: "gamma",
    name: "Équipe Gamma",
    lead: {
      name: "Omar Benali",
      email: "o.benali@taqa.ma", 
      phone: "+212 663 456 789",
      experience: "15 ans"
    },
    members: [
      { name: "Omar Benali", role: "Chef d'équipe", skills: ["Leadership", "Instrumentation", "Métrologie"], rating: 4.9, experience: "15 ans" },
      { name: "Nadia Alaoui", role: "Technicien Senior", skills: ["Calibration", "Métrologie"], rating: 4.8, experience: "9 ans" },
      { name: "Abdelkader Filali", role: "Technicien", skills: ["Instrumentation", "Capteurs"], rating: 4.5, experience: "6 ans" }
    ],
    specialties: ["Capteurs", "Systèmes de mesure", "Calibration"],
    location: "Noor Atlas",
    availability: 90,
    currentTasks: 1,
    completedTasks: 52,
    rating: 4.9,
    performance: {
      efficiency: 96,
      quality: 98,
      safety: 99,
      onTime: 94
    },
    certifications: ["Métrologie COFRAC", "Instrumentation avancée", "Qualité ISO 17025"]
  }
];

const skillsDatabase = [
  "Mécanique", "Électrique", "Hydraulique", "Pneumatique", "Soudure", "Instrumentation",
  "Automatisation", "PLC", "Métrologie", "Calibration", "Thermique", "Leadership",
  "Sécurité industrielle", "Maintenance préventive", "Diagnostic", "Câblage"
];

export default function TeamsPage() {
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [showTeamDetailsDialog, setShowTeamDetailsDialog] = useState(false);

  const getPerformanceColor = (score: number) => {
    if (score >= 95) return "text-green-600";
    if (score >= 85) return "text-blue-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getAvailabilityBadge = (availability: number) => {
    if (availability >= 80) return <Badge className="bg-green-100 text-green-800">Disponible</Badge>;
    if (availability >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Occupé</Badge>;
    return <Badge className="bg-red-100 text-red-800">Surchargé</Badge>;
  };

  return (
    <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-taqa-navy flex items-center gap-3">
                  <Users className="h-8 w-8 text-taqa-electric-blue" />
                  Gestion des Équipes
                </h1>
                <p className="text-gray-600 mt-2">
                  Coordination des équipes, compétences et performance
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Rapport
                </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle Équipe
                </Button>
              </div>
            </div>

            {/* Teams Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {teams.map((team) => (
                <Card key={team.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                      {getAvailabilityBadge(team.availability)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {team.location}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Team Lead */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-taqa-electric-blue rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{team.lead.name}</p>
                          <p className="text-sm text-gray-600">Chef d'équipe</p>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span>{team.members.length} membres</span>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span>{team.rating}/5</span>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <Activity className="h-4 w-4 text-blue-500" />
                            <span>{team.currentTasks} actives</span>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>{team.completedTasks} terminées</span>
                          </div>
                        </div>
                      </div>

                      {/* Specialties */}
                      <div>
                        <p className="text-sm font-medium mb-2">Spécialités:</p>
                        <div className="flex flex-wrap gap-1">
                          {team.specialties.slice(0, 2).map((specialty, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                          {team.specialties.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{team.specialties.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => {
                            setSelectedTeam(team);
                            setShowTeamDetailsDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Détails
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Modifier
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Performance Dashboard */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Tableau de Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Équipe</th>
                        <th className="text-center p-3">Efficacité</th>
                        <th className="text-center p-3">Qualité</th>
                        <th className="text-center p-3">Sécurité</th>
                        <th className="text-center p-3">Ponctualité</th>
                        <th className="text-center p-3">Note Globale</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teams.map((team) => (
                        <tr key={team.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-taqa-electric-blue rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {team.name.charAt(7)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">{team.name}</p>
                                <p className="text-sm text-gray-600">{team.location}</p>
                              </div>
                            </div>
                          </td>
                          <td className="text-center p-3">
                            <span className={`font-medium ${getPerformanceColor(team.performance.efficiency)}`}>
                              {team.performance.efficiency}%
                            </span>
                          </td>
                          <td className="text-center p-3">
                            <span className={`font-medium ${getPerformanceColor(team.performance.quality)}`}>
                              {team.performance.quality}%
                            </span>
                          </td>
                          <td className="text-center p-3">
                            <span className={`font-medium ${getPerformanceColor(team.performance.safety)}`}>
                              {team.performance.safety}%
                            </span>
                          </td>
                          <td className="text-center p-3">
                            <span className={`font-medium ${getPerformanceColor(team.performance.onTime)}`}>
                              {team.performance.onTime}%
                            </span>
                          </td>
                          <td className="text-center p-3">
                            <div className="flex items-center justify-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="font-medium">{team.rating}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Skills Matrix */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Matrice des Compétences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Membre</th>
                        <th className="text-center p-2">Mécanique</th>
                        <th className="text-center p-2">Électrique</th>
                        <th className="text-center p-2">Hydraulique</th>
                        <th className="text-center p-2">Instrumentation</th>
                        <th className="text-center p-2">Soudure</th>
                        <th className="text-center p-2">Leadership</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teams.flatMap(team => 
                        team.members.map(member => (
                          <tr key={`${team.id}-${member.name}`} className="border-b hover:bg-gray-50">
                            <td className="p-2">
                              <div>
                                <p className="font-medium">{member.name}</p>
                                <p className="text-xs text-gray-600">{team.name}</p>
                              </div>
                            </td>
                            {["Mécanique", "Électrique", "Hydraulique", "Instrumentation", "Soudure", "Leadership"].map(skill => (
                              <td key={skill} className="text-center p-2">
                                {member.skills.includes(skill) ? (
                                  <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                                ) : (
                                  <div className="w-4 h-4 mx-auto" />
                                )}
                              </td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Team Details Dialog */}
            <Dialog open={showTeamDetailsDialog} onOpenChange={setShowTeamDetailsDialog}>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>
                    {selectedTeam?.name} - Détails Complets
                  </DialogTitle>
                </DialogHeader>
                {selectedTeam && (
                  <Tabs defaultValue="members" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="members">Membres</TabsTrigger>
                      <TabsTrigger value="performance">Performance</TabsTrigger>
                      <TabsTrigger value="certifications">Certifications</TabsTrigger>
                      <TabsTrigger value="planning">Planning</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="members" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedTeam.members.map((member: any, index: number) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-taqa-electric-blue rounded-full flex items-center justify-center">
                                  <User className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <p className="font-medium">{member.name}</p>
                                  <p className="text-sm text-gray-600">{member.role}</p>
                                </div>
                                <div className="ml-auto flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-500" />
                                  <span className="text-sm">{member.rating}</span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="text-sm">
                                  <span className="text-gray-600">Expérience:</span>
                                  <span className="ml-2">{member.experience}</span>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600 mb-1">Compétences:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {member.skills.map((skill: string, skillIndex: number) => (
                                      <Badge key={skillIndex} variant="outline" className="text-xs">
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="performance" className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600 mb-1">
                              {selectedTeam.performance.efficiency}%
                            </div>
                            <div className="text-sm text-gray-600">Efficacité</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-green-600 mb-1">
                              {selectedTeam.performance.quality}%
                            </div>
                            <div className="text-sm text-gray-600">Qualité</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600 mb-1">
                              {selectedTeam.performance.safety}%
                            </div>
                            <div className="text-sm text-gray-600">Sécurité</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-orange-600 mb-1">
                              {selectedTeam.performance.onTime}%
                            </div>
                            <div className="text-sm text-gray-600">Ponctualité</div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="certifications" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedTeam.certifications.map((cert: string, index: number) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Award className="h-5 w-5 text-gold-500" />
                            <span>{cert}</span>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="planning" className="space-y-4">
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Planning détaillé disponible dans la section Planification</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                )}
              </DialogContent>
            </Dialog>
          </div>
  );
} 