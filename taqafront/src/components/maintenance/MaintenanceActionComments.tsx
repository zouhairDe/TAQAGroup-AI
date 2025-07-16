"use client";

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Reply, 
  Send, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Types
interface MaintenanceComment {
  id: string;
  content: string;
  commentType: 'general' | 'progress' | 'issue' | 'resolution' | 'quality';
  isInternal: boolean;
  authorId: string;
  replyToId?: string;
  createdAt: string;
  updatedAt: string;
  editedAt?: string;
  isEdited: boolean;
  author: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  replies?: MaintenanceComment[];
}

interface MaintenanceActionCommentsProps {
  maintenanceActionId: string;
  currentUserId: string;
  userRole: string;
}

const MaintenanceActionComments: React.FC<MaintenanceActionCommentsProps> = ({
  maintenanceActionId,
  currentUserId,
  userRole
}) => {
  const [comments, setComments] = useState<MaintenanceComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<MaintenanceComment['commentType']>('general');
  const [isInternal, setIsInternal] = useState(false);
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showInternal, setShowInternal] = useState(true);

  // Load comments
  useEffect(() => {
    loadComments();
  }, [maintenanceActionId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      // API call would go here
      // const response = await fetch(`/api/v1/maintenance-actions/${maintenanceActionId}/comments`);
      // const data = await response.json();
      
      // Mock data for now
      const mockComments: MaintenanceComment[] = [
        {
          id: '1',
          content: 'Action démarrée. Vérification initiale effectuée, tout semble normal.',
          commentType: 'progress',
          isInternal: false,
          authorId: 'user1',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          isEdited: false,
          author: {
            id: 'user1',
            name: 'Ahmed Technician',
            email: 'ahmed@taqa.com',
            role: 'Technicien'
          }
        },
        {
          id: '2',
          content: 'Problème détecté au niveau du roulement gauche. Commande de pièce de rechange nécessaire.',
          commentType: 'issue',
          isInternal: true,
          authorId: 'user1',
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          isEdited: false,
          author: {
            id: 'user1',
            name: 'Ahmed Technician',
            email: 'ahmed@taqa.com',
            role: 'Technicien'
          }
        }
      ];
      
      setComments(mockComments);
    } catch (error) {
      console.error('Erreur lors du chargement des commentaires:', error);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;

    try {
      const comment: Partial<MaintenanceComment> = {
        content: newComment.trim(),
        commentType,
        isInternal,
        replyToId,
        authorId: currentUserId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isEdited: false,
        author: {
          id: currentUserId,
          name: 'Current User',
          email: 'user@taqa.com',
          role: userRole
        }
      };

      // API call would go here
      // await fetch(`/api/v1/maintenance-actions/${maintenanceActionId}/comments`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(comment)
      // });

      // For now, add to local state
      setComments(prev => [...prev, { ...comment, id: `temp_${Date.now()}` } as MaintenanceComment]);
      setNewComment('');
      setReplyToId(null);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
    }
  };

  const updateComment = async (commentId: string, content: string) => {
    try {
      // API call would go here
      // await fetch(`/api/v1/maintenance-actions/comments/${commentId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ content, editedAt: new Date().toISOString() })
      // });

      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, content, isEdited: true, editedAt: new Date().toISOString() }
          : comment
      ));
      setEditingCommentId(null);
      setEditingContent('');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du commentaire:', error);
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      // API call would go here
      // await fetch(`/api/v1/maintenance-actions/comments/${commentId}`, {
      //   method: 'DELETE'
      // });

      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Erreur lors de la suppression du commentaire:', error);
    }
  };

  const getCommentTypeConfig = (type: MaintenanceComment['commentType']) => {
    switch (type) {
      case 'progress':
        return { label: 'Progrès', color: 'info', icon: CheckCircle };
      case 'issue':
        return { label: 'Problème', color: 'error', icon: AlertTriangle };
      case 'resolution':
        return { label: 'Résolution', color: 'success', icon: CheckCircle };
      case 'quality':
        return { label: 'Qualité', color: 'warning', icon: Shield };
      default:
        return { label: 'Général', color: 'light', icon: MessageSquare };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const canEditComment = (comment: MaintenanceComment) => {
    if (comment.authorId !== currentUserId) return false;
    const commentAge = Date.now() - new Date(comment.createdAt).getTime();
    return commentAge < 15 * 60 * 1000; // 15 minutes
  };

  const canDeleteComment = (comment: MaintenanceComment) => {
    return comment.authorId === currentUserId || userRole === 'admin';
  };

  const filteredComments = comments.filter(comment => {
    if (filterType !== 'all' && comment.commentType !== filterType) return false;
    if (!showInternal && comment.isInternal) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement des commentaires...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Commentaires ({filteredComments.length})
        </h3>
        <div className="flex items-center gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="general">Général</SelectItem>
              <SelectItem value="progress">Progrès</SelectItem>
              <SelectItem value="issue">Problèmes</SelectItem>
              <SelectItem value="resolution">Résolutions</SelectItem>
              <SelectItem value="quality">Qualité</SelectItem>
            </SelectContent>
          </Select>
          
          {(userRole === 'admin' || userRole === 'supervisor') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInternal(!showInternal)}
              className="flex items-center gap-1"
            >
              {showInternal ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              Internes
            </Button>
          )}
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        {filteredComments.length > 0 ? (
          filteredComments.map((comment) => {
            const typeConfig = getCommentTypeConfig(comment.commentType);
            const TypeIcon = typeConfig.icon;
            
            return (
              <div
                key={comment.id}
                className={`rounded-lg border p-4 ${
                  comment.isInternal 
                    ? 'border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-900/10' 
                    : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                      {comment.author.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {comment.author.name}
                      </p>
                      <Badge variant="light" color={typeConfig.color} size="sm">
                        <TypeIcon className="h-3 w-3 mr-1" />
                        {typeConfig.label}
                      </Badge>
                      {comment.isInternal && (
                        <Badge variant="light" color="warning" size="sm">
                          <Shield className="h-3 w-3 mr-1" />
                          Interne
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {comment.author.role} • {formatDate(comment.createdAt)}
                      {comment.isEdited && ' • Modifié'}
                    </p>
                  </div>
                </div>

                {editingCommentId === comment.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="resize-none"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => updateComment(comment.id, editingContent)}
                      >
                        Sauvegarder
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditingContent('');
                        }}
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {comment.content}
                  </p>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucun commentaire pour le moment</p>
          </div>
        )}
      </div>

      {/* Add Comment Form */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        {replyToId && (
          <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700 dark:text-blue-300">
                <Reply className="h-4 w-4 inline mr-1" />
                Réponse à un commentaire
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setReplyToId(null)}
                className="h-6 px-2"
              >
                ×
              </Button>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          <div className="flex gap-2">
            <Select value={commentType} onValueChange={(value: MaintenanceComment['commentType']) => setCommentType(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Général</SelectItem>
                <SelectItem value="progress">Progrès</SelectItem>
                <SelectItem value="issue">Problème</SelectItem>
                <SelectItem value="resolution">Résolution</SelectItem>
                <SelectItem value="quality">Qualité</SelectItem>
              </SelectContent>
            </Select>
            
            {(userRole === 'admin' || userRole === 'supervisor') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsInternal(!isInternal)}
                className={`flex items-center gap-1 ${isInternal ? 'bg-orange-100 text-orange-700' : ''}`}
              >
                <Shield className="h-4 w-4" />
                {isInternal ? 'Interne' : 'Public'}
              </Button>
            )}
          </div>
          
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ajouter un commentaire..."
            className="resize-none"
            rows={3}
          />
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">
              {newComment.length}/2000 caractères
            </span>
            <Button 
              onClick={addComment} 
              disabled={!newComment.trim() || newComment.length > 2000}
              size="sm"
            >
              <Send className="h-4 w-4 mr-2" />
              {replyToId ? 'Répondre' : 'Commenter'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceActionComments; 