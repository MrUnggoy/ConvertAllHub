import { createContext, useContext, useReducer, useCallback, ReactNode } from 'react'

// Types for conversion state
export interface ConversionFile {
  id: string
  file: File
  name: string
  size: number
  type: string
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  result?: ConversionResult
  error?: string
}

export interface ConversionResult {
  outputUrl: string
  outputSize: number
  outputType: string
  processingTime: number
  metadata: Record<string, any>
}

export interface ProcessingOptions {
  outputFormat: string
  quality?: number
  clientSide?: boolean
  proMode?: boolean
  batchId?: string
}

export interface BatchInfo {
  id: string
  status: 'queued' | 'processing' | 'completed' | 'error'
  totalFiles: number
  completed: number
  failed: number
  progressPercentage: number
  zipUrl?: string
  results: ConversionResult[]
}

export interface ConversionState {
  files: ConversionFile[]
  currentTool?: string
  processingOptions: ProcessingOptions
  isProcessing: boolean
  userTier: 'free' | 'pro'
  batchMode: boolean
  currentBatch?: BatchInfo
}

// Action types
type ConversionAction =
  | { type: 'ADD_FILE'; payload: { file: File; toolId: string } }
  | { type: 'REMOVE_FILE'; payload: { fileId: string } }
  | { type: 'UPDATE_FILE_STATUS'; payload: { fileId: string; status: ConversionFile['status']; progress?: number } }
  | { type: 'SET_FILE_RESULT'; payload: { fileId: string; result: ConversionResult } }
  | { type: 'SET_FILE_ERROR'; payload: { fileId: string; error: string } }
  | { type: 'SET_CURRENT_TOOL'; payload: { toolId: string } }
  | { type: 'UPDATE_PROCESSING_OPTIONS'; payload: Partial<ProcessingOptions> }
  | { type: 'SET_PROCESSING'; payload: { isProcessing: boolean } }
  | { type: 'CLEAR_FILES' }
  | { type: 'SET_USER_TIER'; payload: { tier: 'free' | 'pro' } }
  | { type: 'SET_BATCH_MODE'; payload: { enabled: boolean } }
  | { type: 'SET_BATCH_INFO'; payload: { batch: BatchInfo } }
  | { type: 'UPDATE_BATCH_PROGRESS'; payload: { progress: Partial<BatchInfo> } }

// Initial state
const initialState: ConversionState = {
  files: [],
  currentTool: undefined,
  processingOptions: {
    outputFormat: '',
    quality: 80,
    clientSide: false,
    proMode: false
  },
  isProcessing: false,
  userTier: 'free',
  batchMode: false,
  currentBatch: undefined
}

// Reducer
function conversionReducer(state: ConversionState, action: ConversionAction): ConversionState {
  switch (action.type) {
    case 'ADD_FILE':
      const newFile: ConversionFile = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file: action.payload.file,
        name: action.payload.file.name,
        size: action.payload.file.size,
        type: action.payload.file.type,
        status: 'pending',
        progress: 0
      }
      return {
        ...state,
        files: [...state.files, newFile],
        currentTool: action.payload.toolId
      }

    case 'REMOVE_FILE':
      return {
        ...state,
        files: state.files.filter(file => file.id !== action.payload.fileId)
      }

    case 'UPDATE_FILE_STATUS':
      return {
        ...state,
        files: state.files.map(file =>
          file.id === action.payload.fileId
            ? { ...file, status: action.payload.status, progress: action.payload.progress ?? file.progress }
            : file
        )
      }

    case 'SET_FILE_RESULT':
      return {
        ...state,
        files: state.files.map(file =>
          file.id === action.payload.fileId
            ? { ...file, result: action.payload.result, status: 'completed', progress: 100 }
            : file
        )
      }

    case 'SET_FILE_ERROR':
      return {
        ...state,
        files: state.files.map(file =>
          file.id === action.payload.fileId
            ? { ...file, error: action.payload.error, status: 'error' }
            : file
        )
      }

    case 'SET_CURRENT_TOOL':
      return {
        ...state,
        currentTool: action.payload.toolId
      }

    case 'UPDATE_PROCESSING_OPTIONS':
      return {
        ...state,
        processingOptions: { ...state.processingOptions, ...action.payload }
      }

    case 'SET_PROCESSING':
      return {
        ...state,
        isProcessing: action.payload.isProcessing
      }

    case 'CLEAR_FILES':
      return {
        ...state,
        files: []
      }

    case 'SET_USER_TIER':
      return {
        ...state,
        userTier: action.payload.tier
      }

    case 'SET_BATCH_MODE':
      return {
        ...state,
        batchMode: action.payload.enabled,
        currentBatch: action.payload.enabled ? state.currentBatch : undefined
      }

    case 'SET_BATCH_INFO':
      return {
        ...state,
        currentBatch: action.payload.batch
      }

    case 'UPDATE_BATCH_PROGRESS':
      return {
        ...state,
        currentBatch: state.currentBatch ? {
          ...state.currentBatch,
          ...action.payload.progress
        } : undefined
      }

    default:
      return state
  }
}

// Context
const ConversionContext = createContext<{
  state: ConversionState
  dispatch: (action: ConversionAction) => void
} | null>(null)

// Provider component
interface ConversionProviderProps {
  children: ReactNode
}

export function ConversionProvider({ children }: ConversionProviderProps) {
  const [state, dispatch] = useReducer(conversionReducer, initialState)

  return (
    <ConversionContext.Provider value={{ state, dispatch }}>
      {children}
    </ConversionContext.Provider>
  )
}

// Custom hook
export function useConversion() {
  const context = useContext(ConversionContext)
  if (!context) {
    throw new Error('useConversion must be used within a ConversionProvider')
  }

  const { state, dispatch } = context

  // Helper functions
  const addFile = (file: File, toolId: string) => {
    dispatch({ type: 'ADD_FILE', payload: { file, toolId } })
  }

  const removeFile = (fileId: string) => {
    dispatch({ type: 'REMOVE_FILE', payload: { fileId } })
  }

  const updateFileStatus = (fileId: string, status: ConversionFile['status'], progress?: number) => {
    dispatch({ type: 'UPDATE_FILE_STATUS', payload: { fileId, status, progress } })
  }

  const setFileResult = (fileId: string, result: ConversionResult) => {
    dispatch({ type: 'SET_FILE_RESULT', payload: { fileId, result } })
  }

  const setFileError = (fileId: string, error: string) => {
    dispatch({ type: 'SET_FILE_ERROR', payload: { fileId, error } })
  }

  const setCurrentTool = useCallback((toolId: string) => {
    dispatch({ type: 'SET_CURRENT_TOOL', payload: { toolId } })
  }, [dispatch])

  const updateProcessingOptions = (options: Partial<ProcessingOptions>) => {
    dispatch({ type: 'UPDATE_PROCESSING_OPTIONS', payload: options })
  }

  const setProcessing = (isProcessing: boolean) => {
    dispatch({ type: 'SET_PROCESSING', payload: { isProcessing } })
  }

  const clearFiles = () => {
    dispatch({ type: 'CLEAR_FILES' })
  }

  const setUserTier = (tier: 'free' | 'pro') => {
    dispatch({ type: 'SET_USER_TIER', payload: { tier } })
  }

  const setBatchMode = (enabled: boolean) => {
    dispatch({ type: 'SET_BATCH_MODE', payload: { enabled } })
  }

  const setBatchInfo = (batch: BatchInfo) => {
    dispatch({ type: 'SET_BATCH_INFO', payload: { batch } })
  }

  const updateBatchProgress = (progress: Partial<BatchInfo>) => {
    dispatch({ type: 'UPDATE_BATCH_PROGRESS', payload: { progress } })
  }

  return {
    state,
    addFile,
    removeFile,
    updateFileStatus,
    setFileResult,
    setFileError,
    setCurrentTool,
    updateProcessingOptions,
    setProcessing,
    clearFiles,
    setUserTier,
    setBatchMode,
    setBatchInfo,
    updateBatchProgress
  }
}