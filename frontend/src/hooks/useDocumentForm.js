import { useMemo, useRef, useState } from 'react'

const emptyForm = {
  title: '',
  description: '',
  submissionMode: 'archive',
}

export function useDocumentForm() {
  const [form, setForm] = useState(emptyForm)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const hasFile = Boolean(selectedFile)

  const fileSummary = useMemo(() => {
    if (!selectedFile) {
      return null
    }

    return {
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type || 'application/octet-stream',
    }
  }, [selectedFile])

  const reset = () => {
    setForm(emptyForm)
    setSelectedFile(null)
    setIsDragging(false)
  }

  const open = () => {
    reset()
  }

  const close = () => {
    reset()
  }

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const setFile = (file) => {
    setSelectedFile(file)
  }

  const clearFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFileInputChange = (event) => {
    const file = event.target.files?.[0] ?? null
    setFile(file)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0] ?? null
    setFile(file)
  }

  return {
    form,
    selectedFile,
    fileSummary,
    hasFile,
    isDragging,
    fileInputRef,
    open,
    close,
    reset,
    handleChange,
    setIsDragging,
    openFilePicker,
    handleFileInputChange,
    handleDrop,
    clearFile,
  }
}
