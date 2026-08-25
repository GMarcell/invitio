export const weddingData = {
  brand: "AreOne",
  headline: "Flight to Forever",
  couple: {
    partnerOne: "Lauren",
    partnerTwo: "Marco",
    display: "Lauren & Marco",
  },
  date: {
    display: "21.06.2025",
    month: "June 2025",
    day: 21,
  },
  destination: "Lake Como, Italy",
  venue: {
    name: "Villa Balbianello",
    address: "22016 Tremezzina (CO) Italy",
    mapUrl: "https://maps.google.com/?q=Villa%20Balbianello",
  },
  message:
    "We are thrilled to invite you to join us as we embark on the greatest adventure of our lives. Your love and support mean the world to us, and we can't wait to celebrate together in a place close to our hearts.",
  waiting:
    "Pack your bags and join us for a weekend filled with love, laughter and unforgettable memories.",
  timeline: [
    { time: "12:00", label: "Guest gathering" },
    { time: "12:30", label: "Wedding ceremony" },
    { time: "13:30", label: "Reception" },
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
    arrival: "Milan Malpensa or Linate",
    transfer: "Private boat transfer to Lenno",
    accommodation: "Grand Hotel Tremezzo and lakeside villas nearby",
  },
  contact: {
    email: "events@laurenandmarco.example",
    phone: "+39 000 000 2025",
  },
} as const;
