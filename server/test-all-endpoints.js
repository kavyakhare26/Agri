/**
 * Comprehensive Backend Endpoint & Security Verification Suite
 * Tests all endpoints, validates response shapes, role guards, cross-user isolation,
 * weather mock & pest alert generation.
 */

const BASE_URL = 'http://localhost:5000/api';

const results = [];

const record = (method, path, role, expected, actual, description, pass) => {
  results.push({
    method,
    path,
    role,
    expected,
    actual,
    pass: pass !== undefined ? pass : expected === actual,
    description,
  });
};

const req = async (method, path, token = null, body = null) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  try {
    const res = await fetch(`${BASE_URL}${path}`, opts);
    let data = null;
    try {
      data = await res.json();
    } catch (e) {
      data = null;
    }
    return { status: res.status, ok: res.ok, data };
  } catch (err) {
    return { status: 0, ok: false, error: err.message };
  }
};

const runSuite = async () => {
  console.log('🧪 Starting AgriConnect Comprehensive Backend Test Suite...\n');

  // 1. Health
  const health = await req('GET', '/health');
  record('GET', '/api/health', 'Public', 200, health.status, 'Health check endpoint');

  // 2. Auth: Register new test farmer
  const regEmail = `testfarmer_${Date.now()}@agriconnect.in`;
  const regRes = await req('POST', '/auth/register', null, {
    name: 'New Test Farmer',
    email: regEmail,
    password: 'Password@123',
    role: 'farmer',
    phone: '9876543210',
    state: 'Punjab',
  });
  record('POST', '/api/auth/register', 'Public', 201, regRes.status, 'Register new farmer');

  // 3. Auth: Login Admin, Farmer 1, Farmer 2
  const adminLogin = await req('POST', '/auth/login', null, {
    email: 'admin@agriconnect.in',
    password: 'Admin@123',
  });
  record('POST', '/api/auth/login', 'Public', 200, adminLogin.status, 'Admin login');
  const adminToken = adminLogin.data?.token;

  const farmer1Login = await req('POST', '/auth/login', null, {
    email: 'farmer1@agriconnect.in',
    password: 'Farmer@123',
  });
  record('POST', '/api/auth/login', 'Public', 200, farmer1Login.status, 'Farmer 1 login');
  const farmer1Token = farmer1Login.data?.token;
  const farmer1Id = farmer1Login.data?.user?._id;

  const farmer2Login = await req('POST', '/auth/login', null, {
    email: 'farmer2@agriconnect.in',
    password: 'Farmer@123',
  });
  record('POST', '/api/auth/login', 'Public', 200, farmer2Login.status, 'Farmer 2 login');
  const farmer2Token = farmer2Login.data?.token;
  const farmer2Id = farmer2Login.data?.user?._id;

  // 4. Auth: Profile & Password
  const meRes = await req('GET', '/auth/me', farmer1Token);
  record('GET', '/api/auth/me', 'Farmer', 200, meRes.status, 'Farmer gets own profile');

  const updateMeRes = await req('PUT', '/auth/me', farmer1Token, { name: 'Ramesh Patil Updated' });
  record('PUT', '/api/auth/me', 'Farmer', 200, updateMeRes.status, 'Farmer updates own profile');

  // 5. Farms
  const farmsRes = await req('GET', '/farms?page=1&limit=5', farmer1Token);
  record('GET', '/api/farms', 'Farmer', 200, farmsRes.status, 'Farmer lists own farms (paginated)');
  const farmer1FarmId = farmsRes.data?.data?.[0]?._id;

  const createFarmRes = await req('POST', '/farms', farmer1Token, {
    name: 'Test Experimental Field',
    areaHectares: 2.5,
    soilType: 'loamy',
    irrigationType: 'drip',
    description: 'Temporary test farm',
  });
  record('POST', '/api/farms', 'Farmer', 201, createFarmRes.status, 'Farmer creates a farm');
  const tempFarmId = createFarmRes.data?.data?._id;

  const getFarmRes = await req('GET', `/farms/${farmer1FarmId}`, farmer1Token);
  record('GET', '/api/farms/:id', 'Farmer (Owner)', 200, getFarmRes.status, 'Farmer views own farm');

  const updateFarmRes = await req('PUT', `/farms/${tempFarmId}`, farmer1Token, { name: 'Updated Experimental Field' });
  record('PUT', '/api/farms/:id', 'Farmer (Owner)', 200, updateFarmRes.status, 'Farmer updates own farm');

  const deleteFarmRes = await req('DELETE', `/farms/${tempFarmId}`, farmer1Token);
  record('DELETE', '/api/farms/:id', 'Farmer (Owner)', 200, deleteFarmRes.status, 'Farmer deletes own farm');

  // Cross-user Farm security check
  const crossGetFarm = await req('GET', `/farms/${farmer1FarmId}`, farmer2Token);
  record('GET', '/api/farms/:id', 'Farmer 2 -> Farmer 1 Farm', 403, crossGetFarm.status, 'Cross-user Farm access blocked');

  const crossPutFarm = await req('PUT', `/farms/${farmer1FarmId}`, farmer2Token, { name: 'Hacked Farm' });
  record('PUT', '/api/farms/:id', 'Farmer 2 -> Farmer 1 Farm', 403, crossPutFarm.status, 'Cross-user Farm update blocked');

  // 6. Crops
  const cropsRes = await req('GET', '/crops?page=1&limit=5', farmer1Token);
  record('GET', '/api/crops', 'Farmer', 200, cropsRes.status, 'Farmer lists own crops (paginated)');
  const farmer1CropId = cropsRes.data?.data?.[0]?._id;

  const createCropRes = await req('POST', '/crops', farmer1Token, {
    farm: farmer1FarmId,
    name: 'Mustard Test Crop',
    variety: 'Pusa Bold',
    growthStage: 'vegetative',
    areaHectares: 1.0,
  });
  record('POST', '/api/crops', 'Farmer', 201, createCropRes.status, 'Farmer adds crop to own farm');
  const tempCropId = createCropRes.data?.data?._id;

  const getCropRes = await req('GET', `/crops/${farmer1CropId}`, farmer1Token);
  record('GET', '/api/crops/:id', 'Farmer (Owner)', 200, getCropRes.status, 'Farmer views own crop');

  const updateCropRes = await req('PUT', `/crops/${tempCropId}`, farmer1Token, { growthStage: 'flowering' });
  record('PUT', '/api/crops/:id', 'Farmer (Owner)', 200, updateCropRes.status, 'Farmer updates own crop');

  const addActivityRes = await req('POST', `/crops/${tempCropId}/activities`, farmer1Token, {
    type: 'watering',
    note: 'Irrigated morning session',
  });
  record('POST', '/api/crops/:id/activities', 'Farmer (Owner)', 201, addActivityRes.status, 'Farmer logs crop activity');

  const deleteCropRes = await req('DELETE', `/crops/${tempCropId}`, farmer1Token);
  record('DELETE', '/api/crops/:id', 'Farmer (Owner)', 200, deleteCropRes.status, 'Farmer deletes own crop');

  // Cross-user Crop security check
  const crossGetCrop = await req('GET', `/crops/${farmer1CropId}`, farmer2Token);
  record('GET', '/api/crops/:id', 'Farmer 2 -> Farmer 1 Crop', 403, crossGetCrop.status, 'Cross-user Crop access blocked');

  const crossAddCrop = await req('POST', '/crops', farmer2Token, {
    farm: farmer1FarmId,
    name: 'Illegal Crop',
  });
  record('POST', '/api/crops', 'Farmer 2 -> Farmer 1 Farm', 403, crossAddCrop.status, 'Cross-user Crop creation on other farm blocked');

  // 7. Soil
  const addSoilRes = await req('POST', `/soil/${farmer1FarmId}`, farmer1Token, {
    pH: 5.5,
    N: 35,
    P: 15,
    K: 110,
    moisture: 18,
  });
  record('POST', '/api/soil/:farmId', 'Farmer (Owner)', 201, addSoilRes.status, 'Farmer adds soil reading & gets recommendations');

  const getSoilRes = await req('GET', `/soil/${farmer1FarmId}`, farmer1Token);
  record('GET', '/api/soil/:farmId', 'Farmer (Owner)', 200, getSoilRes.status, 'Farmer gets soil history & recommendations');

  // Cross-user Soil security check
  const crossGetSoil = await req('GET', `/soil/${farmer1FarmId}`, farmer2Token);
  record('GET', '/api/soil/:farmId', 'Farmer 2 -> Farmer 1 Soil', 403, crossGetSoil.status, 'Cross-user Soil access blocked');

  // 8. Weather & Pest Alert generation
  const weatherRes = await req('GET', '/weather?location=Pune', farmer1Token);
  const weatherPestAlerts = weatherRes.data?.pestAlerts || [];
  const weatherPass = weatherRes.status === 200 && Array.isArray(weatherPestAlerts) && weatherPestAlerts.length > 0;
  record('GET', '/api/weather', 'Authenticated', 200, weatherRes.status, `Weather returns mock & auto-generates ${weatherPestAlerts.length} pest alerts`, weatherPass);

  const pestCheckRes = await req('POST', '/weather/pest-check', farmer1Token, {
    humidity: 86,
    temp: 39,
    rainfall: 60,
    region: 'Punjab',
  });
  const checkAlerts = pestCheckRes.data?.savedAlerts || [];
  record('POST', '/api/weather/pest-check', 'Authenticated', 201, pestCheckRes.status, `Rule check triggered ${checkAlerts.length} hazard alerts`);

  // 9. Pest Alerts
  const pestAlertsRes = await req('GET', '/pest-alerts?page=1&limit=5', farmer1Token);
  record('GET', '/api/pest-alerts', 'Authenticated', 200, pestAlertsRes.status, 'List active pest alerts (paginated)');
  const alertId = pestAlertsRes.data?.data?.[0]?._id;

  const getAlertRes = await req('GET', `/pest-alerts/${alertId}`, farmer1Token);
  record('GET', '/api/pest-alerts/:id', 'Authenticated', 200, getAlertRes.status, 'Get single pest alert');

  const adminCreateAlert = await req('POST', '/pest-alerts', adminToken, {
    title: 'Locust Warning — Western Border',
    description: 'Swarm observed near border sectors. Aerial spray planned.',
    severity: 'critical',
    type: 'insect',
    region: 'Rajasthan Border',
  });
  record('POST', '/api/pest-alerts', 'Admin', 201, adminCreateAlert.status, 'Admin creates pest alert');
  const tempAlertId = adminCreateAlert.data?.data?._id;

  const adminUpdateAlert = await req('PUT', `/pest-alerts/${tempAlertId}`, adminToken, { severity: 'high' });
  record('PUT', '/api/pest-alerts/:id', 'Admin', 200, adminUpdateAlert.status, 'Admin updates pest alert');

  const adminDeleteAlert = await req('DELETE', `/pest-alerts/${tempAlertId}`, adminToken);
  record('DELETE', '/api/pest-alerts/:id', 'Admin', 200, adminDeleteAlert.status, 'Admin deletes pest alert');

  // Role check: Farmer cannot POST/DELETE pest alerts
  const farmerPostAlert = await req('POST', '/pest-alerts', farmer1Token, { title: 'Fake', description: 'Fake', severity: 'low' });
  record('POST', '/api/pest-alerts', 'Farmer -> PestAlert Create', 403, farmerPostAlert.status, 'Farmer cannot create pest alerts (403)');

  // 10. Resources (Store)
  const resourcesRes = await req('GET', '/resources?category=seed&page=1&limit=5', farmer1Token);
  record('GET', '/api/resources', 'Authenticated', 200, resourcesRes.status, 'List resources (filter/search/pagination)');
  const resourceId = resourcesRes.data?.data?.[0]?._id;

  const getResourceRes = await req('GET', `/resources/${resourceId}`, farmer1Token);
  record('GET', '/api/resources/:id', 'Authenticated', 200, getResourceRes.status, 'Get single resource');

  const adminCreateRes = await req('POST', '/resources', adminToken, {
    name: 'Bio-Organic Potash',
    category: 'fertilizer',
    price: 650,
    unit: 'per 25kg bag',
    stock: 150,
    brand: 'GreenBio',
  });
  record('POST', '/api/resources', 'Admin', 201, adminCreateRes.status, 'Admin creates resource');
  const tempResourceId = adminCreateRes.data?.data?._id;

  const adminUpdateRes = await req('PUT', `/resources/${tempResourceId}`, adminToken, { price: 620 });
  record('PUT', '/api/resources/:id', 'Admin', 200, adminUpdateRes.status, 'Admin updates resource');

  const adminDeleteRes = await req('DELETE', `/resources/${tempResourceId}`, adminToken);
  record('DELETE', '/api/resources/:id', 'Admin', 200, adminDeleteRes.status, 'Admin deletes resource');

  // Role check: Farmer cannot POST resources
  const farmerPostRes = await req('POST', '/resources', farmer1Token, { name: 'X', category: 'tool', price: 10, unit: 'kg' });
  record('POST', '/api/resources', 'Farmer -> Resource Create', 403, farmerPostRes.status, 'Farmer cannot create resources (403)');

  // 11. Orders
  const createOrderRes = await req('POST', '/orders', farmer1Token, {
    items: [{ resource: resourceId, quantity: 2 }],
    deliveryAddress: {
      name: 'Ramesh Patil',
      phone: '9000000002',
      village: 'Ludhiana Rural',
      district: 'Ludhiana',
      state: 'Punjab',
      pincode: '141001',
    },
    paymentMethod: 'cod',
    notes: 'Please deliver after 2 PM',
  });
  record('POST', '/api/orders', 'Farmer', 201, createOrderRes.status, 'Farmer creates order (decrements stock)');
  const orderId = createOrderRes.data?.data?._id;

  const getOrdersRes = await req('GET', '/orders?page=1&limit=5', farmer1Token);
  record('GET', '/api/orders', 'Farmer', 200, getOrdersRes.status, 'Farmer gets own order history');

  const getOrderRes = await req('GET', `/orders/${orderId}`, farmer1Token);
  record('GET', '/api/orders/:id', 'Farmer (Owner)', 200, getOrderRes.status, 'Farmer views own order details');

  const adminOrdersRes = await req('GET', '/orders/admin/all?page=1&limit=5', adminToken);
  record('GET', '/api/orders/admin/all', 'Admin', 200, adminOrdersRes.status, 'Admin views all orders');

  const adminUpdateOrderStatus = await req('PUT', `/orders/${orderId}/status`, adminToken, { status: 'confirmed' });
  record('PUT', '/api/orders/:id/status', 'Admin', 200, adminUpdateOrderStatus.status, 'Admin updates order status');

  // Security checks: Farmer cannot access admin orders, cannot update order status, and cross-user cannot see order
  const farmerAdminOrders = await req('GET', '/orders/admin/all', farmer1Token);
  record('GET', '/api/orders/admin/all', 'Farmer -> Admin Orders', 403, farmerAdminOrders.status, 'Farmer blocked from admin orders (403)');

  const farmerUpdateStatus = await req('PUT', `/orders/${orderId}/status`, farmer1Token, { status: 'shipped' });
  record('PUT', '/api/orders/:id/status', 'Farmer -> Update Status', 403, farmerUpdateStatus.status, 'Farmer blocked from updating order status (403)');

  const crossGetOrder = await req('GET', `/orders/${orderId}`, farmer2Token);
  record('GET', '/api/orders/:id', 'Farmer 2 -> Farmer 1 Order', 403, crossGetOrder.status, 'Cross-user Order access blocked (403)');

  // 12. Consultations
  const createConsRes = await req('POST', '/consultations', farmer1Token, {
    title: 'Aphid problem on mustard',
    question: 'Small green insects covering terminal shoots. What is organic control?',
    category: 'pest',
    tags: ['mustard', 'aphids', 'organic'],
  });
  record('POST', '/api/consultations', 'Farmer', 201, createConsRes.status, 'Farmer submits consultation question');
  const consId = createConsRes.data?.data?._id;

  const getConsList = await req('GET', '/consultations?page=1&limit=5', farmer1Token);
  record('GET', '/api/consultations', 'Farmer', 200, getConsList.status, 'Farmer views own consultations');

  const getConsRes = await req('GET', `/consultations/${consId}`, farmer1Token);
  record('GET', '/api/consultations/:id', 'Farmer (Owner)', 200, getConsRes.status, 'Farmer views consultation details');

  const replyConsRes = await req('POST', `/consultations/${consId}/replies`, adminToken, {
    content: 'Spray Neem oil 10000 ppm @ 3ml/L along with 1g detergent per liter.',
  });
  record('POST', '/api/consultations/:id/replies', 'Expert/Admin', 201, replyConsRes.status, 'Expert replies to consultation');

  const adminConsAll = await req('GET', '/consultations/all?page=1&limit=5', adminToken);
  record('GET', '/api/consultations/all', 'Admin', 200, adminConsAll.status, 'Admin gets all consultations');

  // Role & cross-user checks
  const farmerConsAll = await req('GET', '/consultations/all', farmer1Token);
  record('GET', '/api/consultations/all', 'Farmer -> All Consultations', 403, farmerConsAll.status, 'Farmer blocked from consultations/all (403)');

  const crossGetCons = await req('GET', `/consultations/${consId}`, farmer2Token);
  record('GET', '/api/consultations/:id', 'Farmer 2 -> Farmer 1 Cons', 403, crossGetCons.status, 'Cross-user consultation access blocked (403)');

  const deleteConsRes = await req('DELETE', `/consultations/${consId}`, farmer1Token);
  record('DELETE', '/api/consultations/:id', 'Farmer (Owner)', 200, deleteConsRes.status, 'Farmer deletes own consultation');

  // 13. Forum
  const forumListRes = await req('GET', '/forum?page=1&limit=5', farmer1Token);
  record('GET', '/api/forum', 'Authenticated', 200, forumListRes.status, 'List forum posts (paginated/searchable)');
  const seedPostId = forumListRes.data?.data?.[0]?._id;

  const createPostRes = await req('POST', '/forum', farmer1Token, {
    title: 'Experience with solar pump subsidy in 2024?',
    content: 'Has anyone installed PM-KUSUM solar pumps recently? How long did the approval take?',
    category: 'equipment',
    tags: ['solar', 'pm-kusum', 'pumps'],
  });
  record('POST', '/api/forum', 'Authenticated', 201, createPostRes.status, 'Farmer creates forum post');
  const userPostId = createPostRes.data?.data?._id;

  const getPostRes = await req('GET', `/forum/${userPostId}`, farmer1Token);
  record('GET', '/api/forum/:id', 'Authenticated', 200, getPostRes.status, 'View single forum post');

  const commentRes = await req('POST', `/forum/${userPostId}/comments`, farmer2Token, {
    content: 'It took about 45 days in Maharashtra through the state portal.',
  });
  record('POST', '/api/forum/:id/comments', 'Authenticated', 201, commentRes.status, 'Farmer 2 comments on Farmer 1 post');

  const likeRes = await req('PUT', `/forum/${userPostId}/like`, farmer2Token);
  record('PUT', '/api/forum/:id/like', 'Authenticated', 200, likeRes.status, 'Farmer 2 toggles like on post');

  const moderateRes = await req('PUT', `/forum/${userPostId}/moderate`, adminToken, { isPinned: true });
  record('PUT', '/api/forum/:id/moderate', 'Admin', 200, moderateRes.status, 'Admin moderates/pins post');

  // Role & cross-user checks
  const farmerModerate = await req('PUT', `/forum/${userPostId}/moderate`, farmer1Token, { isPinned: true });
  record('PUT', '/api/forum/:id/moderate', 'Farmer -> Moderate Post', 403, farmerModerate.status, 'Farmer blocked from post moderation (403)');

  const crossDeletePost = await req('DELETE', `/forum/${userPostId}`, farmer2Token);
  record('DELETE', '/api/forum/:id', 'Farmer 2 -> Farmer 1 Post', 403, crossDeletePost.status, 'Farmer 2 blocked from deleting Farmer 1 post (403)');

  const deletePostRes = await req('DELETE', `/forum/${userPostId}`, farmer1Token);
  record('DELETE', '/api/forum/:id', 'Author', 200, deletePostRes.status, 'Author deletes own post');

  // 14. Admin Endpoints
  const adminStatsRes = await req('GET', '/admin/stats', adminToken);
  record('GET', '/api/admin/stats', 'Admin', 200, adminStatsRes.status, 'Admin gets dashboard summary stats');

  const adminUsersRes = await req('GET', '/admin/users?page=1&limit=5', adminToken);
  record('GET', '/api/admin/users', 'Admin', 200, adminUsersRes.status, 'Admin lists users (paginated & searchable)');
  const managedUserId = adminUsersRes.data?.data?.find(u => u.email === regEmail)?._id;

  if (managedUserId) {
    const adminUpdateUser = await req('PUT', `/admin/users/${managedUserId}`, adminToken, { phone: '9998887776' });
    record('PUT', '/api/admin/users/:id', 'Admin', 200, adminUpdateUser.status, 'Admin updates user details');

    const adminDeleteUser = await req('DELETE', `/admin/users/${managedUserId}`, adminToken);
    record('DELETE', '/api/admin/users/:id', 'Admin', 200, adminDeleteUser.status, 'Admin deletes user');
  }

  const adminOrdersList = await req('GET', '/admin/orders?page=1&limit=5', adminToken);
  record('GET', '/api/admin/orders', 'Admin', 200, adminOrdersList.status, 'Admin lists all platform orders');

  const adminApproveRes = await req('PUT', `/admin/resources/${resourceId}/approve`, adminToken);
  record('PUT', '/api/admin/resources/:id/approve', 'Admin', 200, adminApproveRes.status, 'Admin approves resource');

  const adminPestAlerts = await req('GET', '/admin/pest-alerts', adminToken);
  record('GET', '/api/admin/pest-alerts', 'Admin', 200, adminPestAlerts.status, 'Admin views all pest alerts');

  const adminConsultations = await req('GET', '/admin/consultations?page=1&limit=5', adminToken);
  record('GET', '/api/admin/consultations', 'Admin', 200, adminConsultations.status, 'Admin views all consultations');

  // Farmer attempting Admin routes -> all must be 403
  const farmerStats = await req('GET', '/admin/stats', farmer1Token);
  record('GET', '/api/admin/stats', 'Farmer -> Admin Stats', 403, farmerStats.status, 'Farmer blocked from Admin stats (403)');

  const farmerUsers = await req('GET', '/admin/users', farmer1Token);
  record('GET', '/api/admin/users', 'Farmer -> Admin Users', 403, farmerUsers.status, 'Farmer blocked from Admin users (403)');

  const farmerOrders = await req('GET', '/admin/orders', farmer1Token);
  record('GET', '/api/admin/orders', 'Farmer -> Admin Orders', 403, farmerOrders.status, 'Farmer blocked from Admin orders (403)');

  const farmerApproveRes = await req('PUT', `/admin/resources/${resourceId}/approve`, farmer1Token);
  record('PUT', '/api/admin/resources/:id/approve', 'Farmer -> Admin Resource Approve', 403, farmerApproveRes.status, 'Farmer blocked from approving resource (403)');

  // Print Summary Table
  console.log('\n═'.repeat(100));
  console.log('📊 TEST RESULTS TABLE');
  console.log('═'.repeat(100));
  console.log(
    'METHOD'.padEnd(8) +
    'ENDPOINT'.padEnd(38) +
    'ROLE / SCENARIO'.padEnd(32) +
    'EXP'.padEnd(6) +
    'ACT'.padEnd(6) +
    'STATUS'
  );
  console.log('─'.repeat(100));

  let totalPass = 0;
  for (const r of results) {
    const isPass = r.pass;
    if (isPass) totalPass++;
    const mark = isPass ? '✅ PASS' : '❌ FAIL';
    console.log(
      r.method.padEnd(8) +
      r.path.padEnd(38) +
      r.role.padEnd(32) +
      String(r.expected).padEnd(6) +
      String(r.actual).padEnd(6) +
      mark + ` (${r.description})`
    );
  }

  console.log('─'.repeat(100));
  console.log(`TOTAL ENDPOINTS / CHECKS TESTED: ${results.length}`);
  console.log(`PASSED: ${totalPass} / ${results.length}`);
  console.log(`FAILED: ${results.length - totalPass}`);
  console.log('═'.repeat(100));

  if (totalPass === results.length) {
    console.log('\n🎉 ALL ENDPOINTS & GUARDS PASSED WITH 100% SUCCESS!\n');
    process.exit(0);
  } else {
    console.error('\n⚠️ SOME TESTS FAILED. PLEASE REVIEW LOG ABOVE.\n');
    process.exit(1);
  }
};

runSuite().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});

