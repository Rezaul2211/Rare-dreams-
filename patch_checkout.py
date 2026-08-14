import re

with open('src/pages/Checkout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add MapPin to imports
content = content.replace("ShoppingBag,\n  RotateCcw\n}", "ShoppingBag,\n  RotateCcw,\n  MapPin\n}")

# Add state
state_code = """  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  
  const [isLocating, setIsLocating] = useState(false);

  const handleAutoLocate = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          
          if (!response.ok) throw new Error('Network response was not ok');
          const data = await response.json();
          
          if (data && data.display_name) {
            setFormData(prev => ({ ...prev, address: data.display_name }));
          } else {
            alert("Could not determine your address.");
          }
        } catch (error) {
          console.error("Error getting location:", error);
          alert("Failed to get your address. Please enter it manually.");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Please allow location access to use this feature.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };"""

content = content.replace("  const [showOrderSuccess, setShowOrderSuccess] = useState(false);\n  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);", state_code)

# Modify Address Field UI
old_address_field = """              {/* Field: Full Address */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-neutral-900 mb-1.5">
                  {'Full Delivery Address'} <span className="text-red-500">*</span>
                </label>
                <textarea 
                  name="address" """

new_address_field = """              {/* Field: Full Address */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs sm:text-sm font-bold text-neutral-900">
                    {'Full Delivery Address'} <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoLocate}
                    disabled={isLocating}
                    className="inline-flex items-center space-x-1 text-[10px] sm:text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 py-1 px-2.5 rounded-full transition-all active:scale-95 cursor-pointer shadow-xs border border-indigo-200/50"
                  >
                    {isLocating ? <Loader2 size={12} className="animate-spin" /> : <MapPin size={12} />}
                    <span>{isLocating ? 'Locating...' : 'Auto-fill Location'}</span>
                  </button>
                </div>
                <textarea 
                  name="address" """

content = content.replace(old_address_field, new_address_field)

with open('src/pages/Checkout.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
