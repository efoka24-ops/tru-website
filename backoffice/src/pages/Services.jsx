import React, { useState, useEffect } from 'react'
import Card from '../components/Card'
import Table from '../components/Table'
import Form, { FormInput, FormTextarea, FormButton } from '../components/Form'
import { servicesAPI } from '../services/api'
import { Plus } from 'lucide-react'

export default function Services() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '', price: '', category: '' })

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const { data } = await servicesAPI.getAll()
      setServices(data)
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
        await servicesAPI.update(editingId, formData)
      } else {
        await servicesAPI.create(formData)
      }
      setFormData({ name: '', description: '', price: '', category: '' })
      setEditingId(null)
      fetchServices()
    } catch (error) {
      alert('Erreur: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (service) => {
    setFormData(service)
    setEditingId(service.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (confirm('Êtes-vous sûr?')) {
      try {
        await servicesAPI.delete(id)
        fetchServices()
      } catch (error) {
        alert('Erreur: ' + error.message)
      }
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Services</h1>
        {editingId && (
          <button 
            onClick={() => { setEditingId(null); setFormData({ name: '', description: '', price: '', category: '' }); }}
            style={{ padding: '8px 16px', background: '#999', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Annuler
          </button>
        )}
      </div>

      <Card title={editingId ? 'Modifier le service' : 'Ajouter un service'}>
        <Form onSubmit={handleSubmit}>
          <FormInput 
            label="Nom du service"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <FormTextarea 
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
          <FormInput 
            label="Prix"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
          />
          <FormInput 
            label="Catégorie"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />
          <FormButton loading={saving}>
            {editingId ? 'Mettre à jour' : 'Ajouter'} Service
          </FormButton>
        </Form>
      </Card>

      <Card title="Liste des services">
        <Table 
          columns={[
            { key: 'name', label: 'Nom' },
            { key: 'description', label: 'Description' },
            { key: 'price', label: 'Prix', render: (row) => `$${row.price}` },
            { key: 'category', label: 'Catégorie' }
          ]}
          data={services}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>
    </div>
  )
}
