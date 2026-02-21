interface ProUpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  trigger: string
  toolId: string
}

export default function ProUpgradeModal({ isOpen, onClose, trigger: _trigger, toolId }: ProUpgradeModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Upgrade to Pro</h2>
        <p className="text-gray-600 mb-4">
          Unlock premium features for {toolId}
        </p>
        <div className="flex space-x-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  )
}