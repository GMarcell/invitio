export const weddingData = {
  brand: "AreOne",
  headline: "Flight to Forever",
  couple: {
    partnerOne: "Grand Marcell",
    partnerTwo: "Beatrix Sahulata",
    display: "Grand Marcell & Beatrix",
  },
  date: {
    display: "08.07.2028",
    month: "July 2028",
    year: 2028,
    // 0-indexed month (0 = January … 11 = December)
    monthIndex: 6,
    day: 8,
  },
  destination: "Tangerang, Indonesia",
  venue: {
    name: "GPIB Yudea",
    address: "Tangerang, Banten, Indonesia",
    mapUrl: "https://maps.app.goo.gl/rH1gTTTRqHN7Hre86",
  },
  message:
    "We are thrilled to invite you to join us as we embark on the greatest adventure of our lives. Your love and support mean the world to us, and we can't wait to celebrate together in a place close to our hearts.",
  waiting:
    "Pack your bags and join us for a weekend filled with love, laughter and unforgettable memories.",
  timeline: [
    { time: "09:30", label: "Guest gathering" },
    { time: "10:00", label: "Wedding ceremony" },
    { time: "12:00", label: "Reception" },
    { time: "23:00", label: "End of evening" },
  ],
  palette: [
    { name: "Ivory", value: "#F4EFE5" },
    { name: "Cream", value: "#E7DDCA" },
    { name: "Taupe", value: "#B8AA94" },
    { name: "Navy", value: "#071827" },
    { name: "Black", value: "#111111" },
  ],
  images: {
    hero: "/images/wedding/airport.svg",
    couple: "/images/wedding/couple.svg",
    venue: "/images/wedding/venue.svg",
    women: "/images/wedding/women.svg",
    men: "/images/wedding/men.svg",
  },
  travel: {
    arrival: "Soekarno\u2013Hatta International Airport (CGK)",
    transfer: "Ride-hailing and taxi services to Tangerang city center",
    accommodation: "Hotels and guesthouses available around Tangerang",
  },
  contact: {
    email: "events@grandandbeatrix.example",
    phone: "+39 000 000 2025",
  },
} as const;
