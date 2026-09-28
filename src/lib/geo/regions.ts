export interface DistrictInfo {
  name: string;
  slug: string;
  rtoCode?: string;
  zone?: string;
}

export interface StateInfo {
  name: string;
  slug: string;
  capital: string;
  districts: DistrictInfo[];
}

export const INDIAN_REGIONS: StateInfo[] = [
  {
    name: 'Andhra Pradesh',
    slug: 'andhra-pradesh',
    capital: 'Amaravati',
    districts: [
      { name: 'Visakhapatnam', slug: 'visakhapatnam', rtoCode: 'AP-31', zone: 'Coastal Andhra' },
      { name: 'Vijayawada (NTR)', slug: 'vijayawada', rtoCode: 'AP-16', zone: 'Krishna' },
      { name: 'Guntur', slug: 'guntur', rtoCode: 'AP-07', zone: 'Coastal Andhra' },
      { name: 'Nellore', slug: 'nellore', rtoCode: 'AP-26', zone: 'South Coastal' },
      { name: 'Kurnool', slug: 'kurnool', rtoCode: 'AP-21', zone: 'Rayalaseema' },
    ],
  },
  {
    name: 'Arunachal Pradesh',
    slug: 'arunachal-pradesh',
    capital: 'Itanagar',
    districts: [
      { name: 'Itanagar (Papum Pare)', slug: 'itanagar', rtoCode: 'AR-01', zone: 'Capital Complex' },
      { name: 'Naharlagun', slug: 'naharlagun', rtoCode: 'AR-02', zone: 'Capital Region' },
      { name: 'Pasighat (East Siang)', slug: 'pasighat', rtoCode: 'AR-09', zone: 'Eastern' },
      { name: 'Tawang', slug: 'tawang', rtoCode: 'AR-03', zone: 'Western' },
      { name: 'Ziro (Lower Subansiri)', slug: 'ziro', rtoCode: 'AR-04', zone: 'Central' },
    ],
  },
  {
    name: 'Assam',
    slug: 'assam',
    capital: 'Dispur',
    districts: [
      { name: 'Guwahati (Kamrup Metro)', slug: 'guwahati', rtoCode: 'AS-01', zone: 'Lower Assam' },
      { name: 'Silchar (Cachar)', slug: 'silchar', rtoCode: 'AS-11', zone: 'Barak Valley' },
      { name: 'Dibrugarh', slug: 'dibrugarh', rtoCode: 'AS-06', zone: 'Upper Assam' },
      { name: 'Jorhat', slug: 'jorhat', rtoCode: 'AS-03', zone: 'Upper Assam' },
      { name: 'Nagaon', slug: 'nagaon', rtoCode: 'AS-02', zone: 'Central Assam' },
    ],
  },
  {
    name: 'Bihar',
    slug: 'bihar',
    capital: 'Patna',
    districts: [
      { name: 'Patna', slug: 'patna', rtoCode: 'BR-01', zone: 'Central Bihar' },
      { name: 'Gaya', slug: 'gaya', rtoCode: 'BR-02', zone: 'Magadh' },
      { name: 'Muzaffarpur', slug: 'muzaffarpur', rtoCode: 'BR-06', zone: 'Tirhut' },
      { name: 'Bhagalpur', slug: 'bhagalpur', rtoCode: 'BR-10', zone: 'Anga' },
      { name: 'Purnia', slug: 'purnia', rtoCode: 'BR-11', zone: 'Kosi-Seemanchal' },
    ],
  },
  {
    name: 'Chhattisgarh',
    slug: 'chhattisgarh',
    capital: 'Raipur',
    districts: [
      { name: 'Raipur', slug: 'raipur', rtoCode: 'CG-04', zone: 'Central' },
      { name: 'Bhilai (Durg)', slug: 'bhilai', rtoCode: 'CG-07', zone: 'Durg Division' },
      { name: 'Bilaspur', slug: 'bilaspur', rtoCode: 'CG-10', zone: 'Bilaspur Division' },
      { name: 'Korba', slug: 'korba', rtoCode: 'CG-12', zone: 'Industrial Belt' },
      { name: 'Rajnandgaon', slug: 'rajnandgaon', rtoCode: 'CG-08', zone: 'Western' },
    ],
  },
  {
    name: 'Delhi NCR',
    slug: 'delhi',
    capital: 'New Delhi',
    districts: [
      { name: 'New Delhi', slug: 'new-delhi', rtoCode: 'DL-01', zone: 'Central/South' },
      { name: 'Janakpuri (West Delhi)', slug: 'janakpuri', rtoCode: 'DL-04', zone: 'West' },
      { name: 'Rohini (North West Delhi)', slug: 'rohini', rtoCode: 'DL-08', zone: 'North West' },
      { name: 'Mayur Vihar (East Delhi)', slug: 'mayur-vihar', rtoCode: 'DL-07', zone: 'East' },
      { name: 'Dwarka (South West Delhi)', slug: 'dwarka', rtoCode: 'DL-09', zone: 'South West' },
    ],
  },
  {
    name: 'Goa',
    slug: 'goa',
    capital: 'Panaji',
    districts: [
      { name: 'Panaji (North Goa)', slug: 'panaji', rtoCode: 'GA-07', zone: 'Tiswadi' },
      { name: 'Margao (South Goa)', slug: 'margao', rtoCode: 'GA-08', zone: 'Salcete' },
      { name: 'Vasco da Gama', slug: 'vasco-da-gama', rtoCode: 'GA-06', zone: 'Mormugao' },
      { name: 'Mapusa', slug: 'mapusa', rtoCode: 'GA-03', zone: 'Bardez' },
      { name: 'Ponda', slug: 'ponda', rtoCode: 'GA-05', zone: 'Central Goa' },
    ],
  },
  {
    name: 'Gujarat',
    slug: 'gujarat',
    capital: 'Gandhinagar',
    districts: [
      { name: 'Ahmedabad', slug: 'ahmedabad', rtoCode: 'GJ-01', zone: 'Central Gujarat' },
      { name: 'Surat', slug: 'surat', rtoCode: 'GJ-05', zone: 'South Gujarat' },
      { name: 'Vadodara', slug: 'vadodara', rtoCode: 'GJ-06', zone: 'Central Gujarat' },
      { name: 'Rajkot', slug: 'rajkot', rtoCode: 'GJ-03', zone: 'Saurashtra' },
      { name: 'Bhavnagar', slug: 'bhavnagar', rtoCode: 'GJ-04', zone: 'Saurashtra' },
    ],
  },
  {
    name: 'Haryana',
    slug: 'haryana',
    capital: 'Chandigarh',
    districts: [
      { name: 'Gurugram', slug: 'gurugram', rtoCode: 'HR-26', zone: 'NCR' },
      { name: 'Faridabad', slug: 'faridabad', rtoCode: 'HR-38', zone: 'NCR' },
      { name: 'Panipat', slug: 'panipat', rtoCode: 'HR-06', zone: 'Karnal Division' },
      { name: 'Ambala', slug: 'ambala', rtoCode: 'HR-01', zone: 'Northern' },
      { name: 'Karnal', slug: 'karnal', rtoCode: 'HR-05', zone: 'Central' },
    ],
  },
  {
    name: 'Himachal Pradesh',
    slug: 'himachal-pradesh',
    capital: 'Shimla',
    districts: [
      { name: 'Shimla', slug: 'shimla', rtoCode: 'HP-03', zone: 'Shimla Division' },
      { name: 'Dharamshala (Kangra)', slug: 'dharamshala', rtoCode: 'HP-68', zone: 'Kangra' },
      { name: 'Mandi', slug: 'mandi', rtoCode: 'HP-33', zone: 'Central' },
      { name: 'Solan', slug: 'solan', rtoCode: 'HP-14', zone: 'Southern' },
      { name: 'Kullu', slug: 'kullu', rtoCode: 'HP-34', zone: 'Valley' },
    ],
  },
  {
    name: 'Jharkhand',
    slug: 'jharkhand',
    capital: 'Ranchi',
    districts: [
      { name: 'Ranchi', slug: 'ranchi', rtoCode: 'JH-01', zone: 'South Chotanagpur' },
      { name: 'Jamshedpur (East Singhbhum)', slug: 'jamshedpur', rtoCode: 'JH-05', zone: 'Kolhan' },
      { name: 'Dhanbad', slug: 'dhanbad', rtoCode: 'JH-10', zone: 'North Chotanagpur' },
      { name: 'Bokaro', slug: 'bokaro', rtoCode: 'JH-09', zone: 'Industrial Belt' },
      { name: 'Deoghar', slug: 'deoghar', rtoCode: 'JH-15', zone: 'Santhal Pargana' },
    ],
  },
  {
    name: 'Karnataka',
    slug: 'karnataka',
    capital: 'Bengaluru',
    districts: [
      { name: 'Bengaluru Urban', slug: 'bengaluru', rtoCode: 'KA-01', zone: 'Bangalore Metro' },
      { name: 'Mysuru', slug: 'mysuru', rtoCode: 'KA-09', zone: 'Southern' },
      { name: 'Hubballi-Dharwad', slug: 'hubballi', rtoCode: 'KA-25', zone: 'North Karnataka' },
      { name: 'Mangaluru (Dakshina Kannada)', slug: 'mangaluru', rtoCode: 'KA-19', zone: 'Coastal Karnataka' },
      { name: 'Belagavi', slug: 'belagavi', rtoCode: 'KA-22', zone: 'North Western' },
    ],
  },
  {
    name: 'Kerala',
    slug: 'kerala',
    capital: 'Thiruvananthapuram',
    districts: [
      { name: 'Thiruvananthapuram', slug: 'thiruvananthapuram', rtoCode: 'KL-01', zone: 'Southern' },
      { name: 'Kochi (Ernakulam)', slug: 'kochi', rtoCode: 'KL-07', zone: 'Central' },
      { name: 'Kozhikode', slug: 'kozhikode', rtoCode: 'KL-11', zone: 'Malabar' },
      { name: 'Thrissur', slug: 'thrissur', rtoCode: 'KL-08', zone: 'Central' },
      { name: 'Kollam', slug: 'kollam', rtoCode: 'KL-02', zone: 'Southern' },
    ],
  },
  {
    name: 'Madhya Pradesh',
    slug: 'madhya-pradesh',
    capital: 'Bhopal',
    districts: [
      { name: 'Indore', slug: 'indore', rtoCode: 'MP-09', zone: 'Malwa' },
      { name: 'Bhopal', slug: 'bhopal', rtoCode: 'MP-04', zone: 'Bhopal Division' },
      { name: 'Jabalpur', slug: 'jabalpur', rtoCode: 'MP-20', zone: 'Mahakoshal' },
      { name: 'Gwalior', slug: 'gwalior', rtoCode: 'MP-07', zone: 'Chambal-Gwalior' },
      { name: 'Ujjain', slug: 'ujjain', rtoCode: 'MP-13', zone: 'Malwa' },
    ],
  },
  {
    name: 'Maharashtra',
    slug: 'maharashtra',
    capital: 'Mumbai',
    districts: [
      { name: 'Mumbai', slug: 'mumbai', rtoCode: 'MH-01', zone: 'Konkan Metro' },
      { name: 'Pune', slug: 'pune', rtoCode: 'MH-12', zone: 'Western Maharashtra' },
      { name: 'Nagpur', slug: 'nagpur', rtoCode: 'MH-31', zone: 'Vidarbha' },
      { name: 'Thane', slug: 'thane', rtoCode: 'MH-04', zone: 'Konkan' },
      { name: 'Nashik', slug: 'nashik', rtoCode: 'MH-15', zone: 'North Maharashtra' },
    ],
  },
  {
    name: 'Manipur',
    slug: 'manipur',
    capital: 'Imphal',
    districts: [
      { name: 'Imphal West', slug: 'imphal-west', rtoCode: 'MN-01', zone: 'Central Valley' },
      { name: 'Imphal East', slug: 'imphal-east', rtoCode: 'MN-06', zone: 'Central Valley' },
      { name: 'Churachandpur', slug: 'churachandpur', rtoCode: 'MN-02', zone: 'Southern Hills' },
      { name: 'Thoubal', slug: 'thoubal', rtoCode: 'MN-04', zone: 'Valley' },
      { name: 'Bishnupur', slug: 'bishnupur', rtoCode: 'MN-05', zone: 'Valley' },
    ],
  },
  {
    name: 'Meghalaya',
    slug: 'meghalaya',
    capital: 'Shillong',
    districts: [
      { name: 'Shillong (East Khasi Hills)', slug: 'shillong', rtoCode: 'ML-05', zone: 'Khasi Hills' },
      { name: 'Tura (West Garo Hills)', slug: 'tura', rtoCode: 'ML-08', zone: 'Garo Hills' },
      { name: 'Jowai (West Jaintia Hills)', slug: 'jowai', rtoCode: 'ML-04', zone: 'Jaintia Hills' },
      { name: 'Nongpoh (Ri-Bhoi)', slug: 'nongpoh', rtoCode: 'ML-10', zone: 'Northern' },
      { name: 'Baghmara (South Garo Hills)', slug: 'baghmara', rtoCode: 'ML-09', zone: 'Southern Garo' },
    ],
  },
  {
    name: 'Mizoram',
    slug: 'mizoram',
    capital: 'Aizawl',
    districts: [
      { name: 'Aizawl', slug: 'aizawl', rtoCode: 'MZ-01', zone: 'Northern Mizoram' },
      { name: 'Lunglei', slug: 'lunglei', rtoCode: 'MZ-02', zone: 'Southern Mizoram' },
      { name: 'Champhai', slug: 'champhai', rtoCode: 'MZ-04', zone: 'Eastern' },
      { name: 'Serchhip', slug: 'serchhip', rtoCode: 'MZ-06', zone: 'Central' },
      { name: 'Kolasib', slug: 'kolasib', rtoCode: 'MZ-05', zone: 'Northern' },
    ],
  },
  {
    name: 'Nagaland',
    slug: 'nagaland',
    capital: 'Kohima',
    districts: [
      { name: 'Kohima', slug: 'kohima', rtoCode: 'NL-01', zone: 'Southern' },
      { name: 'Dimapur', slug: 'dimapur', rtoCode: 'NL-07', zone: 'Commercial Hub' },
      { name: 'Mokokchung', slug: 'mokokchung', rtoCode: 'NL-02', zone: 'Central' },
      { name: 'Tuensang', slug: 'tuensang', rtoCode: 'NL-03', zone: 'Eastern' },
      { name: 'Wokha', slug: 'wokha', rtoCode: 'NL-05', zone: 'Western' },
    ],
  },
  {
    name: 'Odisha',
    slug: 'odisha',
    capital: 'Bhubaneswar',
    districts: [
      { name: 'Bhubaneswar (Khurda)', slug: 'bhubaneswar', rtoCode: 'OD-02', zone: 'Coastal Odisha' },
      { name: 'Cuttack', slug: 'cuttack', rtoCode: 'OD-05', zone: 'Central' },
      { name: 'Rourkela (Sundargarh)', slug: 'rourkela', rtoCode: 'OD-14', zone: 'Northern' },
      { name: 'Berhampur (Ganjam)', slug: 'berhampur', rtoCode: 'OD-07', zone: 'Southern' },
      { name: 'Sambalpur', slug: 'sambalpur', rtoCode: 'OD-15', zone: 'Western Odisha' },
    ],
  },
  {
    name: 'Punjab',
    slug: 'punjab',
    capital: 'Chandigarh',
    districts: [
      { name: 'Ludhiana', slug: 'ludhiana', rtoCode: 'PB-10', zone: 'Malwa' },
      { name: 'Amritsar', slug: 'amritsar', rtoCode: 'PB-02', zone: 'Majha' },
      { name: 'Jalandhar', slug: 'jalandhar', rtoCode: 'PB-08', zone: 'Doaba' },
      { name: 'Patiala', slug: 'patiala', rtoCode: 'PB-11', zone: 'Malwa' },
      { name: 'Bathinda', slug: 'bathinda', rtoCode: 'PB-03', zone: 'Southern Malwa' },
    ],
  },
  {
    name: 'Rajasthan',
    slug: 'rajasthan',
    capital: 'Jaipur',
    districts: [
      { name: 'Jaipur', slug: 'jaipur', rtoCode: 'RJ-14', zone: 'Dhundhar' },
      { name: 'Jodhpur', slug: 'jodhpur', rtoCode: 'RJ-19', zone: 'Marwar' },
      { name: 'Kota', slug: 'kota', rtoCode: 'RJ-20', zone: 'Hadoti' },
      { name: 'Bikaner', slug: 'bikaner', rtoCode: 'RJ-07', zone: 'Thar' },
      { name: 'Udaipur', slug: 'udaipur', rtoCode: 'RJ-27', zone: 'Mewar' },
    ],
  },
  {
    name: 'Sikkim',
    slug: 'sikkim',
    capital: 'Gangtok',
    districts: [
      { name: 'Gangtok (East Sikkim)', slug: 'gangtok', rtoCode: 'SK-01', zone: 'East Sikkim' },
      { name: 'Namchi (South Sikkim)', slug: 'namchi', rtoCode: 'SK-02', zone: 'South Sikkim' },
      { name: 'Geyzing (West Sikkim)', slug: 'geyzing', rtoCode: 'SK-03', zone: 'West Sikkim' },
      { name: 'Mangan (North Sikkim)', slug: 'mangan', rtoCode: 'SK-04', zone: 'North Sikkim' },
      { name: 'Pakyong', slug: 'pakyong', rtoCode: 'SK-07', zone: 'East Sikkim' },
    ],
  },
  {
    name: 'Tamil Nadu',
    slug: 'tamil-nadu',
    capital: 'Chennai',
    districts: [
      { name: 'Chennai', slug: 'chennai', rtoCode: 'TN-01', zone: 'Northern Metro' },
      { name: 'Coimbatore', slug: 'coimbatore', rtoCode: 'TN-37', zone: 'Kongu Nadu' },
      { name: 'Madurai', slug: 'madurai', rtoCode: 'TN-58', zone: 'Pandya Nadu' },
      { name: 'Tiruchirappalli', slug: 'tiruchirappalli', rtoCode: 'TN-45', zone: 'Central' },
      { name: 'Salem', slug: 'salem', rtoCode: 'TN-30', zone: 'Kongu' },
    ],
  },
  {
    name: 'Telangana',
    slug: 'telangana',
    capital: 'Hyderabad',
    districts: [
      { name: 'Hyderabad', slug: 'hyderabad', rtoCode: 'TS-09', zone: 'Capital Metro' },
      { name: 'Warangal', slug: 'warangal', rtoCode: 'TS-03', zone: 'Northern' },
      { name: 'Nizamabad', slug: 'nizamabad', rtoCode: 'TS-16', zone: 'Northern' },
      { name: 'Karimnagar', slug: 'karimnagar', rtoCode: 'TS-02', zone: 'North Central' },
      { name: 'Khammam', slug: 'khammam', rtoCode: 'TS-04', zone: 'Eastern' },
    ],
  },
  {
    name: 'Tripura',
    slug: 'tripura',
    capital: 'Agartala',
    districts: [
      { name: 'Agartala (West Tripura)', slug: 'agartala', rtoCode: 'TR-01', zone: 'West Tripura' },
      { name: 'Udaipur (Gomati)', slug: 'udaipur', rtoCode: 'TR-03', zone: 'South Tripura' },
      { name: 'Dharmanagar (North Tripura)', slug: 'dharmanagar', rtoCode: 'TR-05', zone: 'North Tripura' },
      { name: 'Kailashahar (Unakoti)', slug: 'kailashahar', rtoCode: 'TR-04', zone: 'North East' },
      { name: 'Ambassa (Dhalai)', slug: 'ambassa', rtoCode: 'TR-06', zone: 'Central' },
    ],
  },
  {
    name: 'Uttar Pradesh',
    slug: 'uttar-pradesh',
    capital: 'Lucknow',
    districts: [
      { name: 'Lucknow', slug: 'lucknow', rtoCode: 'UP-32', zone: 'Awadh' },
      { name: 'Kanpur Nagar', slug: 'kanpur', rtoCode: 'UP-78', zone: 'Central' },
      { name: 'Varanasi', slug: 'varanasi', rtoCode: 'UP-65', zone: 'Purvanchal' },
      { name: 'Agra', slug: 'agra', rtoCode: 'UP-80', zone: 'Braj' },
      { name: 'Prayagraj (Allahabad)', slug: 'prayagraj', rtoCode: 'UP-70', zone: 'Purvanchal' },
    ],
  },
  {
    name: 'Uttarakhand',
    slug: 'uttarakhand',
    capital: 'Dehradun',
    districts: [
      { name: 'Dehradun', slug: 'dehradun', rtoCode: 'UK-07', zone: 'Garhwal' },
      { name: 'Haridwar', slug: 'haridwar', rtoCode: 'UK-08', zone: 'Garhwal Plains' },
      { name: 'Haldwani (Nainital)', slug: 'haldwani', rtoCode: 'UK-04', zone: 'Kumaon' },
      { name: 'Roorkee', slug: 'roorkee', rtoCode: 'UK-17', zone: 'Garhwal' },
      { name: 'Rudrapur (Udham Singh Nagar)', slug: 'rudrapur', rtoCode: 'UK-06', zone: 'Tarai' },
    ],
  },
  {
    name: 'West Bengal',
    slug: 'west-bengal',
    capital: 'Kolkata',
    districts: [
      { name: 'Kolkata', slug: 'kolkata', rtoCode: 'WB-01', zone: 'Kolkata Metro' },
      { name: 'Howrah', slug: 'howrah', rtoCode: 'WB-12', zone: 'Greater Kolkata' },
      { name: 'North 24 Parganas (Barasat)', slug: 'north-24-parganas', rtoCode: 'WB-24', zone: 'Presidency' },
      { name: 'South 24 Parganas (Alipore)', slug: 'south-24-parganas', rtoCode: 'WB-20', zone: 'Presidency' },
      { name: 'Siliguri (Darjeeling)', slug: 'siliguri', rtoCode: 'WB-73', zone: 'North Bengal' },
    ],
  },
];

/**
 * Returns all Indian states in the registry
 */
export function getAllStates(): StateInfo[] {
  return INDIAN_REGIONS;
}

/**
 * Find a specific state by slug
 */
export function getStateBySlug(stateSlug: string): StateInfo | null {
  const clean = stateSlug.toLowerCase().trim();
  return INDIAN_REGIONS.find((s) => s.slug === clean) || null;
}

/**
 * Returns districts for a given state slug
 */
export function getDistrictsForState(stateSlug: string): DistrictInfo[] {
  const state = getStateBySlug(stateSlug);
  return state ? state.districts : [];
}

/**
 * Find exact regional info for state and district slug combination
 */
export function findRegion(
  stateSlug: string,
  districtSlug: string
): { state: StateInfo; district: DistrictInfo } | null {
  const state = getStateBySlug(stateSlug);
  if (!state) return null;

  const district = state.districts.find(
    (d) => d.slug === districtSlug.toLowerCase().trim()
  );

  if (!district) return null;

  return { state, district };
}

/**
 * Converts a slug into Title Case
 */
export function formatSlugToTitle(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Returns static params for seed pre-rendering
 * Seeds the top 10 populated states and their districts across all 5 services
 */
export function getAllRegionalStaticParams() {
  const topStateSlugs = [
    'uttar-pradesh',
    'maharashtra',
    'delhi',
    'karnataka',
    'tamil-nadu',
    'west-bengal',
    'gujarat',
    'rajasthan',
  ];

  const services = ['pan-card', 'aadhaar-card', 'voter-id', 'driving-license', 'vehicle-rc'];
  const params: Array<{ card: string; state: string; district: string }> = [];

  for (const state of INDIAN_REGIONS) {
    if (topStateSlugs.includes(state.slug)) {
      for (const dist of state.districts) {
        for (const card of services) {
          params.push({
            card,
            state: state.slug,
            district: dist.slug,
          });
        }
      }
    }
  }

  return params;
}

/**
 * Returns all programmatic regional hubs for sitemap generation
 * (145 districts × 5 cards = 725 combinations)
 */
export function getAllRegionalHubs() {
  const hubs: Array<{ state: StateInfo; district: DistrictInfo }> = [];
  for (const state of INDIAN_REGIONS) {
    for (const district of state.districts) {
      hubs.push({ state, district });
    }
  }
  return hubs;
}
