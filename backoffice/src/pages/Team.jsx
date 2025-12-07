import React, { useState, useEffect } from 'react'
import Card from '../components/Card'
import Table from '../components/Table'
import Form, { FormInput, FormTextarea, FormButton } from '../components/Form'
import { teamAPI } from '../services/api'

export default function Team() {
  const [team, setTeam] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ name: '', position: '', bio: '', email: '', image: '' })

  useEffect(() => {
    fetchTeam()
  }, [])

  const fetchTeam = async () => {
    try {
      setLoading(true)
      const { data } = await teamAPI.getAll()
      setTeam(data)
    } catch (error) {
      alert('Erreur: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      if (editingId) {
        await teamAPI.update(editingId, formData)
      } else {
        await teamAPI.create(formData)
      }
      setFormData({ name: '', position: '', bio: '', email: '', image: '' })
      setEditingId(null)
      fetchTeam()
    } catch (error) {
      alert('Erreur: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (member) => {
    setFormData(member)
    setEditingId(member.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (confirm('Êtes-vous sûr?')) {
      try {
        await teamAPI.delete(id)
        fetchTeam()
      } catch (error) {
        alert('Erreur: ' + error.message)
      }
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Équipe</h1>
        {editingId && (
          <button 
            onClick={() => { setEditingId(null); setFormData({ name: '', position: '', bio: '', email: '', image: '' }); }}
            style={{ padding: '8px 16px', background: '#999', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Annuler
          </button>
        )}
      </div>

      <Card title={editingId ? 'Modifier le membre' : 'Ajouter un membre'}>
        <Form onSubmit={handleSubmit}>
          <FormInput 
            label="Nom"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <FormInput 
            label="Position"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            required
          />
          <FormTextarea 
            label="Bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            required
          />
          <FormInput 
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <FormInput 
            label="Image (URL)"
            placeholder="/team/photo.jpg"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          />
          <FormButton loading={saving}>
            {editingId ? 'Mettre à jour' : 'Ajouter'} Membre
          </FormButton>
        </Form>
      </Card>

      <Card title="Liste de l'équipe">
        <Table 
          columns={[
            { key: 'name', label: 'Nom' },
            { key: 'position', label: 'Position' },
            { key: 'email', label: 'Email' },
            { key: 'bio', label: 'Bio' }
          ]}
          data={team}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>
    </div>
  )
}
