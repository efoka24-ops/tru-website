import React, { useState } from 'react'
import { servicesAPI, teamAPI, uploadFile } from '@/services/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Users,
  Settings,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Upload,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Package
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('services')
  const [isEditing, setIsEditing] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleteType, setDeleteType] = useState(null)
  const queryClient = useQueryClient()

  // Fetch Services
  const { data: services = [], isLoading: loadingServices } = useQuery({
    queryKey: ['services'],
    queryFn: () => servicesAPI.list('id').then(res => res.data)
  })

  // Fetch Team
  const { data: teamMembers = [], isLoading: loadingTeam } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: () => teamAPI.list('id').then(res => res.data)
  })

  // Mutations for Services
  const createServiceMutation = useMutation({
    mutationFn: (data) => servicesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      setIsEditing(false)
      setEditingItem(null)
    }
  })

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, data }) => servicesAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      setIsEditing(false)
      setEditingItem(null)
    }
  })

  const deleteServiceMutation = useMutation({
    mutationFn: (id) => servicesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      setDeleteConfirm(null)
    }
  })

  // Mutations for Team
  const createTeamMutation = useMutation({
    mutationFn: (data) => teamAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] })
      setIsEditing(false)
      setEditingItem(null)
    }
  })

  const updateTeamMutation = useMutation({
    mutationFn: ({ id, data }) => teamAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] })
      setIsEditing(false)
      setEditingItem(null)
    }
  })

  const deleteTeamMutation = useMutation({
    mutationFn: (id) => teamAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] })
      setDeleteConfirm(null)
    }
  })

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      try {
        const { file_url } = await uploadFile(file)
        setEditingItem({ ...editingItem, image: file_url })
      } catch (error) {
        alert('Erreur lors du téléchargement')
      }
    }
  }

  const handleSaveService = () => {
    if (editingItem.id) {
      updateServiceMutation.mutate({ id: editingItem.id, data: editingItem })
    } else {
      createServiceMutation.mutate(editingItem)
    }
  }

  const handleSaveTeam = () => {
    if (editingItem.id) {
      updateTeamMutation.mutate({ id: editingItem.id, data: editingItem })
    } else {
      createTeamMutation.mutate(editingItem)
    }
  }

  const handleDelete = () => {
    if (deleteType === 'service') {
      deleteServiceMutation.mutate(deleteConfirm.id)
    } else if (deleteType === 'team') {
      deleteTeamMutation.mutate(deleteConfirm.id)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Administration</h1>
          <p className="text-slate-600">Gérez le contenu de votre site TRU</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Services
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Équipe
            </TabsTrigger>
          </TabsList>

          {/* Services Tab */}
          <TabsContent value="services">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Services</CardTitle>
                <Button
                  onClick={() => {
                    setEditingItem({ name: '', description: '', price: '', category: '' })
                    setIsEditing(true)
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un service
                </Button>
              </CardHeader>
              <CardContent>
                {loadingServices ? (
                  <div className="text-center py-12">
                    <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                ) : services.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    Aucun service ajouté.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {services.map((service) => (
                      <motion.div
                        key={service.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:shadow-md"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">{service.name}</h3>
                          <p className="text-slate-600 text-sm">{service.description}</p>
                          <p className="text-green-600 text-sm mt-1">${service.price}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setEditingItem(service)
                              setIsEditing(true)
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => {
                              setDeleteConfirm(service)
                              setDeleteType('service')
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Membres de l'équipe</CardTitle>
                <Button
                  onClick={() => {
                    setEditingItem({ name: '', position: '', bio: '', email: '', image: '' })
                    setIsEditing(true)
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un membre
                </Button>
              </CardHeader>
              <CardContent>
                {loadingTeam ? (
                  <div className="text-center py-12">
                    <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                ) : teamMembers.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    Aucun membre ajouté.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {teamMembers.map((member) => (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:shadow-md"
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0">
                          {member.image ? (
                            <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white font-bold text-xl">
                              {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">{member.name}</h3>
                          <p className="text-green-600 text-sm">{member.position}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setEditingItem(member)
                              setIsEditing(true)
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => {
                              setDeleteConfirm(member)
                              setDeleteType('team')
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {activeTab === 'services'
                ? (editingItem?.id ? 'Modifier le service' : 'Ajouter un service')
                : (editingItem?.id ? 'Modifier le membre' : 'Ajouter un membre')}
            </DialogTitle>
          </DialogHeader>

          {editingItem && (
            <div className="space-y-6 p-6">
              {activeTab === 'team' && (
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center overflow-hidden">
                    {editingItem.image ? (
                      <img src={editingItem.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold text-2xl">
                        {editingItem.name ? editingItem.name.split(' ').map(n => n[0]).join('').slice(0, 2) : '?'}
                      </span>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload">
                      <Button variant="outline" asChild>
                        <span className="cursor-pointer">
                          <Upload className="w-4 h-4 mr-2" />
                          Photo
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>{activeTab === 'services' ? 'Nom du service' : 'Nom complet'} *</Label>
                <Input
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  placeholder={activeTab === 'services' ? 'Nom' : 'Nom et prénom'}
                />
              </div>

              {activeTab === 'services' ? (
                <>
                  <div className="space-y-2">
                    <Label>Description *</Label>
                    <Textarea
                      value={editingItem.description}
                      onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                      placeholder="Description du service"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Prix *</Label>
                      <Input
                        type="number"
                        value={editingItem.price}
                        onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Catégorie</Label>
                      <Input
                        value={editingItem.category}
                        onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Poste *</Label>
                    <Input
                      value={editingItem.position}
                      onChange={(e) => setEditingItem({ ...editingItem, position: e.target.value })}
                      placeholder="Ex: Directeur Technique"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <Textarea
                      value={editingItem.bio}
                      onChange={(e) => setEditingItem({ ...editingItem, bio: e.target.value })}
                      placeholder="Bio ou description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={editingItem.email}
                        onChange={(e) => setEditingItem({ ...editingItem, email: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Annuler
                </Button>
                <Button
                  onClick={activeTab === 'services' ? handleSaveService : handleSaveTeam}
                  disabled={!editingItem.name || (activeTab === 'services' && !editingItem.description)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteType === 'service' ? 'Supprimer ce service ?' : 'Supprimer ce membre ?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. {deleteConfirm?.name} sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirm(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
