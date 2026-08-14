import re

with open('src/pages/Checkout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add AlertCircle
content = content.replace("MapPin\n}", "MapPin,\n  AlertCircle\n}")

state_code = """  const [isLocating, setIsLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState<{type: 'error'|'success'|'info'|'warning', text: string} | null>(null);

  const handleAutoLocate = async () => {
    setIsLocating(true);
    setLocationMessage(null);

    const fallbackToIP = async (reason: string) => {
      try {
        setLocationMessage({ type: 'info', text: 'Getting approximate area...' });
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        
        if (data && data.city) {
          const approxAddress = `${data.city}, ${data.region || ''}, ${data.country_name || ''}`.replace(/, ,/g, ',');
          setFormData(prev => ({ ...prev, address: approxAddress }));
          setLocationMessage({ type: 'warning', text: `${reason}. We found your approximate area. Please add your House/Flat number manually.` });
        } else {
          setLocationMessage({ type: 'error', text: `${reason}, and approximate location also failed. Please type manually.` });
        }
      } catch (ipErr) {
        setLocationMessage({ type: 'error', text: 'Could not detect location. Please type manually.' });
      } finally {
        setIsLocating(false);
      }
    };

    if (!navigator.geolocation) {
      await fallbackToIP("Browser doesn't support GPS");
      return;
    }

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
            setLocationMessage({ type: 'success', text: 'Exact location found!' });
            setTimeout(() => setLocationMessage(null), 4000);
          } else {
            await fallbackToIP("Exact address not found from GPS");
          }
          setIsLocating(false);
        } catch (error) {
          await fallbackToIP("Network error getting exact address");
        }
      },
      async (error) => {
        console.warn("Geolocation error:", error.code, error.message);
        let reason = "Location permission blocked by device/browser";
        if (error.code === 3) reason = "Location request timed out";
        await fallbackToIP(reason);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };"""

old_state = """  const [isLocating, setIsLocating] = useState(false);

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
        console.warn("Geolocation warning:", error.code, error.message);
        
        let errorMessage = "Failed to get location.";
        if (error.code === 1) errorMessage = "Location access denied. Please allow location permissions in your browser settings.";
        else if (error.code === 2) errorMessage = "Location position unavailable.";
        else if (error.code === 3) errorMessage = "Location request timed out.";
        
        alert(errorMessage);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };"""

content = content.replace(old_state, state_code)

ui_code = """              {/* Field: Full Address */}
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
                  name="address" 
                  rows={2}
                  placeholder={'House/Flat No, Area, Thana/Upazila, District'} 
                  required 
                  autoComplete="off"
                  value={formData.address} 
                  onChange={handleChange} 
                  className="w-full bg-neutral-50/70 border border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-neutral-900/10 rounded-2xl text-sm font-medium text-neutral-900 transition-all placeholder:text-neutral-400 resize-none" 
                />
                {locationMessage && (
                  <div className={`mt-2 p-2.5 rounded-xl flex items-start space-x-2 text-xs font-medium animate-in fade-in slide-in-from-top-1 ${
                    locationMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' :
                    locationMessage.type === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                    locationMessage.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' :
                    'bg-blue-50 text-blue-700 border border-blue-100'
                  }`}>
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{locationMessage.text}</span>
                  </div>
                )}
              </div>"""

old_ui = """              {/* Field: Full Address */}
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
                  name="address" 
                  rows={2}
                  placeholder={'House/Flat No, Area, Thana/Upazila, District'} 
                  required 
                  autoComplete="off"
                  value={formData.address} 
                  onChange={handleChange} 
                  className="w-full bg-neutral-50/70 border border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-neutral-900/10 rounded-2xl text-sm font-medium text-neutral-900 transition-all placeholder:text-neutral-400 resize-none" 
                />
              </div>"""

content = content.replace(old_ui, ui_code)

with open('src/pages/Checkout.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

