import { useEffect, useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, AlertCircle, Download, RefreshCw } from 'lucide-react'
import { useConversion } from '@/contexts/ConversionContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'


interface ConversionProgressProps {
  onDownload?: (fileId: string, url: string) => void
  onRetry?: (fileId: string) => void
}

export default function ConversionProgress({ onDownload, onRetry }: ConversionProgressProps) {
  const { state } = useConversion()
  const [overallProgress, setOverallProgress] = useState(0)

  // Calculate overall progress
  useEffect(() => {
    if (state.files.length === 0) {
      setOverallProgress(0)
      return
    }

    const totalProgress = state.files.reduce((sum, file) => sum + file.progress, 0)
    const avgProgress = totalProgress / state.files.length
    setOverallProgress(avgProgress)
  }, [state.files])

  const completedFiles = state.files.filter(f => f.status === 'completed')
  const errorFiles = state.files.filter(f => f.status === 'error')
  const processingFiles = state.files.filter(f => f.status === 'processing' || f.status === 'uploading')

  if (state.files.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Conversion Progress</span>
          {state.isProcessing && (
            <RefreshCw className="h-4 w-4 animate-spin" />
          )}
        </CardTitle>
        <CardDescription>
          {completedFiles.length} of {state.files.length} files completed
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Processing Files */}
        {processingFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Currently Processing</h4>
            {processingFiles.map(file => (
              <div key={file.id} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="truncate max-w-[200px]">{file.name}</span>
                  <span>{file.progress}%</span>
                </div>
                <Progress value={file.progress} className="h-1" />
              </div>
            ))}
          </div>
        )}

        {/* Completed Files */}
        {completedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Completed ({completedFiles.length})</span>
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {completedFiles.map(file => (
                <div key={file.id} className="flex items-center justify-between p-2 bg-green-50 rounded-md">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    {file.result && (
                      <p className="text-xs text-muted-foreground">
                        Processed in {file.result.processingTime?.toFixed(1)}s
                      </p>
                    )}
                  </div>
                  {file.result?.outputUrl && onDownload && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDownload(file.id, file.result!.outputUrl)}
                      className="ml-2"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Files */}
        {errorFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span>Failed ({errorFiles.length})</span>
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {errorFiles.map(file => (
                <div key={file.id} className="flex items-center justify-between p-2 bg-red-50 rounded-md">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-red-600">{file.error}</p>
                  </div>
                  {onRetry && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRetry(file.id)}
                      className="ml-2"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Retry
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="pt-2 border-t">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="font-medium text-green-600">{completedFiles.length}</div>
              <div className="text-muted-foreground">Completed</div>
            </div>
            <div>
              <div className="font-medium text-blue-600">{processingFiles.length}</div>
              <div className="text-muted-foreground">Processing</div>
            </div>
            <div>
              <div className="font-medium text-red-600">{errorFiles.length}</div>
              <div className="text-muted-foreground">Failed</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}