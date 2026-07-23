export function EmojiTest() {
  return (
    <div className="p-6 bg-white rounded-2xl border border-gray-100 max-w-md mx-auto">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Emoji Flag Test</h3>
      
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🇸🇴</span>
          <span className="text-sm font-medium text-gray-700">Somalia</span>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-2xl">🇺🇸</span>
          <span className="text-sm font-medium text-gray-700">United States</span>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-2xl">🇬🇧</span>
          <span className="text-sm font-medium text-gray-700">United Kingdom</span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 mb-2">Testing with .emoji utility class:</p>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="emoji text-2xl">🇸🇴</span>
            <span className="text-sm font-medium text-gray-700">Somalia (forced)</span>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="emoji text-2xl">🇺🇸</span>
            <span className="text-sm font-medium text-gray-700">United States (forced)</span>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="emoji text-2xl">🇬🇧</span>
            <span className="text-sm font-medium text-gray-700">United Kingdom (forced)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
