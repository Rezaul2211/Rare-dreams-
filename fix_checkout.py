import re

with open('src/pages/Checkout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove showPermissionGuide from state
content = content.replace("  const [showPermissionGuide, setShowPermissionGuide] = useState(false);", "")

# 2. Replace the handleAutoLocate logic completely
old_logic_pattern = r"  const fallbackToIP = async.*?catch \(e\) \{\s*// Fallback if query fails\s*setShowPermissionGuide\(true\);\s*\}\s*\};"
new_logic = """  const handleAutoLocate = async () => {
    setIsLocating(true);
    setLocationMessage(null);

    const fallbackToIP = async (reason: string, showOverlayWarning = false) => {
      try {
        setLocationMessage({ type: 'info', text: 'Getting approximate area...' });
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        
        if (data && data.city) {
          const approxAddress = `${data.city}, ${data.region || ''}, ${data.country_name || ''}`.replace(/, ,/g, ',');
          setFormData(prev => ({ ...prev, address: approxAddress }));
          
          const warningText = showOverlayWarning 
            ? `Android Users: Close Messenger bubbles to allow GPS. We found your approximate area instead.` 
            : `${reason}. We found your approximate area.`;
            
          setLocationMessage({ type: 'warning', text: warningText });
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
        const isDenied = error.code === 1;
        let reason = isDenied ? "Location permission denied" : "Location request failed";
        if (error.code === 3) reason = "Location request timed out";
        
        await fallbackToIP(reason, isDenied);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };"""

content = re.sub(old_logic_pattern, new_logic, content, flags=re.DOTALL)

# 3. Remove the Modal UI completely
modal_pattern = r"\s*\{\/\* Permission Guide Modal \*\/\}.*?\{\/\* Gateway Processing Modal \*\/\}"
content = re.sub(modal_pattern, "\n      {/* Gateway Processing Modal */}", content, flags=re.DOTALL)

with open('src/pages/Checkout.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
