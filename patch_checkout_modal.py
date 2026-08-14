import re

with open('src/pages/Checkout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add info icon to lucide-react imports
content = content.replace("AlertCircle\n}", "AlertCircle,\n  Info\n}")

# 1. State changes
state_changes = """  const [showPermissionGuide, setShowPermissionGuide] = useState(false);
  const [isLocating, setIsLocating] = useState(false);"""
content = content.replace("  const [isLocating, setIsLocating] = useState(false);", state_changes)

# 2. Logic changes for handleAutoLocate
old_locate = """  const handleAutoLocate = async () => {
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

new_locate = """  const fallbackToIP = async (reason: string) => {
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

  const executeGeolocation = () => {
    setShowPermissionGuide(false);
    setIsLocating(true);
    setLocationMessage(null);

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
  };

  const handleAutoLocate = async () => {
    if (!navigator.geolocation) {
      setIsLocating(true);
      await fallbackToIP("Browser doesn't support GPS");
      return;
    }

    try {
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        if (result.state === 'granted') {
          executeGeolocation();
        } else if (result.state === 'prompt') {
          // Check if they might be using Android where overlays block prompts
          // We can't detect overlays, but we can show a prompt beforehand to guide them
          setShowPermissionGuide(true);
        } else {
          setIsLocating(true);
          await fallbackToIP("Location permission is denied in browser settings");
        }
      } else {
        // Fallback for Safari/others without permissions API
        setShowPermissionGuide(true);
      }
    } catch (e) {
      // Fallback if query fails
      setShowPermissionGuide(true);
    }
  };"""

content = content.replace(old_locate, new_locate)

# 3. Add Modal UI
modal_ui = """      {/* Permission Guide Modal */}
      {showPermissionGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-neutral-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowPermissionGuide(false)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-black rounded-full hover:bg-neutral-100 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                <MapPin size={24} />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Location Permission</h3>
              <p className="text-sm text-neutral-600 mb-4 leading-relaxed">
                To auto-fill your address, your browser will ask for location access.
              </p>
              
              <div className="bg-amber-50 rounded-2xl p-4 text-left w-full mb-6 border border-amber-200/50">
                <div className="flex items-start space-x-2 text-amber-800">
                  <Info size={16} className="mt-0.5 shrink-0" />
                  <p className="text-xs leading-relaxed font-medium">
                    <strong className="block mb-1">Android Users:</strong> 
                    If you have a <span className="font-bold">Messenger Chat Head</span> or screen recorder floating on your screen, please <strong>close it temporarily</strong>. Android blocks permission popups if other apps are drawing over the screen.
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 w-full">
                <button
                  onClick={() => setShowPermissionGuide(false)}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-sm text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={executeGeolocation}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gateway Processing Modal */}"""

content = content.replace("      {/* Gateway Processing Modal */}", modal_ui)

with open('src/pages/Checkout.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
