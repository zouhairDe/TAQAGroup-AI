"use client";

import React, { useState } from 'react';
import { 
  HelpCircle, Search, Book, MessageCircle, Mail, Phone, 
  FileText, Video, Download, ExternalLink, ChevronDown, 
  ChevronRight, Lightbulb, Users, Settings, Shield,
  Monitor, Smartphone, Globe, Clock, CheckCircle,
  AlertTriangle, Zap, Target, BarChart3, Calendar,
  Database, Brain, TrendingUp, Eye, Filter, Plus,
  Edit, Trash2, Bell, Activity, Wrench, MapPin
} from 'lucide-react';

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('anomalies');

  const categories = [
    { id: 'anomalies', name: 'Gestion des Anomalies', icon: AlertTriangle },
    { id: 'rex', name: 'REX (Retour d\'Expérience)', icon: FileText },
    { id: 'maintenance', name: 'Maintenance & Planification', icon: Wrench },
    { id: 'dashboard', name: 'Tableau de Bord', icon: BarChart3 },
    { id: 'ai', name: 'Intelligence Artificielle', icon: Brain },
    { id: 'search', name: 'Recherche & Filtres', icon: Search },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'account', name: 'Compte & Paramètres', icon: Settings }
  ];

  const faqs = {
    anomalies: [
      {
        question: "Comment créer une nouvelle anomalie ?",
        answer: "Cliquez sur 'Anomalies' dans le menu principal, puis sur 'Nouvelle Anomalie'. Remplissez les champs obligatoires : titre, description, équipement concerné, niveau de criticité (Critical, Normale, Faible), et ajoutez des photos si nécessaire. Le système calculera automatiquement les scores de disponibilité, fiabilité et sécurité processus."
      },
      {
        question: "Que signifient les niveaux de criticité ?",
        answer: "Le système utilise 3 niveaux : **Critique** (criticité > 9) pour les anomalies nécessitant une intervention immédiate, **Normale** (criticité 3-8) pour les anomalies à traiter selon la planification, et **Faible** (criticité < 3) pour les anomalies de maintenance préventive."
      },
      {
        question: "Comment modifier une anomalie existante ?",
        answer: "Dans la liste des anomalies, cliquez sur l'icône d'édition (crayon) à droite de l'anomalie. Vous pouvez modifier tous les champs sauf l'ID. Les modifications sont automatiquement horodatées et tracées dans l'historique."
      },
      {
        question: "Comment suivre le statut d'une anomalie ?",
        answer: "Chaque anomalie a un statut visible dans la liste : **Nouvelle** (vient d'être créée), **En cours** (en cours de traitement), **Résolue** (solution appliquée), **Fermée** (validée et archivée). Cliquez sur une anomalie pour voir l'historique complet des changements de statut."
      },
      {
        question: "Comment créer un REX depuis une anomalie ?",
        answer: "Dans la liste des anomalies, cliquez sur 'Créer REX' dans le menu actions de l'anomalie. Le système pré-remplira automatiquement le REX avec les informations de l'anomalie (équipement, description, etc.) pour faciliter la création du retour d'expérience."
      },
      {
        question: "Comment utiliser les filtres dans la liste des anomalies ?",
        answer: "Utilisez les filtres en haut de la liste : **Recherche** (titre, description, équipement), **Criticité** (Critical, Normale, Faible), **Statut** (Nouvelle, En cours, Résolue, Fermée). Vous pouvez combiner plusieurs filtres. Le compteur 'Affichage de X à Y sur Z entrées' montre les résultats filtrés."
      },
      {
        question: "Que signifient les scores de disponibilité, fiabilité et sécurité ?",
        answer: "Ces scores (1-100) sont calculés automatiquement par l'IA : **Disponibilité** mesure l'impact sur la production, **Fiabilité** évalue la robustesse de l'équipement, **Sécurité Processus** analyse les risques pour la sécurité. Plus le score est élevé, plus l'impact est important."
      },
      {
        question: "Comment fonctionne la pagination des anomalies ?",
        answer: "Utilisez le menu 'Afficher X entrées' pour choisir 10, 25, 50 ou 100 anomalies par page. Les boutons de navigation permettent de passer d'une page à l'autre. La sélection multiple fonctionne uniquement sur la page courante."
      }
    ],
    rex: [
      {
        question: "Comment créer un nouveau REX ?",
        answer: "Allez dans 'REX' > 'Nouveau REX' ou créez-le directement depuis une anomalie. Remplissez les sections : **Contexte** (description du problème), **Analyse** (causes identifiées), **Solution** (actions mises en place), **Valeur de la connaissance** (1-5), **Niveau d'impact** (Local, Régional, National), et **Actions préventives** pour éviter la récurrence."
      },
      {
        question: "Comment évaluer la valeur d'un REX ?",
        answer: "Utilisez l'échelle de **Valeur de la connaissance** : 1 (Information basique), 2 (Connaissance utile), 3 (Expérience significative), 4 (Expertise avancée), 5 (Innovation majeure). Cette évaluation aide à prioriser les REX les plus précieux pour l'organisation."
      },
      {
        question: "Qu'est-ce que le niveau d'impact d'un REX ?",
        answer: "Le niveau d'impact définit la portée du REX : **Local** (équipe/site spécifique), **Régional** (plusieurs sites de la région), **National** (toute l'organisation TAQA Morocco). Cette classification aide à diffuser les bonnes pratiques au bon niveau."
      },
      {
        question: "Comment modifier un REX existant ?",
        answer: "Dans la liste des REX, cliquez sur 'Modifier' pour le REX souhaité. Vous pouvez éditer tous les champs y compris les actions préventives. Les modifications sont horodatées et l'historique des versions est conservé."
      },
      {
        question: "Comment rechercher dans les REX ?",
        answer: "Utilisez la barre de recherche pour chercher dans les titres, descriptions, équipements, et solutions. Vous pouvez également filtrer par valeur de connaissance, niveau d'impact, ou équipement concerné pour trouver rapidement les REX pertinents."
      },
      {
        question: "Quelle est la différence entre REX et anomalie ?",
        answer: "Une **anomalie** est un problème identifié qui nécessite une action. Un **REX** est un retour d'expérience documenté qui capture les apprentissages, solutions et actions préventives suite à la résolution d'une anomalie. Le REX enrichit la base de connaissances organisationnelle."
      }
    ],
    maintenance: [
      {
        question: "Comment accéder au calendrier de maintenance ?",
        answer: "Cliquez sur 'Maintenance' dans le menu principal pour accéder au calendrier. Vous pouvez basculer entre les vues mensuelle, hebdomadaire et quotidienne. Les événements sont codés par couleur selon la criticité : rouge (critique), orange (normale), vert (faible)."
      },
      {
        question: "Comment créer un événement de maintenance ?",
        answer: "Cliquez sur une date dans le calendrier ou sur 'Nouveau' pour créer un événement. Remplissez : **Titre**, **Équipement** (avec autocomplete), **Type** (Préventive, Corrective, Prédictive), **Criticité**, **Équipe assignée**, **Durée estimée**, et **Description détaillée**."
      },
      {
        question: "Comment fonctionne l'autocomplete des équipements ?",
        answer: "Commencez à taper le nom de l'équipement et le système propose automatiquement les équipements correspondants de la base de données. Sélectionnez l'équipement souhaité dans la liste déroulante. Cette fonctionnalité est disponible dans tous les formulaires (anomalies, REX, maintenance)."
      },
      {
        question: "Comment assigner une équipe à une maintenance ?",
        answer: "Dans le formulaire de maintenance, sélectionnez l'équipe dans la liste déroulante. Les équipes disponibles sont : **Équipe Mécanique**, **Équipe Électrique**, **Équipe Instrumentation**, **Équipe Sécurité**, **Équipe Maintenance Générale**. Chaque équipe a ses spécialités techniques."
      },
      {
        question: "Comment modifier ou supprimer un événement de maintenance ?",
        answer: "Cliquez sur l'événement dans le calendrier pour l'ouvrir, puis utilisez les boutons 'Modifier' ou 'Supprimer'. Vous pouvez également faire glisser l'événement pour changer sa date/heure directement dans le calendrier."
      },
      {
        question: "Comment voir l'historique de maintenance d'un équipement ?",
        answer: "Dans la fiche équipement (accessible via l'autocomplete), l'onglet 'Historique' montre toutes les interventions passées avec dates, types, équipes, et résultats. Cet historique aide à identifier les patterns et optimiser la maintenance préventive."
      }
    ],
    dashboard: [
      {
        question: "Comment interpréter les cartes de statistiques ?",
        answer: "Le tableau de bord affiche 4 cartes principales : **Critiques** (anomalies > 9), **Normales** (criticité 3-8), **Faibles** (< 3), et **Total**. Chaque carte montre le nombre actuel, la tendance (↑↓), et des indicateurs visuels. Les couleurs indiquent l'urgence : rouge (critique), orange (attention), vert (normal)."
      },
      {
        question: "Comment fonctionne le graphique des anomalies ?",
        answer: "Le graphique principal montre l'évolution des anomalies dans le temps, avec des courbes séparées par niveau de criticité. Vous pouvez cliquer sur la légende pour masquer/afficher certaines courbes. Les données sont mises à jour en temps réel."
      },
      {
        question: "Que signifient les alertes critiques ?",
        answer: "La section 'Alertes Critiques' affiche les anomalies nécessitant une attention immédiate. Chaque alerte montre : **Équipement concerné**, **Description**, **Temps écoulé**, **Assigné à**, et **Actions disponibles**. Les alertes sont triées par criticité et ancienneté."
      },
      {
        question: "Comment utiliser la section 'Activités Récentes' ?",
        answer: "Cette section montre les dernières actions sur la plateforme : résolutions d'anomalies, créations de REX, maintenances planifiées. Vous pouvez filtrer par type d'activité (Toutes, Résolutions, Alertes, Maintenance, Rapports) et voir les détails en cliquant sur une activité."
      },
      {
        question: "Comment actualiser les données du tableau de bord ?",
        answer: "Le tableau de bord se met à jour automatiquement toutes les 5 minutes. Vous pouvez forcer une actualisation en cliquant sur 'Actualiser' en haut à droite. L'heure de dernière mise à jour est affichée dans la barre de statut temps réel."
      },
      {
        question: "Comment naviguer depuis le tableau de bord ?",
        answer: "Cliquez sur les cartes de statistiques pour accéder aux listes filtrées correspondantes. Les alertes critiques sont cliquables pour ouvrir les détails. Les activités récentes permettent d'accéder directement aux éléments concernés (anomalies, REX, maintenances)."
      }
    ],
    ai: [
      {
        question: "Comment fonctionne l'IA de prédiction ?",
        answer: "L'IA analyse automatiquement chaque anomalie pour calculer 3 scores : **Disponibilité** (impact sur la production), **Fiabilité** (robustesse de l'équipement), **Sécurité Processus** (risques sécuritaires). Les modèles sont entraînés sur l'historique des anomalies et équipements TAQA."
      },
      {
        question: "Comment tester une anomalie avec l'IA ?",
        answer: "Dans la page 'Gestion du Modèle IA', onglet 'Test Anomalies', saisissez une description d'anomalie et sélectionnez un équipement. L'IA retournera les 3 scores prédits avec un niveau de confiance. Ceci permet de valider les prédictions avant utilisation en production."
      },
      {
        question: "Comment interpréter les scores de l'IA ?",
        answer: "Les scores vont de 1 à 100 : **1-30** (impact faible), **31-70** (impact modéré), **71-100** (impact élevé). Le niveau de confiance indique la fiabilité de la prédiction. Des scores élevés en disponibilité et sécurité nécessitent une attention prioritaire."
      },
      {
        question: "Comment entraîner le modèle IA ?",
        answer: "Dans l'onglet 'Entraînement', uploadez un fichier CSV avec les données d'anomalies (colonnes requises : description, équipement, disponibilité, fiabilité, sécurité). Le système entraîne automatiquement les 3 modèles et sauvegarde les versions précédentes."
      },
      {
        question: "Comment utiliser l'API de l'IA ?",
        answer: "L'onglet 'API & Exemples' montre les endpoints disponibles : **GET /health** (statut), **GET /model-info** (informations), **POST /predict** (prédiction). Utilisez l'endpoint /predict avec un objet JSON contenant anomaly_id, description, equipment_name, et equipment_id."
      },
      {
        question: "Comment voir les métriques de performance de l'IA ?",
        answer: "L'onglet 'Vue d'ensemble' affiche les métriques de chaque modèle : **Précision**, **Rappel**, **Score F1**, **Erreur moyenne**. Ces métriques indiquent la qualité des prédictions. Des scores élevés (>0.8) indiquent un modèle performant."
      }
    ],
    search: [
      {
        question: "Comment utiliser la recherche globale ?",
        answer: "Utilisez la barre de recherche en haut de la page (raccourci Ctrl+K ou ⌘+K). La recherche fonctionne sur tous les contenus : anomalies, REX, équipements, descriptions. Tapez vos mots-clés et appuyez sur Entrée pour lancer la recherche."
      },
      {
        question: "Comment filtrer les résultats de recherche ?",
        answer: "Après une recherche, utilisez les filtres latéraux pour affiner : **Type de contenu** (Anomalies, REX, Équipements), **Criticité**, **Statut**, **Période**. Vous pouvez combiner plusieurs filtres pour des résultats plus précis."
      },
      {
        question: "Comment utiliser les filtres avancés dans les listes ?",
        answer: "Chaque liste (anomalies, REX, maintenance) a ses propres filtres : **Barre de recherche** (recherche textuelle), **Menus déroulants** (criticité, statut, équipe), **Sélecteurs de date** (période). Les filtres sont cumulatifs et mis à jour en temps réel."
      },
      {
        question: "Comment sauvegarder des recherches fréquentes ?",
        answer: "Après avoir appliqué des filtres, l'URL de la page contient vos critères. Vous pouvez marquer cette page dans vos favoris pour retrouver rapidement la même recherche. Les filtres sont persistants pendant votre session."
      },
      {
        question: "Comment rechercher par équipement ?",
        answer: "Utilisez l'autocomplete des équipements disponible dans toutes les recherches. Commencez à taper le nom ou l'identifiant de l'équipement, le système propose automatiquement les équipements correspondants de la base de données TAQA."
      },
      {
        question: "Comment exporter les résultats de recherche ?",
        answer: "Dans les listes filtrées, utilisez le bouton 'Exporter' pour télécharger les résultats en CSV ou PDF. L'export respecte les filtres appliqués, permettant d'obtenir uniquement les données pertinentes pour vos analyses."
      }
    ],
    notifications: [
      {
        question: "Comment configurer mes notifications ?",
        answer: "Allez dans votre profil > 'Paramètres' > 'Notifications'. Vous pouvez activer/désactiver chaque type : **Nouvelles anomalies**, **Changements de statut**, **Maintenances planifiées**, **Alertes critiques**, **Commentaires REX**. Choisissez entre notifications email et push."
      },
      {
        question: "Comment voir mes notifications récentes ?",
        answer: "Cliquez sur l'icône de notification (cloche) dans l'en-tête. Le badge rouge indique le nombre de notifications non lues. La liste montre les dernières notifications avec horodatage. Cliquez sur une notification pour accéder directement à l'élément concerné."
      },
      {
        question: "Quels types de notifications puis-je recevoir ?",
        answer: "Types disponibles : **Anomalies critiques** (nouvelles anomalies > 9), **Assignations** (tâches assignées), **Échéances** (maintenances dues), **Résolutions** (anomalies résolues), **Commentaires** (sur vos REX), **Système** (mises à jour, maintenance plateforme)."
      },
      {
        question: "Comment désactiver temporairement les notifications ?",
        answer: "Dans les paramètres de notification, utilisez le mode 'Ne pas déranger' pour désactiver toutes les notifications pendant une période définie (1h, 4h, 8h, 24h). Les notifications critiques de sécurité restent actives même en mode silencieux."
      },
      {
        question: "Comment marquer les notifications comme lues ?",
        answer: "Cliquez sur une notification individuelle pour la marquer comme lue, ou utilisez 'Marquer tout comme lu' en haut de la liste. Les notifications lues restent visibles pendant 7 jours avant d'être automatiquement archivées."
      },
      {
        question: "Comment recevoir des notifications par email ?",
        answer: "Activez les notifications email dans vos paramètres. Vous recevrez un résumé quotidien des activités importantes et des notifications immédiates pour les alertes critiques. L'email contient des liens directs vers les éléments concernés."
      }
    ],
    account: [
      {
        question: "Comment modifier mes informations personnelles ?",
        answer: "Cliquez sur votre avatar en haut à droite > 'Profil'. Vous pouvez modifier : **Nom**, **Email**, **Téléphone**, **Poste**, **Équipe**, **Photo de profil**. Les modifications sont sauvegardées automatiquement et mises à jour dans toute la plateforme."
      },
      {
        question: "Comment changer mon mot de passe ?",
        answer: "Dans votre profil > 'Sécurité' > 'Changer le mot de passe'. Saisissez votre mot de passe actuel puis le nouveau (minimum 8 caractères, avec majuscules, minuscules, chiffres et symboles). Vous recevrez une confirmation par email."
      },
      {
        question: "Comment configurer l'authentification à deux facteurs ?",
        answer: "Dans 'Sécurité' > 'Authentification à deux facteurs', scannez le QR code avec votre application d'authentification (Google Authenticator, Authy). Saisissez le code généré pour activer. Cette protection supplémentaire sécurise votre compte contre les accès non autorisés."
      },
      {
        question: "Comment personnaliser l'interface ?",
        answer: "Dans 'Préférences' : **Thème** (clair/sombre), **Langue** (français/anglais/arabe), **Fuseau horaire**, **Format de date**, **Nombre d'éléments par page**. Utilisez le bouton thème (lune/soleil) dans l'en-tête pour basculer rapidement entre clair et sombre."
      },
      {
        question: "Comment voir mon historique d'activité ?",
        answer: "Dans votre profil > 'Activité', consultez l'historique complet de vos actions : anomalies créées/modifiées, REX rédigés, maintenances planifiées, connexions. Cet historique aide à suivre votre contribution et identifier les patterns d'utilisation."
      },
      {
        question: "Comment me déconnecter de tous les appareils ?",
        answer: "Dans 'Sécurité' > 'Sessions actives', voyez tous les appareils connectés avec localisation et dernière activité. Utilisez 'Déconnecter partout' pour fermer toutes les sessions actives. Utile si vous suspectez un accès non autorisé à votre compte."
      },
      {
        question: "Comment supprimer mon compte ?",
        answer: "Contactez l'administrateur système pour la suppression de compte. Pour des raisons de conformité et de traçabilité industrielle, les comptes ne peuvent pas être supprimés directement. L'administrateur peut désactiver le compte tout en préservant l'historique des données critiques."
      }
    ]
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const filteredFaqs = faqs[selectedCategory as keyof typeof faqs]?.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Guide d'utilisation TAQA
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Questions fréquentes sur les fonctionnalités de la plateforme
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filteredFaqs.length} question{filteredFaqs.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher dans les questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 w-full rounded-lg border border-gray-300 bg-transparent pl-11 pr-4 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-3 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-800"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Categories */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
              Fonctionnalités
            </h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center gap-3 rounded-lg p-3 text-left transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'hover:bg-gray-100 text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  <category.icon className="h-5 w-5" />
                  <span className="text-sm">{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Tips */}
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
              Conseils rapides
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/10 dark:border-blue-800/30">
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Raccourci</span>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Ctrl+K pour la recherche rapide
                </p>
              </div>

              <div className="p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/10 dark:border-green-800/30">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">Autocomplete</span>
                </div>
                <p className="text-xs text-green-700 dark:text-green-300">
                  Tapez pour suggérer les équipements
                </p>
                  </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-900/10 dark:border-yellow-800/30">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Détails</span>
                </div>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  Cliquez sur les éléments pour plus d'infos
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* FAQ Section */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                {categories.find(c => c.id === selectedCategory)?.name}
            </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {filteredFaqs.length} question{filteredFaqs.length > 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg dark:border-gray-700 overflow-hidden">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <span className="font-medium text-gray-800 dark:text-white/90 text-sm">
                      {faq.question}
                    </span>
                    <div className="flex-shrink-0 ml-4">
                    {expandedFaq === index ? (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-500" />
                    )}
                    </div>
                  </button>
                  {expandedFaq === index && (
                    <div className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700 pt-4 leading-relaxed">
                      <div dangerouslySetInnerHTML={{ __html: faq.answer.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    </div>
                  )}
                </div>
              ))}
              
              {filteredFaqs.length === 0 && (
                <div className="text-center py-12">
                  <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    Aucune question trouvée
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Essayez de modifier votre recherche ou sélectionnez une autre catégorie
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Support */}
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
              Besoin d'aide supplémentaire ?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Si vous ne trouvez pas la réponse à votre question, contactez notre équipe support.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50 cursor-pointer">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white/90 text-sm">
                    Support technique
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Assistance en ligne 8h-18h
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50 cursor-pointer">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white/90 text-sm">
                    Email support
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    support@taqa.ma
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 