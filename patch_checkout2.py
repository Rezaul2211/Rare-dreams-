import re

with open('src/pages/Checkout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

state_code = """  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

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

content = content.replace("  const [isOrderPlaced, setIsOrderPlaced] = useState(false);", state_code)

with open('src/pages/Checkout.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
