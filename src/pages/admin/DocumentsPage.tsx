import { useState, useEffect, useRef, useContext, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { AuthContext } from '@/lib/auth-context'
import {
  FileText, Upload, Trash2, Download, Search, Filter,
  File, Image, FileCheck, FileType, AlertCircle, X, Loader2
} from 'lucide-react'

type DocType = 'lease' | 'id' | 'passport' | 'registration' | 'receipt' | 'ownership' | 'other'
type RelatedType = 'customer' | 'lease' | 'property' | 'payment'

interface DocumentRow {
  id: string
  owner_id: string
  document_name: string
  type: DocType
  file_path: string
  file_url: string
  file_size: number
  mime_type: string | null
  related_type: RelatedType
  related_id: string
  uploaded_by: string
  created_at: string
  updated_at: string
}

const TYPE_LABELS: Record<DocType, string> = {
  lease: 'Lease',
  id: 'ID',
  passport: 'Passport',
  registration: 'Registration',
  receipt: 'Receipt',
  ownership: 'Ownership',
  other: 'Other',
}

const TYPE_COLORS: Record<DocType, string> = {
  lease: 'bg-blue-100 text-blue-700',
  id: 'bg-purple-100 text-purple-700',
  passport: 'bg-indigo-100 text-indigo-700',
  registration: 'bg-green-100 text-green-700',
  receipt: 'bg-amber-100 text-amber-700',
  ownership: 'bg-rose-100 text-rose-700',
  other: 'bg-gray-100 text-gray-700',
}

const RELATED_LABELS: Record<RelatedType, string> = {
  customer: 'Customer',
  lease: 'Lease',
  property: 'Property',
  payment: 'Payment',
}

function getFileIcon(mimeType: string | null) {
  if (!mimeType) return <File className="h-5 w-5 text-gray-400" />
  if (mimeType.startsWith('image/')) return <Image className="h-5 w-5 text-blue-400" />
  if (mimeType.includes('pdf')) return <FileText className="h-5 w-5 text-red-400" />
  if (mimeType.includes('word') || mimeType.includes('document')) return <FileType className="h-5 w-5 text-indigo-400" />
  return <FileCheck className="h-5 w-5 text-green-400" />
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export default function DocumentsPage() {
  const authContext = useContext(AuthContext)
  const userId = authContext?.session?.user.id

  const [documents, setDocuments] = useState<DocumentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<DocType | 'all'>('all')
  const [relatedFilter, setRelatedFilter] = useState<RelatedType | 'all'>('all')
  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    name: '',
    type: 'other' as DocType,
    related_type: 'property' as RelatedType,
    related_id: crypto.randomUUID() as string,
  })
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    console.log('DocumentsPage userId:', userId)
    if (userId) loadDocuments()
  }, [userId])

  async function loadDocuments() {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('Load documents query result:', { data, error })
      if (error) throw error
      console.log('Loaded documents:', data)
      setDocuments(data || [])
    } catch (err: any) {
      console.error('Load documents error:', err)
      setError(err.message || 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  function getFilteredDocs() {
    return documents.filter(doc => {
      if (typeFilter !== 'all' && doc.type !== typeFilter) return false
      if (relatedFilter !== 'all' && doc.related_type !== relatedFilter) return false
      if (search && !doc.document_name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }

  async function handleUpload() {
    if (!uploadFile || !userId) return
    if (!uploadForm.name.trim() || !uploadForm.related_id) {
      setError('Please fill in all fields')
      return
    }

    setUploading(true)
    setError(null)
    try {
      const fileExt = uploadFile.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}-${uploadForm.name.replace(/\s/g, '_')}.${fileExt}`
      const filePath = `documents/${fileName}`

      const { error: storageError } = await supabase.storage
        .from('documents')
        .upload(filePath, uploadFile)

      if (storageError) {
        console.error('Storage error:', storageError)
        throw storageError
      }

      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath)

      const insertData = {
        owner_id: userId,
        document_name: uploadForm.name.trim(),
        type: uploadForm.type,
        file_path: filePath,
        file_url: urlData.publicUrl,
        file_size: uploadFile.size,
        mime_type: uploadFile.type,
        related_type: uploadForm.related_type,
        related_id: uploadForm.related_id,
        uploaded_by: userId,
      }
      console.log('Inserting document data:', insertData)

      const { error: dbError } = await supabase
        .from('documents')
        .insert(insertData)

      if (dbError) {
        console.error('Supabase error details:', {
          message: dbError.message,
          code: dbError.code,
          details: dbError.details,
          hint: dbError.hint,
          full: dbError
        })
        throw dbError
      }

      setShowUpload(false)
      setUploadForm({ name: '', type: 'other', related_type: 'property', related_id: crypto.randomUUID() as string })
      setUploadFile(null)
      await loadDocuments()
    } catch (err: any) {
      setError(err.message || 'Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(doc: DocumentRow) {
    if (!confirm(`Delete "${doc.document_name}"? This cannot be undone.`)) return

    try {
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([doc.file_path])

      if (storageError) console.warn('Storage cleanup failed:', storageError.message)

      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', doc.id)

      if (dbError) throw dbError

      setDocuments(prev => prev.filter(d => d.id !== doc.id))
    } catch (err: any) {
      setError(err.message || 'Failed to delete document')
    }
  }

  function handleDownload(doc: DocumentRow) {
    window.open(doc.file_url, '_blank')
  }

  function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setUploadFile(file)
      if (!uploadForm.name.trim()) {
        setUploadForm(prev => ({ ...prev, name: file.name.replace(/\.[^.]+$/, '') }))
      }
    }
  }

  const filteredDocs = getFilteredDocs()
  const stats = useMemo(() => ({
    total: documents.length,
    leases: documents.filter(d => d.type === 'lease' || d.related_type === 'lease').length,
    receipts: documents.filter(d => d.type === 'receipt' || d.related_type === 'payment').length,
    ids: documents.filter(d => d.type === 'id' || d.type === 'passport' || d.related_type === 'customer').length,
  }), [documents])
  console.log('Documents state:', documents)
  console.log('Stats:', stats)

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-sm text-gray-500">Manage leases, IDs, receipts, and other property documents.</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: '#BA0036' }}
        >
          <Upload className="h-4 w-4" />
          Upload Document
        </button>
      </div>

      {/* KPI Cards */}
      <div key={documents.length} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Documents', value: stats.total, icon: <FileText className="h-5 w-5 text-gray-400" /> },
          { label: 'Leases', value: stats.leases, icon: <FileCheck className="h-5 w-5 text-blue-400" /> },
          { label: 'Receipts', value: stats.receipts, icon: <FileText className="h-5 w-5 text-amber-400" /> },
          { label: 'IDs & Passports', value: stats.ids, icon: <File className="h-5 w-5 text-purple-400" /> },
        ].map((stat, i) => (
          <div key={`${i}-${stat.value}`} className="rounded-xl border border-gray-200 p-4 bg-white">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">{stat.label}</span>
              {stat.icon}
            </div>
            <div className="text-lg font-bold text-gray-900">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#BA0036]"
          />
        </div>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as DocType | 'all')}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#BA0036]"
        >
          <option value="all">All Types</option>
          {Object.entries(TYPE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <select
          value={relatedFilter}
          onChange={e => setRelatedFilter(e.target.value as RelatedType | 'all')}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#BA0036]"
        >
          <option value="all">All Categories</option>
          {Object.entries(RELATED_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Documents Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-[#BA0036]" />
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText className="h-12 w-12 text-gray-300 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No documents found</h3>
          <p className="text-sm text-gray-500">
            {documents.length === 0 ? 'Upload your first document to get started.' : 'Try adjusting your filters.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Type</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Category</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Size</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Uploaded</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map(doc => (
                <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {getFileIcon(doc.mime_type)}
                      <span className="font-medium text-gray-900 truncate max-w-[200px]">{doc.document_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${TYPE_COLORS[doc.type]}`}>
                      {TYPE_LABELS[doc.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{RELATED_LABELS[doc.related_type]}</td>
                  <td className="px-4 py-3 text-gray-500">{formatFileSize(doc.file_size)}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(doc.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleDownload(doc)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => !uploading && setShowUpload(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Upload Document</h2>
              <button onClick={() => !uploading && setShowUpload(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* File picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#BA0036] transition-colors"
                >
                  {uploadFile ? (
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                      {getFileIcon(uploadFile.type)}
                      <span className="font-medium">{uploadFile.name}</span>
                      <span className="text-gray-400">({formatFileSize(uploadFile.size)})</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-gray-400">
                      <Upload className="h-6 w-6" />
                      <span className="text-sm">Click to select a file</span>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" className="hidden" onChange={onFileSelect} />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document Name</label>
                <input
                  type="text"
                  value={uploadForm.name}
                  onChange={e => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Lease Agreement - Unit 101"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#BA0036]"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={uploadForm.type}
                  onChange={e => setUploadForm(prev => ({ ...prev, type: e.target.value as DocType }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#BA0036]"
                >
                  {Object.entries(TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Related Type + ID */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={uploadForm.related_type}
                    onChange={e => setUploadForm(prev => ({ ...prev, related_type: e.target.value as RelatedType }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#BA0036]"
                  >
                    {Object.entries(RELATED_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Related ID</label>
                  <input
                    type="text"
                    value={uploadForm.related_id}
                    onChange={e => setUploadForm(prev => ({ ...prev, related_id: e.target.value }))}
                    placeholder="UUID"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#BA0036]"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowUpload(false)}
                  disabled={uploading}
                  className="px-4 py-2 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading || !uploadFile}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: '#BA0036' }}
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
