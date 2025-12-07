import React, { useState, useEffect } from 'react'
import Card from '../components/Card'
import Table from '../components/Table'
import Form, { FormInput, FormTextarea, FormButton } from '../components/Form'
import { contentAPI } from '../services/api'

export default function Content() {
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ title: '', description: '', page: '', type: '' })

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      setLoading(true)
      const { data } = await contentAPI.getAll()
      setContent(data)
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
        await contentAPI.update(editingId, formData)
      } else {
        await contentAPI.create(formData)
      }
      setFormData({ title: '', description: '', page: '', type: '' })
      setEditingId(null)
      fetchContent()
    } catch (error) {
      alert('Erreur: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (item) => {
    setFormData(item)
    setEditingId(item.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (confirm('Êtes-vous sûr?')) {
      try {
        await contentAPI.delete(id)
        fetchContent()
      } catch (error) {
        alert('Erreur: ' + error.message)
      }
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Contenu</h1>
        {editingId && (
          <button 
            onClick={() => { setEditingId(null); setFormData({ title: '', description: '', page: '', type: '' }); }}
            style={{ padding: '8px 16px', background: '#999', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Annuler
          </button>
        )}
      </div>

      <Card title={editingId ? 'Modifier le contenu' : 'Ajouter un contenu'}>
        <Form onSubmit={handleSubmit}>
          <FormInput 
            label="Titre"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <FormTextarea 
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
          <FormInput 
            label="Page"
            placeholder="home, about, services, etc."
            value={formData.page}
            onChange={(e) => setFormData({ ...formData, page: e.target.value })}
          />
          <FormInput 
            label="Type"
            placeholder="hero, section, etc."
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          />
          <FormButton loading={saving}>
            {editingId ? 'Mettre à jour' : 'Ajouter'} Contenu
          </FormButton>
        </Form>
      </Card>

      <Card title="Liste du contenu">
        <Table 
          columns={[
            { key: 'title', label: 'Titre' },
            { key: 'description', label: 'Description' },
            { key: 'page', label: 'Page' },
            { key: 'type', label: 'Type' }
          ]}
          data={content}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>
    </div>
  )
}
