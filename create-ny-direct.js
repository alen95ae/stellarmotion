// Using native fetch

const API_URL = 'http://localhost:3000/api/soportes';
const partnerId = "cmfsnu4jx0004sj2tkqtvzwu9";

// Coordenadas de diferentes zonas de Nueva York
const nyLocations = [
  { name: "Times Square", lat: 40.7580, lng: -73.9855 },
  { name: "Central Park", lat: 40.7829, lng: -73.9654 },
  { name: "Brooklyn Bridge", lat: 40.7061, lng: -73.9969 },
  { name: "Wall Street", lat: 40.7074, lng: -74.0113 },
  { name: "Statue of Liberty", lat: 40.6892, lng: -74.0445 },
  { name: "Empire State Building", lat: 40.7484, lng: -73.9857 },
  { name: "One World Trade Center", lat: 40.7127, lng: -74.0134 },
  { name: "High Line", lat: 40.7480, lng: -74.0048 },
  { name: "Chelsea Market", lat: 40.7420, lng: -74.0062 },
  { name: "SoHo", lat: 40.7230, lng: -74.0030 },
  { name: "Williamsburg", lat: 40.7081, lng: -73.9571 },
  { name: "Long Island City", lat: 40.7505, lng: -73.9376 },
  { name: "Astoria", lat: 40.7648, lng: -73.9442 },
  { name: "Flushing", lat: 40.7677, lng: -73.8334 },
  { name: "Jamaica", lat: 40.6892, lng: -73.8056 },
  { name: "Bronx Zoo", lat: 40.8506, lng: -73.8775 },
  { name: "Yankee Stadium", lat: 40.8296, lng: -73.9262 },
  { name: "Coney Island", lat: 40.5755, lng: -73.9707 },
  { name: "JFK Airport", lat: 40.6413, lng: -73.7781 },
  { name: "LaGuardia Airport", lat: 40.7769, lng: -73.8740 },
  { name: "Staten Island Ferry", lat: 40.6432, lng: -74.0776 },
  { name: "Governors Island", lat: 40.6919, lng: -74.0171 },
  { name: "Roosevelt Island", lat: 40.7614, lng: -73.9776 },
  { name: "Red Hook", lat: 40.6743, lng: -74.0112 },
  { name: "DUMBO", lat: 40.7033, lng: -73.9888 }
];

// Categorías disponibles
const categories = [
  { id: "cmfsnu6or0008sj2trwz9fj3v", slug: "carteleras", label: "Carteleras" },
  { id: "cmfsnu6pb000bsj2t6dxfxmex", slug: "displays", label: "Displays" },
  { id: "cmfsnu6pb000asj2t3rvvs4d2", slug: "mupis", label: "Mupis" },
  { id: "cmfsnu6p30009sj2t9w5w9on4", slug: "pantallas", label: "Pantallas" },
  { id: "cmfsnu5yy0007sj2tnwtfpi6w", slug: "vallas", label: "Vallas" }
];

// Tipos de soportes por categoría
const supportTypes = {
  "carteleras": ["Cartelera", "Billboard", "Poster Board"],
  "displays": ["Display LED", "Display Digital", "Display Interactivo"],
  "mupis": ["Mupi", "Bus Stop", "Metro Display"],
  "pantallas": ["Pantalla LED", "Video Wall", "Smart Screen"],
  "vallas": ["Valla Publicitaria", "Highway Billboard", "Mega Valla"]
};

async function createSupport(supportData) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(supportData),
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Created: ${supportData.title}`);
      return result;
    } else {
      const error = await response.text();
      console.error(`❌ Failed to create ${supportData.title}:`, error);
    }
  } catch (error) {
    console.error(`❌ Error creating ${supportData.title}:`, error.message);
  }
}

async function createAllSupports() {
  console.log('🚀 Starting creation of 25 New York supports...\n');
  
  for (let i = 0; i < 25; i++) {
    const location = nyLocations[i];
    const categoryIndex = i % categories.length;
    const category = categories[categoryIndex];
    const types = supportTypes[category.slug];
    const type = types[i % types.length];
    
    // Variar ligeramente las coordenadas para evitar superposición
    const lat = location.lat + (Math.random() - 0.5) * 0.01;
    const lng = location.lng + (Math.random() - 0.5) * 0.01;
    
    // Dimensiones variadas según el tipo
    const dimensions = [
      { width: 3, height: 2 },
      { width: 4, height: 3 },
      { width: 6, height: 4 },
      { width: 8, height: 6 },
      { width: 10, height: 4 },
      { width: 12, height: 8 }
    ];
    const dim = dimensions[i % dimensions.length];
    
    const supportData = {
      title: `${type} ${location.name}`,
      type: type,
      city: "New York",
      country: "USA",
      latitude: lat,
      longitude: lng,
      googleMapsLink: `https://maps.google.com/?q=${lat},${lng}`,
      address: `Near ${location.name}, New York, NY`,
      priceMonth: Math.floor(Math.random() * 2000) + 500,
      available: true,
      status: Math.random() > 0.8 ? 'OCUPADO' : 'DISPONIBLE',
      partnerId: partnerId,
      dimensions: `${dim.width}.0×${dim.height}.0 m`,
      widthM: dim.width,
      heightM: dim.height,
      dailyImpressions: Math.floor(Math.random() * 50000) + 10000,
      lighting: Math.random() > 0.4,
      tags: `new-york, ${location.name.toLowerCase().replace(/\s+/g, '-')}, usa, premium`,
      shortDescription: `Premium ${type.toLowerCase()} located near ${location.name}`,
      description: `High-visibility ${type.toLowerCase()} in one of New York's most iconic locations. Perfect for reaching diverse audiences in the heart of the city.`,
      featured: Math.random() > 0.8,
      printingCost: Math.floor(Math.random() * 200) + 50,
      categoryId: category.id,
      code: `NY-${String(i + 1).padStart(3, '0')}`
    };
    
    await createSupport(supportData);
    
    // Pequeña pausa entre creaciones
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log('\n🎉 Finished creating all New York supports!');
}

createAllSupports().catch(console.error);
