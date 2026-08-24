import { useMemo, useRef, useState } from 'react'

const emptyForm = {
  title: '',
  description: '',
  submissionMode: 'archive',
}

export function useDocumentForm() {
  const [form, setForm] = useState(emptyForm)
  const [selectedFile, setSelectedFile] = useState(null)
  const [extraFiles, setExtraFiles] = useState([])
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

  const extraFilesSummary = useMemo(() => {
    return extraFiles.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
    }))
  }, [extraFiles])

  const reset = () => {
    setForm(emptyForm)
    setSelectedFile(null)
    setExtraFiles([])
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

  const setFiles = (filesList) => {
    if (!filesList || filesList.length === 0) return
    const arr = Array.from(filesList)
    // Si ya hay un archivo principal, los nuevos se agregan como extra
    if (selectedFile) {
      setExtraFiles((prev) => [...prev, ...arr])
    } else {
      // Primer lote: el primero es el principal, el resto son extras
      setSelectedFile(arr[0])
      setExtraFiles(arr.slice(1))
    }
  }

  const clearFile = () => {
    if (extraFiles.length > 0) {
      setSelectedFile(extraFiles[0])
      setExtraFiles((current) => current.slice(1))
    } else {
      setSelectedFile(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeExtraFile = (index) => {
    setExtraFiles((current) => current.filter((_, i) => i !== index))
  }

  const handleFileInputChange = (event) => {
    const files = event.target.files ?? []
    setFiles(files)
    if (event.target) {
      event.target.value = ''
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    const files = event.dataTransfer.files ?? []
    setFiles(files)
  }

  return {
    form,
    selectedFile,
    extraFiles,
    fileSummary,
    extraFilesSummary,
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
    removeExtraFile,
  }
}
