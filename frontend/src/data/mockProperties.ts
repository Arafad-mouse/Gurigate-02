import type { Property } from '@/types/property';

// Mock properties data matching the Property interface
export const MOCK_PROPERTIES: Property[] = [
  {
    id: "prop_001",
    title: "Modern Downtown Apartment",
    description: "Stunning modern apartment in the heart of downtown with panoramic city views. This recently renovated unit features hardwood floors, stainless steel appliances, and floor-to-ceiling windows. Perfect for professionals seeking urban convenience with luxury amenities.",
    type: "apartment",
    status: "available",
    address: {
      street: "123 Main Street",
      city: "New York",
      state: "NY",
      postal_code: "10001",
      country: "United States"
    },
    pricing: {
      base_price: 250000,
      currency: "USD",
      pricing_type: "sale",
      security_deposit: 5000,
      cleaning_fee: 200,
      service_fee: 150
    },
    features: {
      bedrooms: 2,
      bathrooms: 2,
      max_guests: 4,
      square_feet: 1200,
      amenities: ["WiFi", "Air Conditioning", "Kitchen", "Parking", "Gym", "Elevator"],
      rules: ["No smoking", "No parties", "Quiet hours"]
    },
    images: [
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80"
    ],
    owner_id: "user_001",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z"
  },
  {
    id: "prop_002",
    title: "Luxury Villa with Pool",
    description: "Exclusive villa offering the ultimate in luxury living. This stunning property features a private pool, expansive gardens, and state-of-the-art smart home technology. Located in a prestigious neighborhood with 24/7 security and concierge services.",
    type: "villa",
    status: "occupied",
    address: {
      street: "456 Ocean Drive",
      city: "Miami Beach",
      state: "FL",
      postal_code: "33139",
      country: "United States"
    },
    pricing: {
      base_price: 850,
      currency: "USD",
      pricing_type: "nightly",
      security_deposit: 2000,
      cleaning_fee: 300,
      service_fee: 100
    },
    features: {
      bedrooms: 5,
      bathrooms: 4,
      max_guests: 10,
      square_feet: 3500,
      amenities: ["WiFi", "Air Conditioning", "Kitchen", "Parking", "Pool", "Gym", "Garden", "Security System"],
      rules: ["No smoking", "No parties", "Check-in after 3 PM", "Additional fees for extra guests"]
    },
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80"
    ],
    owner_id: "user_001",
    created_at: "2024-01-10T14:20:00Z",
    updated_at: "2024-01-20T09:15:00Z"
  },
  {
    id: "prop_003",
    title: "Cozy Studio Loft",
    description: "Charming studio loft in historic building with exposed brick walls and high ceilings. This efficiently designed space maximizes every square foot with custom built-in storage and modern finishes. Perfect for city dwellers who appreciate character and convenience.",
    type: "studio",
    status: "available",
    address: {
      street: "789 Artist Alley",
      city: "San Francisco",
      state: "CA",
      postal_code: "94102",
      country: "United States"
    },
    pricing: {
      base_price: 180,
      currency: "USD",
      pricing_type: "nightly",
      security_deposit: 1000,
      cleaning_fee: 150,
      service_fee: 75
    },
    features: {
      bedrooms: 0,
      bathrooms: 1,
      max_guests: 2,
      square_feet: 650,
      amenities: ["WiFi", "Kitchen", "Workspace", "Elevator"],
      rules: ["No smoking", "Quiet hours", "No unregistered guests"]
    },
    images: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&q=80"
    ],
    owner_id: "user_001",
    created_at: "2024-02-01T11:45:00Z",
    updated_at: "2024-02-01T11:45:00Z"
  },
  {
    id: "prop_004",
    title: "Suburban Family Home",
    description: "Spacious family home located in quiet suburban neighborhood with excellent schools nearby. This well-maintained property features large backyard, modern kitchen, and plenty of storage. Perfect for families seeking space and community.",
    type: "house",
    status: "maintenance",
    address: {
      street: "321 Maple Avenue",
      city: "Austin",
      state: "TX",
      postal_code: "78701",
      country: "United States"
    },
    pricing: {
      base_price: 3200,
      currency: "USD",
      pricing_type: "monthly",
      security_deposit: 3200,
      cleaning_fee: 250,
      service_fee: 200
    },
    features: {
      bedrooms: 4,
      bathrooms: 3,
      max_guests: 8,
      square_feet: 2400,
      amenities: ["WiFi", "Air Conditioning", "Kitchen", "Parking", "Laundry", "TV", "Pet Friendly", "Garden"],
      rules: ["No smoking", "No parties", "Check-out before 11 AM", "Respect neighbors"]
    },
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80"
    ],
    owner_id: "user_001",
    created_at: "2023-12-15T16:30:00Z",
    updated_at: "2024-01-25T13:20:00Z"
  },
  {
    id: "prop_005",
    title: "Beachfront Condo",
    description: "Stunning beachfront condominium with direct ocean access and breathtaking views. This luxury unit features premium finishes, private balcony, and resort-style amenities including beach access and pool service.",
    type: "condo",
    status: "available",
    address: {
      street: "555 Coastal Highway",
      city: "Malibu",
      state: "CA",
      postal_code: "90265",
      country: "United States"
    },
    pricing: {
      base_price: 450000,
      currency: "USD",
      pricing_type: "sale",
      security_deposit: 10000,
      cleaning_fee: 500,
      service_fee: 300
    },
    features: {
      bedrooms: 3,
      bathrooms: 2,
      max_guests: 6,
      square_feet: 1800,
      amenities: ["WiFi", "Air Conditioning", "Kitchen", "Parking", "Pool", "Balcony", "Elevator"],
      rules: ["No smoking", "No parties", "Quiet hours", "Wheelchair Accessible"]
    },
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80"
    ],
    owner_id: "user_001",
    created_at: "2024-02-10T08:15:00Z",
    updated_at: "2024-02-10T08:15:00Z"
  },
  {
    id: "prop_006",
    title: "Mountain View Townhouse",
    description: "Elegant townhouse with spectacular mountain views and modern amenities. This property features open-concept living, gourmet kitchen, and master suite with private balcony. Located in desirable community with hiking trails nearby.",
    type: "townhouse",
    status: "pending",
    address: {
      street: "888 Summit Road",
      city: "Denver",
      state: "CO",
      postal_code: "80202",
      country: "United States"
    },
    pricing: {
      base_price: 2800,
      currency: "USD",
      pricing_type: "monthly",
      security_deposit: 2800,
      cleaning_fee: 200,
      service_fee: 175
    },
    features: {
      bedrooms: 3,
      bathrooms: 2,
      max_guests: 6,
      square_feet: 1600,
      amenities: ["WiFi", "Air Conditioning", "Kitchen", "Parking", "Laundry", "Workspace", "Balcony"],
      rules: ["No smoking", "No parties", "Check-in after 3 PM", "No commercial photography"]
    },
    images: [
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&q=80"
    ],
    owner_id: "user_001",
    created_at: "2024-02-05T12:00:00Z",
    updated_at: "2024-02-05T12:00:00Z"
  },
  {
    id: "prop_007",
    title: "Historic Cottage",
    description: "Charming historic cottage with original character and modern updates. This cozy retreat features exposed beams, fireplace, and lovely garden. Perfect for those seeking tranquility while maintaining proximity to urban amenities.",
    type: "cottage",
    status: "available",
    address: {
      street: "999 Heritage Lane",
      city: "Charleston",
      state: "SC",
      postal_code: "29401",
      country: "United States"
    },
    pricing: {
      base_price: 2200,
      currency: "USD",
      pricing_type: "monthly",
      security_deposit: 2200,
      cleaning_fee: 175,
      service_fee: 150
    },
    features: {
      bedrooms: 2,
      bathrooms: 1,
      max_guests: 4,
      square_feet: 900,
      amenities: ["WiFi", "Kitchen", "Parking", "Garden", "Pet Friendly"],
      rules: ["No smoking", "Quiet hours", "Respect neighbors", "Additional fees for extra guests"]
    },
    images: [
      "https://images.unsplash.com/photo-1564013799918-ab600023f31f?w=400&q=80"
    ],
    owner_id: "user_001",
    created_at: "2024-01-20T15:30:00Z",
    updated_at: "2024-01-20T15:30:00Z"
  },
  {
    id: "prop_008",
    title: "Urban Penthouse",
    description: "Luxurious penthouse offering panoramic city views from floor-to-ceiling windows. This exclusive top-floor residence features private elevator, rooftop terrace, and premium finishes throughout. Ultimate urban living with unmatched privacy and views.",
    type: "penthouse",
    status: "available",
    address: {
      street: "777 Sky Tower",
      city: "Chicago",
      state: "IL",
      postal_code: "60601",
      country: "United States"
    },
    pricing: {
      base_price: 750000,
      currency: "USD",
      pricing_type: "sale",
      security_deposit: 15000,
      cleaning_fee: 600,
      service_fee: 400
    },
    features: {
      bedrooms: 4,
      bathrooms: 3,
      max_guests: 8,
      square_feet: 2800,
      amenities: ["WiFi", "Air Conditioning", "Kitchen", "Parking", "Gym", "Elevator", "Balcony", "Security System"],
      rules: ["No smoking", "No parties", "Check-in after 3 PM", "Wheelchair Accessible"]
    },
    images: [
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&q=80"
    ],
    owner_id: "user_001",
    created_at: "2024-02-15T09:00:00Z",
    updated_at: "2024-02-15T09:00:00Z"
  }
];

// Helper function to filter properties by timeframe
export const filterPropertiesByTimeframe = (properties: Property[], timeframe: string): Property[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  
  switch (timeframe) {
    case 'today':
      return properties.filter(p => {
        const createdDate = new Date(p.created_at);
        return createdDate >= today;
      });
      
    case '7days':
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return properties.filter(p => {
        const createdDate = new Date(p.created_at);
        return createdDate >= sevenDaysAgo;
      });
      
    case '30days':
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return properties.filter(p => {
        const createdDate = new Date(p.created_at);
        return createdDate >= thirtyDaysAgo;
      });
      
    case 'lastmonth':
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      return properties.filter(p => {
        const createdDate = new Date(p.created_at);
        return createdDate >= lastMonth && createdDate < thisMonth;
      });
      
    case '3months':
      const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      return properties.filter(p => {
        const createdDate = new Date(p.created_at);
        return createdDate >= threeMonthsAgo;
      });
      
    case 'all':
    default:
      return properties;
  }
};
