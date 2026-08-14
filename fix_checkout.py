import re

with open('src/pages/Checkout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_logic_pattern = r"  const handleAutoLocate = async \(\) => \{.*?\{ enableHighAccuracy: true, timeout: 8000, maximumAge: 0 \}\s*\);\s*\};"

new_logic = """  const handleAutoLocate = async () => {
    setIsLocating(true);
    setLocationMessage(null);

    const fallbackToIP = async (reason: string, showOverlayWarning = false) => {
      try {
        setLocationMessage({ type: 'info', text: 'Getting approximate area...' });
        
        let approxAddress = '';
        
        try {
          const res1 = await fetch('https://ipwho.is/');
          const data1 = await res1.json();
          if (data1 && data1.success && data1.city) {
             approxAddress = `${data1.city}, ${data1.region || ''}, ${data1.country || ''}`.replace(/, ,/g, ',');
          }
        } catch (e1) {
          // ignore and try next
        }

        if (!approxAddress) {
          const res2 = await fetch('https://ipapi.co/json/');
          const data2 = await res2.json();
          if (data2 && data2.city) {
            approxAddress = `${data2.city}, ${data2.region || ''}, ${data2.country_name || ''}`.replace(/, ,/g, ',');
          }
        }
        
        if (approxAddress) {
          setFormData(prev => ({ ...prev, address: approxAddress }));
          const warningText = showOverlayWarning 
            ? `Please close your Messenger Chat Head to allow GPS. For now, we added your approximate area.` 
            : `Added your approximate area. Please add your House/Flat number.`;
            
          setLocationMessage({ type: 'warning', text: warningText });
        } else {
          throw new Error("IP APis Failed");
        }
      } catch (ipErr) {
        const text = showOverlayWarning
          ? "Location blocked by device! Please close the floating Messenger icon on your screen and try again."
          : "Could not detect location. Please type manually.";
        setLocationMessage({ type: 'error', text });
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

with open('src/pages/Checkout.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
