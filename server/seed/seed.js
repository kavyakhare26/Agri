/**
 * AgriConnect Seed Script
 * Run: npm run seed
 *
 * Clears all collections and inserts realistic demo data.
 * Prints all login credentials at the end.
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

// Models
const User = require('../models/User');
const Farm = require('../models/Farm');
const Crop = require('../models/Crop');
const Resource = require('../models/Resource');
const Order = require('../models/Order');
const WeatherData = require('../models/WeatherData');
const PestAlert = require('../models/PestAlert');
const Consultation = require('../models/Consultation');
const ForumPost = require('../models/ForumPost');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/agriconnect';

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅  Connected to MongoDB:', mongoose.connection.host);

    // ── Clear all collections ───────────────────────────────────────────────
    console.log('\n🗑   Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Farm.deleteMany({}),
      Crop.deleteMany({}),
      Resource.deleteMany({}),
      Order.deleteMany({}),
      WeatherData.deleteMany({}),
      PestAlert.deleteMany({}),
      Consultation.deleteMany({}),
      ForumPost.deleteMany({}),
    ]);
    console.log('   Done.\n');

    // ── Users ───────────────────────────────────────────────────────────────
    console.log('👤  Creating users...');
    const [admin, farmer1, farmer2] = await User.create([
      {
        name: 'Admin AgriConnect',
        email: 'admin@agriconnect.in',
        password: 'Admin@123',
        role: 'admin',
        phone: '9000000001',
        state: 'Maharashtra',
        preferredLanguage: 'en',
      },
      {
        name: 'Ramesh Patil',
        email: 'farmer1@agriconnect.in',
        password: 'Farmer@123',
        role: 'farmer',
        phone: '9000000002',
        state: 'Punjab',
        preferredLanguage: 'hi',
      },
      {
        name: 'Sunita Devi',
        email: 'farmer2@agriconnect.in',
        password: 'Farmer@123',
        role: 'farmer',
        phone: '9000000003',
        state: 'Maharashtra',
        preferredLanguage: 'mr',
      },
    ]);
    console.log('   3 users created.\n');

    // ── Farms ───────────────────────────────────────────────────────────────
    console.log('🌾  Creating farms...');
    const [farm1, farm2, farm3, farm4] = await Farm.create([
      {
        owner: farmer1._id,
        name: 'Patil Green Fields',
        location: { village: 'Ludhiana Rural', district: 'Ludhiana', state: 'Punjab', lat: 30.9, lng: 75.85 },
        areaHectares: 5.5,
        soilType: 'loamy',
        irrigationType: 'drip',
        description: 'Primary wheat and maize cultivation land.',
        soilReadings: [
          { pH: 6.8, N: 72, P: 30, K: 180, moisture: 45, recordedAt: new Date('2024-03-10') },
          { pH: 6.5, N: 55, P: 22, K: 140, moisture: 38, recordedAt: new Date('2024-06-01') },
        ],
      },
      {
        owner: farmer1._id,
        name: 'Riverside Orchard',
        location: { village: 'Machhiwara', district: 'Ludhiana', state: 'Punjab', lat: 30.93, lng: 76.18 },
        areaHectares: 2.0,
        soilType: 'sandy',
        irrigationType: 'sprinkler',
        description: 'Mango and guava orchard beside Sutlej tributary.',
        soilReadings: [
          { pH: 5.8, N: 40, P: 20, K: 120, moisture: 25, recordedAt: new Date('2024-04-15') },
        ],
      },
      {
        owner: farmer2._id,
        name: 'Devi Sugarcane Farm',
        location: { village: 'Kolhapur Khed', district: 'Kolhapur', state: 'Maharashtra', lat: 16.7, lng: 74.24 },
        areaHectares: 3.8,
        soilType: 'clay',
        irrigationType: 'flood',
        description: 'Traditional sugarcane cultivation using flood irrigation.',
        soilReadings: [
          { pH: 7.2, N: 65, P: 35, K: 200, moisture: 60, recordedAt: new Date('2024-02-20') },
        ],
      },
      {
        owner: farmer2._id,
        name: 'Sunflower Plateau',
        location: { village: 'Sangli Kavthe', district: 'Sangli', state: 'Maharashtra', lat: 16.85, lng: 74.58 },
        areaHectares: 1.5,
        soilType: 'loamy',
        irrigationType: 'rainfed',
        description: 'Sunflower and soybean rotation field.',
        soilReadings: [
          { pH: 6.2, N: 48, P: 18, K: 130, moisture: 30, recordedAt: new Date('2024-05-05') },
        ],
      },
    ]);
    console.log('   4 farms created.\n');

    // ── Crops ───────────────────────────────────────────────────────────────
    console.log('🌱  Creating crops...');
    const now = new Date();

    await Crop.create([
      // Farm 1 crops
      {
        farm: farm1._id,
        owner: farmer1._id,
        name: 'Wheat',
        variety: 'HD-2967',
        growthStage: 'vegetative',
        plantingDate: new Date('2024-11-15'),
        expectedHarvestDate: new Date('2025-04-10'),
        areaHectares: 3.0,
        status: 'active',
        notes: 'Good germination rate. Applied basal dose on planting day.',
        activityLog: [
          { type: 'planting', note: 'Sowed HD-2967 seeds with row spacing 22cm', date: new Date('2024-11-15'), performedBy: farmer1._id },
          { type: 'watering', note: 'Crown root initiation irrigation done', date: new Date('2024-11-30'), performedBy: farmer1._id },
          { type: 'fertilizing', note: 'Top dressing: 50kg Urea per acre', date: new Date('2024-12-20'), performedBy: farmer1._id },
        ],
      },
      {
        farm: farm1._id,
        owner: farmer1._id,
        name: 'Maize',
        variety: 'Pioneer 30V92',
        growthStage: 'fruiting',
        plantingDate: new Date('2024-06-10'),
        expectedHarvestDate: new Date('2024-09-30'),
        areaHectares: 2.5,
        status: 'active',
        notes: 'Intercropped with soybean in alternate rows.',
        activityLog: [
          { type: 'planting', note: 'Planted Pioneer 30V92 hybrid', date: new Date('2024-06-10'), performedBy: farmer1._id },
          { type: 'pest_control', note: 'Sprayed Chlorpyrifos for stem borer control', date: new Date('2024-07-15'), performedBy: farmer1._id },
          { type: 'observation', note: 'Observed 10% fall armyworm damage in eastern section', date: new Date('2024-08-01'), performedBy: farmer1._id },
        ],
      },
      // Farm 2 crops
      {
        farm: farm2._id,
        owner: farmer1._id,
        name: 'Mango',
        variety: 'Alphonso',
        growthStage: 'flowering',
        plantingDate: new Date('2022-02-01'),
        expectedHarvestDate: new Date('2025-05-15'),
        areaHectares: 1.5,
        status: 'active',
        notes: '80 trees, 4 years old. Flowering started in January.',
        activityLog: [
          { type: 'fertilizing', note: 'Applied NPK 13:00:45 @ 2kg per tree', date: new Date('2024-11-01'), performedBy: farmer1._id },
          { type: 'observation', note: 'Flowering density good, ~70% bloom', date: new Date('2025-01-20'), performedBy: farmer1._id },
        ],
      },
      {
        farm: farm2._id,
        owner: farmer1._id,
        name: 'Guava',
        variety: 'Allahabad Safeda',
        growthStage: 'ripening',
        plantingDate: new Date('2023-07-10'),
        expectedHarvestDate: new Date('2024-12-20'),
        areaHectares: 0.5,
        status: 'active',
        notes: 'Second season crop. Fruits turning yellow.',
        activityLog: [
          { type: 'watering', note: 'Drip irrigation 45 min daily', date: new Date('2024-10-01'), performedBy: farmer1._id },
          { type: 'observation', note: 'Fruits at 80% ripeness, harvest expected in 3 weeks', date: new Date('2024-12-01'), performedBy: farmer1._id },
        ],
      },
      // Farm 3 crops
      {
        farm: farm3._id,
        owner: farmer2._id,
        name: 'Sugarcane',
        variety: 'Co-86032',
        growthStage: 'vegetative',
        plantingDate: new Date('2024-01-20'),
        expectedHarvestDate: new Date('2025-01-20'),
        areaHectares: 3.0,
        status: 'active',
        notes: 'Ratoon crop from previous year plant cane.',
        activityLog: [
          { type: 'watering', note: 'Flood irrigation every 15 days', date: new Date('2024-02-05'), performedBy: farmer2._id },
          { type: 'fertilizing', note: 'Applied 250kg Ammonium Sulphate per hectare', date: new Date('2024-03-01'), performedBy: farmer2._id },
          { type: 'pest_control', note: 'Earhead bug spray with Monocrotophos', date: new Date('2024-05-10'), performedBy: farmer2._id },
        ],
      },
      {
        farm: farm3._id,
        owner: farmer2._id,
        name: 'Soybean',
        variety: 'JS-335',
        growthStage: 'harvested',
        plantingDate: new Date('2024-06-25'),
        expectedHarvestDate: new Date('2024-10-10'),
        actualHarvestDate: new Date('2024-10-12'),
        areaHectares: 0.8,
        status: 'completed',
        notes: 'Intercrop. Yield: 1.4 tons/hectare.',
        activityLog: [
          { type: 'planting', note: 'Line sowing with seed drill', date: new Date('2024-06-25'), performedBy: farmer2._id },
          { type: 'harvesting', note: 'Machine harvested. Yield 1.12 tons', date: new Date('2024-10-12'), performedBy: farmer2._id },
        ],
      },
      // Farm 4 crops
      {
        farm: farm4._id,
        owner: farmer2._id,
        name: 'Sunflower',
        variety: 'KBSH-44',
        growthStage: 'flowering',
        plantingDate: new Date('2024-10-15'),
        expectedHarvestDate: new Date('2025-02-01'),
        areaHectares: 1.0,
        status: 'active',
        notes: 'Rabi season sunflower for oil seed.',
        activityLog: [
          { type: 'planting', note: 'Seed treatment with Thiram before sowing', date: new Date('2024-10-15'), performedBy: farmer2._id },
          { type: 'fertilizing', note: 'Basal dose: DAP 2 bags/acre', date: new Date('2024-10-16'), performedBy: farmer2._id },
          { type: 'observation', note: 'Head formation started, 65% plants with visible head', date: new Date('2024-12-10'), performedBy: farmer2._id },
        ],
      },
      {
        farm: farm4._id,
        owner: farmer2._id,
        name: 'Chickpea',
        variety: 'JG-11',
        growthStage: 'germination',
        plantingDate: new Date('2024-11-01'),
        expectedHarvestDate: new Date('2025-03-15'),
        areaHectares: 0.5,
        status: 'active',
        notes: 'Mixed with Safflower in border rows.',
        activityLog: [
          { type: 'planting', note: 'Sown with Rhizobium inoculant for N-fixation', date: new Date('2024-11-01'), performedBy: farmer2._id },
        ],
      },
    ]);
    console.log('   8 crops created.\n');

    // ── Resources ────────────────────────────────────────────────────────────
    console.log('🛒  Creating resources...');
    await Resource.create([
      // Seeds
      {
        name: 'Wheat Seed HD-2967',
        category: 'seed',
        description: 'High-yielding, rust-resistant wheat variety for irrigated conditions. Recommended for North India.',
        price: 45,
        unit: 'per kg',
        stock: 500,
        brand: 'ICAR-IARI',
        isApproved: true,
        addedBy: admin._id,
      },
      {
        name: 'Hybrid Maize Seed Pioneer 30V92',
        category: 'seed',
        description: 'High-yield hybrid maize with resistance to turcicum blight. Suitable for Kharif season.',
        price: 420,
        unit: 'per 4kg bag',
        stock: 200,
        brand: 'Pioneer',
        isApproved: true,
        addedBy: admin._id,
      },
      // Fertilizers
      {
        name: 'Urea (46% N)',
        category: 'fertilizer',
        description: 'High nitrogen content fertilizer. Ideal for top-dressing cereal crops.',
        price: 266,
        unit: 'per 45kg bag',
        stock: 1000,
        brand: 'IFFCO',
        isApproved: true,
        addedBy: admin._id,
      },
      {
        name: 'DAP (Diammonium Phosphate)',
        category: 'fertilizer',
        description: '18% N, 46% P2O5. Best for basal application in all crops.',
        price: 1350,
        unit: 'per 50kg bag',
        stock: 800,
        brand: 'IFFCO',
        isApproved: true,
        addedBy: admin._id,
      },
      // Pesticides
      {
        name: 'Chlorpyrifos 20% EC',
        category: 'pesticide',
        description: 'Broad-spectrum insecticide effective against stem borer, aphids, and soil insects.',
        price: 320,
        unit: 'per 500ml bottle',
        stock: 300,
        brand: 'Dhanuka',
        isApproved: true,
        addedBy: admin._id,
      },
      {
        name: 'Mancozeb 75% WP',
        category: 'pesticide',
        description: 'Protective fungicide for downy mildew, early blight, and leaf spot diseases.',
        price: 180,
        unit: 'per 250g packet',
        stock: 450,
        brand: 'Indofil',
        isApproved: true,
        addedBy: admin._id,
      },
      // Tools
      {
        name: 'Hand Sprayer 16L Knapsack',
        category: 'tool',
        description: 'Manual knapsack sprayer with adjustable nozzle. Ideal for small to medium farms.',
        price: 850,
        unit: 'per piece',
        stock: 100,
        brand: 'Neptune',
        isApproved: true,
        addedBy: admin._id,
      },
      {
        name: 'Soil pH & Moisture Tester',
        category: 'tool',
        description: 'Portable digital meter for soil pH, moisture, and temperature. Battery-powered.',
        price: 1299,
        unit: 'per piece',
        stock: 60,
        brand: 'AgroTech',
        isApproved: true,
        addedBy: admin._id,
      },
    ]);
    console.log('   8 resources created.\n');

    // ── Pest Alerts ──────────────────────────────────────────────────────────
    console.log('🐛  Creating pest alerts...');
    await PestAlert.create([
      {
        title: 'Yellow Rust Alert — Punjab Wheat Belt',
        description: 'Yellow rust (Puccinia striiformis) has been detected in Ludhiana and Patiala districts. Favorable cool temperatures (15–18°C) and high humidity are accelerating spread. Spray Propiconazole 25EC @ 0.1% immediately.',
        severity: 'high',
        type: 'fungal',
        affectedCrops: ['wheat', 'barley'],
        region: 'Punjab',
        autoGenerated: false,
        postedBy: admin._id,
        isActive: true,
      },
      {
        title: 'Fall Armyworm Infestation — Maize Fields',
        description: 'Fall Armyworm (Spodoptera frugiperda) reported in Kharif maize across Central India. Look for window-pane damage on leaves and frass in whorls. Apply Emamectin Benzoate 5SG @ 0.4g/L at first sign.',
        severity: 'critical',
        type: 'insect',
        affectedCrops: ['maize', 'sorghum', 'sugarcane'],
        region: 'Central India',
        autoGenerated: false,
        postedBy: admin._id,
        isActive: true,
      },
      {
        title: 'Whitefly Advisory — Cotton & Soybean',
        description: 'Whitefly populations are above economic threshold levels in parts of Maharashtra. These are vectors for leaf curl virus. Use yellow sticky traps and spray Thiamethoxam 25WG @ 0.3g/L.',
        severity: 'medium',
        type: 'insect',
        affectedCrops: ['cotton', 'soybean', 'tomato'],
        region: 'Maharashtra',
        autoGenerated: false,
        postedBy: admin._id,
        isActive: true,
      },
    ]);
    console.log('   3 pest alerts created.\n');

    // ── Forum Posts ──────────────────────────────────────────────────────────
    console.log('💬  Creating forum posts...');
    await ForumPost.create([
      {
        author: farmer1._id,
        title: 'Best time to apply top-dress urea for wheat — any tips?',
        content: 'Namaskar fellow farmers! I planted HD-2967 wheat on Nov 15. I did basal application of DAP. Now looking for advice on when exactly to apply urea for top-dressing. Should I split it into two doses? Our district gets foggy weather in December–January.',
        category: 'crop',
        tags: ['wheat', 'urea', 'top-dressing', 'Punjab'],
        likes: [farmer2._id],
        comments: [
          {
            author: farmer2._id,
            content: 'For HD-2967 in Punjab, split urea application works best — first dose at CRI (21 DAS) and second at jointing stage (45 DAS). Avoid applying on foggy or rainy days for better absorption.',
            likes: [farmer1._id],
          },
        ],
        isPinned: false,
        isModerated: false,
      },
      {
        author: farmer2._id,
        title: 'Drip irrigation vs flood irrigation for sugarcane — Maharashtra experience',
        content: 'I have been using flood irrigation for sugarcane on my 3.8 hectare farm in Kolhapur for 10 years. This year government is offering subsidy on drip systems. Has anyone switched from flood to drip for sugarcane in Maharashtra? What was the impact on yield and water saving? Please share your experience.',
        category: 'equipment',
        tags: ['sugarcane', 'drip-irrigation', 'Maharashtra', 'subsidy', 'water-saving'],
        likes: [farmer1._id],
        comments: [
          {
            author: farmer1._id,
            content: 'I switched to drip for my orchard last year. Water saving is around 40–50% and we got 15% better yield due to uniform moisture. Initial cost is high but the subsidy covers 60% in Punjab. Check with your district horticulture office for Maharashtra scheme details.',
            likes: [],
          },
        ],
        isPinned: true,
        isModerated: false,
      },
    ]);
    console.log('   2 forum posts created.\n');

    // ── Consultations ────────────────────────────────────────────────────────
    console.log('🤝  Creating consultations...');
    await Consultation.create([
      {
        farmer: farmer1._id,
        title: 'Yellow spots appearing on wheat leaves — is it rust?',
        question: 'I noticed pale yellow spots in a stripe pattern on several wheat plants in my Ludhiana field. The spots appear on upper surface of leaves and there is orange powder below. Plants are 6 weeks old. Is this yellow rust? How urgently should I act and what should I spray?',
        category: 'pest',
        status: 'answered',
        tags: ['wheat', 'rust', 'fungal', 'Punjab'],
        replies: [
          {
            author: admin._id,
            content: 'Yes, this is classic Yellow Rust (Puccinia striiformis f. sp. tritici). The stripe pattern and orange urediniospores are characteristic. Act immediately — spray Propiconazole 25EC @ 1ml/L of water. Cover the entire canopy. If >10% leaves are infected, do a second spray after 14 days. Remove and burn heavily infected plants.',
            isExpert: true,
          },
        ],
      },
      {
        farmer: farmer2._id,
        title: 'Soil pH 7.2 — is it suitable for sugarcane or should I amend?',
        question: 'My soil test shows pH 7.2 in my Kolhapur farm. I want to continue growing sugarcane. The ideal pH for sugarcane is mentioned as 6.5–7.5 in most books so I think it should be fine, but someone told me pH 7.2 can affect micronutrient availability especially iron and zinc. Should I apply any amendment before the next season?',
        category: 'soil',
        status: 'answered',
        tags: ['soil-pH', 'sugarcane', 'micronutrients'],
        replies: [
          {
            author: admin._id,
            content: 'pH 7.2 is within acceptable range for sugarcane (optimal 6.5–7.5). However your concern about micronutrients is valid — at this pH, availability of Fe, Zn, and Mn can be slightly reduced. Apply Zinc Sulphate @ 25kg/ha as basal dose. Also use FeSO4 foliar spray @ 0.5% if you notice interveinal chlorosis in young leaves. No need for acidification unless pH goes above 7.8.',
            isExpert: true,
          },
        ],
      },
    ]);
    console.log('   2 consultations created.\n');

    // ── Summary ──────────────────────────────────────────────────────────────
    console.log('═'.repeat(60));
    console.log('✅  SEED COMPLETED SUCCESSFULLY');
    console.log('═'.repeat(60));
    console.log('\n📋  LOGIN CREDENTIALS\n');
    console.log('  👑  ADMIN');
    console.log('      Email   : admin@agriconnect.in');
    console.log('      Password: Admin@123');
    console.log('      Role    : admin\n');
    console.log('  🌾  FARMER 1 — Ramesh Patil');
    console.log('      Email   : farmer1@agriconnect.in');
    console.log('      Password: Farmer@123');
    console.log('      State   : Punjab\n');
    console.log('  🌾  FARMER 2 — Sunita Devi');
    console.log('      Email   : farmer2@agriconnect.in');
    console.log('      Password: Farmer@123');
    console.log('      State   : Maharashtra\n');
    console.log('📊  DATA SUMMARY');
    console.log('   • 3 Users (1 admin, 2 farmers)');
    console.log('   • 4 Farms (2 per farmer)');
    console.log('   • 8 Crops (2 per farm) with activity logs');
    console.log('   • 8 Resources (2 seeds, 2 fertilizers, 2 pesticides, 2 tools)');
    console.log('   • 3 Pest Alerts');
    console.log('   • 2 Forum Posts with comments');
    console.log('   • 2 Consultations with expert replies\n');
    console.log('   MongoDB URI:', MONGO_URI);
    console.log('═'.repeat(60));

    process.exit(0);
  } catch (err) {
    console.error('\n❌  SEED FAILED:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
};

run();
