import PropertyCard from '@/components/PropertyCard'

export default function Home() {
  // JUST ADD PROPERTIES HERE. EACH ONE HAS ITS OWN images ARRAY
  // LATER THIS WILL COME FROM SUPABASE
  const properties = [
    {
      id: 1,
      title: "Luxury 4 Bedroom Duplex with BQ",
      location: "Wuse 2, Abuja",
      price: "₦120,000,000",
      images: [ // ADD AS MANY AS YOU WANT. IT WILL AUTO SHOW
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80", 
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
        "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&q=80"
      ],
      type: "card" as "card",
      beds: 4, baths: 4, sqft: "4500",
      agentName: "Chinedu Okoro", agentId: "agent_1", agentImage: "https://i.pravatar.cc/100?img=12",
      whatsapp: "2348031234567", lat: 9.0820, lng: 7.4760, featured: true, initialLikes: 24
    },
    {
      id: 2,
      title: "Modern 3 Bedroom Flat",
      location: "Jabi, Abuja",
      price: "₦85,000,000",
      images: [ // 2 IMAGES ONLY. SLIDER ADAPTS AUTOMATICALLY
        "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=1200&q=80",
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80"
      ],
      type: "card" as "card",
      beds: 3, baths: 3, sqft: "2800",
      agentName: "Aisha Bello", agentId: "agent_2", agentImage: "https://i.pravatar.cc/100?img=5",
      whatsapp: "2348098765432", lat: 9.0630, lng: 7.4300, initialLikes: 120
    }
  ]

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md shadow-sm z-10">
        <div className="max-w-3xl mx-auto p-4">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">My Property Dot Come</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto py-6 space-y-8 px-4">
        {properties.map(property => (
          <PropertyCard key={property.id} {...property} />
        ))}
      </div>
    </div>
  )
}