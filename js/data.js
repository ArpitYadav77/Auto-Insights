// ============================================================
// DATA.JS - Comprehensive Mock Data Generator
// Meesho RTO (Return-to-Origin) Optimization Platform
// ============================================================
// Generates realistic Indian ecommerce data with:
//   - 1000 customers, 5000 orders, risk scores, addresses, A/B tests
//   - Seeded PRNG for reproducibility
//   - ~22% overall RTO rate with risk-correlated distribution
//   - Helper functions for querying & aggregation
// ============================================================

(function () {
  'use strict';

  // ==========================================================
  // 1. SEEDED PSEUDO-RANDOM NUMBER GENERATOR (LCG)
  // ==========================================================
  // Linear Congruential Generator for reproducible data.
  // Parameters from Numerical Recipes (period = 2^32).
  let _seed = 42;
  function seedRandom(s) { _seed = s >>> 0; }
  function random() {
    _seed = (_seed * 1664525 + 1013904223) >>> 0;
    return (_seed >>> 0) / 4294967296;
  }
  /** Random integer in [min, max] inclusive */
  function randInt(min, max) {
    return Math.floor(random() * (max - min + 1)) + min;
  }
  /** Pick a random element from an array */
  function pick(arr) {
    return arr[Math.floor(random() * arr.length)];
  }
  /** Weighted random value – skews toward center of [min,max] */
  function weightedRand(min, max, skew) {
    // Average several uniform draws to approximate a bell curve
    let sum = 0;
    for (let i = 0; i < skew; i++) sum += random();
    return Math.floor((sum / skew) * (max - min + 1)) + min;
  }
  /** Random date between two Date objects, returns YYYY-MM-DD */
  function randomDate(start, end) {
    const ts = start.getTime() + random() * (end.getTime() - start.getTime());
    const d = new Date(ts);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  /** Pad number with leading zeros */
  function pad(n, width) {
    return String(n).padStart(width, '0');
  }

  // ==========================================================
  // 2. REFERENCE DATA – Indian Names, Cities, etc.
  // ==========================================================

  const MALE_FIRST_NAMES = [
    'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Reyansh', 'Sai',
    'Arnav', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Atharv', 'Advik',
    'Pranav', 'Advaith', 'Aaryan', 'Dhruv', 'Kabir', 'Ritvik',
    'Darsh', 'Harsh', 'Rohan', 'Rahul', 'Amit', 'Vikram', 'Sanjay',
    'Rajesh', 'Manoj', 'Karan', 'Nikhil', 'Suresh', 'Ramesh', 'Ganesh',
    'Deepak', 'Akash', 'Varun', 'Tarun', 'Mohit', 'Ankit',
    'Gaurav', 'Sachin', 'Ajay', 'Vijay', 'Pankaj', 'Manish',
    'Naveen', 'Ravi', 'Ashish', 'Yogesh'
  ];

  const FEMALE_FIRST_NAMES = [
    'Saanvi', 'Aanya', 'Aadhya', 'Aaradhya', 'Ananya', 'Pari', 'Anika',
    'Navya', 'Diya', 'Myra', 'Ira', 'Riya', 'Priya', 'Sneha',
    'Kavya', 'Ishita', 'Anvi', 'Nisha', 'Pooja', 'Meera',
    'Neha', 'Shruti', 'Swati', 'Anjali', 'Deepika', 'Simran',
    'Komal', 'Preeti', 'Rashmi', 'Tanvi', 'Divya', 'Megha',
    'Sonal', 'Jyoti', 'Pallavi', 'Nandini', 'Lakshmi', 'Geeta',
    'Sunita', 'Rekha', 'Shweta', 'Aarti', 'Bhavna', 'Chitra',
    'Heena', 'Kriti', 'Mansi', 'Shalini', 'Tanya', 'Urmila'
  ];

  const LAST_NAMES = [
    'Sharma', 'Verma', 'Patel', 'Singh', 'Reddy', 'Kumar', 'Nair',
    'Mehta', 'Joshi', 'Das', 'Gupta', 'Rao', 'Tiwari', 'Malhotra',
    'Iyer', 'Pandey', 'Kaur', 'Saxena', 'Bose', 'Choudhary',
    'Agarwal', 'Mishra', 'Chauhan', 'Shah', 'Thakur', 'Yadav',
    'Dubey', 'Srivastava', 'Tripathi', 'Menon', 'Pillai', 'Banerjee',
    'Mukherjee', 'Deshpande', 'Kulkarni', 'Patil', 'Deshmukh', 'Jain',
    'Khanna', 'Chopra', 'Kapoor', 'Bhatia', 'Sethi', 'Arora',
    'Bhatt', 'Nayak', 'Hegde', 'Gowda', 'Rajan', 'Pillai'
  ];

  // 30 Indian cities with state and base pincode info
  const CITIES = [
    { city: 'Mumbai',          state: 'Maharashtra',       pinBase: '4000' },
    { city: 'Delhi',           state: 'Delhi',             pinBase: '1100' },
    { city: 'Bangalore',       state: 'Karnataka',         pinBase: '5600' },
    { city: 'Hyderabad',       state: 'Telangana',         pinBase: '5000' },
    { city: 'Chennai',         state: 'Tamil Nadu',        pinBase: '6000' },
    { city: 'Kolkata',         state: 'West Bengal',       pinBase: '7000' },
    { city: 'Pune',            state: 'Maharashtra',       pinBase: '4110' },
    { city: 'Ahmedabad',       state: 'Gujarat',           pinBase: '3800' },
    { city: 'Jaipur',          state: 'Rajasthan',         pinBase: '3020' },
    { city: 'Lucknow',         state: 'Uttar Pradesh',     pinBase: '2260' },
    { city: 'Kanpur',          state: 'Uttar Pradesh',     pinBase: '2080' },
    { city: 'Nagpur',          state: 'Maharashtra',       pinBase: '4400' },
    { city: 'Patna',           state: 'Bihar',             pinBase: '8000' },
    { city: 'Indore',          state: 'Madhya Pradesh',    pinBase: '4520' },
    { city: 'Bhopal',          state: 'Madhya Pradesh',    pinBase: '4620' },
    { city: 'Visakhapatnam',   state: 'Andhra Pradesh',    pinBase: '5300' },
    { city: 'Vadodara',        state: 'Gujarat',           pinBase: '3900' },
    { city: 'Ghaziabad',       state: 'Uttar Pradesh',     pinBase: '2010' },
    { city: 'Ludhiana',        state: 'Punjab',            pinBase: '1410' },
    { city: 'Agra',            state: 'Uttar Pradesh',     pinBase: '2820' },
    { city: 'Nashik',          state: 'Maharashtra',       pinBase: '4220' },
    { city: 'Ranchi',          state: 'Jharkhand',         pinBase: '8340' },
    { city: 'Faridabad',       state: 'Haryana',           pinBase: '1210' },
    { city: 'Meerut',          state: 'Uttar Pradesh',     pinBase: '2500' },
    { city: 'Rajkot',          state: 'Gujarat',           pinBase: '3600' },
    { city: 'Varanasi',        state: 'Uttar Pradesh',     pinBase: '2210' },
    { city: 'Srinagar',        state: 'Jammu & Kashmir',   pinBase: '1900' },
    { city: 'Coimbatore',      state: 'Tamil Nadu',        pinBase: '6410' },
    { city: 'Madurai',         state: 'Tamil Nadu',        pinBase: '6250' },
    { city: 'Kochi',           state: 'Kerala',            pinBase: '6820' }
  ];

  const PRODUCT_CATEGORIES = [
    'Fashion', 'Electronics', 'Home & Kitchen', 'Beauty', 'Sports', 'Books'
  ];

  // Realistic Indian street / area names for address generation
  const STREET_NAMES = [
    'MG Road', 'Station Road', 'Ring Road', 'Gandhi Nagar',
    'Nehru Marg', 'Tilak Road', 'Subhash Chowk', 'Civil Lines',
    'Rajendra Nagar', 'Shastri Nagar', 'Vikas Nagar', 'Patel Nagar',
    'Laxmi Nagar', 'Indira Colony', 'Ambedkar Road', 'Sadar Bazaar',
    'Karol Bagh', 'Malviya Nagar', 'Sector Road', 'Industrial Area'
  ];

  const AREA_NAMES = [
    'Andheri East', 'Bandra West', 'Koramangala', 'Whitefield',
    'Hitech City', 'Salt Lake', 'Kothrud', 'Vastrapur',
    'Mansarovar', 'Gomti Nagar', 'Arera Colony', 'MVP Colony',
    'Old City', 'Saket Nagar', 'Model Town', 'Sector 15',
    'Rajouri Garden', 'Anna Nagar', 'Velachery', 'Alwarpet',
    'Jubilee Hills', 'Banjara Hills', 'Indiranagar', 'HSR Layout',
    'Powai', 'Dadar', 'Thane', 'Viman Nagar', 'Aundh', 'Hinjewadi'
  ];

  const ADDRESS_ISSUES = [
    'Missing Pincode',
    'Missing House Number',
    'Incomplete Address',
    'Ambiguous Location',
    'Missing Landmark',
    'Invalid State Name',
    'Missing Street Name',
    'Misspelled City Name'
  ];

  // ==========================================================
  // 3. GENERATE CUSTOMERS (1000)
  // ==========================================================
  seedRandom(42); // Reset seed for reproducibility

  const customers = [];
  const twoYearsAgo = new Date('2024-06-04');
  const today = new Date('2026-06-04');

  for (let i = 1; i <= 1000; i++) {
    const isFemale = random() < 0.48;
    const firstName = isFemale ? pick(FEMALE_FIRST_NAMES) : pick(MALE_FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const name = firstName + ' ' + lastName;
    const cityInfo = pick(CITIES);
    const phoneDigits = pad(randInt(60000, 99999), 5) + ' ' + pad(randInt(10000, 99999), 5);
    const emailName = firstName.toLowerCase() + '.' + lastName.toLowerCase();
    const emailDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'rediffmail.com'];
    const email = emailName + randInt(1, 99) + '@' + pick(emailDomains);
    const joinDate = randomDate(twoYearsAgo, today);

    customers.push({
      customer_id: 'C-' + pad(i, 4),
      name: name,
      city: cityInfo.city,
      state: cityInfo.state,
      phone: '+91 ' + phoneDigits,
      email: email,
      join_date: joinDate
    });
  }

  // ==========================================================
  // 4. ASSIGN RISK TIERS TO CUSTOMERS (before order gen)
  // ==========================================================
  // Pre-assign each customer a risk tier that will drive their
  // order behavior. This ensures realistic, correlated data.
  //   ~15% High risk  → RTO rate 40-70%
  //   ~25% Medium risk → RTO rate 20-35%
  //   ~60% Low risk   → RTO rate 5-15%

  const customerRiskTier = {}; // customer_id → 'High' | 'Medium' | 'Low'
  customers.forEach(function (c) {
    const r = random();
    if (r < 0.15) {
      customerRiskTier[c.customer_id] = 'High';
    } else if (r < 0.40) {
      customerRiskTier[c.customer_id] = 'Medium';
    } else {
      customerRiskTier[c.customer_id] = 'Low';
    }
  });

  // ==========================================================
  // 5. GENERATE ORDERS (5000)
  // ==========================================================
  // Distribution: some customers get many orders, others get few.
  // We use a power-law-ish selection to create repeat buyers.

  const orders = [];
  const sixMonthsAgo = new Date('2025-12-04');

  // Build a weighted customer pool – repeat buyers get more weight
  const customerPool = [];
  customers.forEach(function (c) {
    // High-risk customers tend to order more (more COD experiments)
    const tier = customerRiskTier[c.customer_id];
    const weight = tier === 'High' ? 12 : tier === 'Medium' ? 6 : 3;
    for (let w = 0; w < weight; w++) customerPool.push(c.customer_id);
  });

  for (let i = 1; i <= 5000; i++) {
    const customerId = pick(customerPool);
    const customer = customers.find(function (c) { return c.customer_id === customerId; });
    const tier = customerRiskTier[customerId];

    // Payment method: High risk → 85% COD, Medium → 70% COD, Low → 50% COD
    // Overall should land near 65% COD
    let paymentMethod;
    const codChance = tier === 'High' ? 0.85 : tier === 'Medium' ? 0.70 : 0.50;
    paymentMethod = random() < codChance ? 'COD' : 'Prepaid';

    // Order value: weighted toward 500-3000 range using bell-curve approximation
    let orderValue = weightedRand(200, 15000, 4);
    // Clamp toward realistic center
    if (orderValue > 8000) orderValue = weightedRand(500, 5000, 3);

    // Order status with risk-tier-correlated RTO rates
    // Target ~22% overall RTO. High=~55%, Medium=~27%, Low=~10%
    let orderStatus;
    const rtoChance = tier === 'High' ? 0.55 : tier === 'Medium' ? 0.27 : 0.10;
    const statusRoll = random();
    if (statusRoll < rtoChance) {
      orderStatus = 'RTO';
    } else if (statusRoll < rtoChance + 0.08) {
      orderStatus = 'In Transit';
    } else if (statusRoll < rtoChance + 0.12) {
      orderStatus = 'Processing';
    } else {
      orderStatus = 'Delivered';
    }

    // Product category – Fashion dominates (~40%)
    const catRoll = random();
    let productCategory;
    if (catRoll < 0.40) productCategory = 'Fashion';
    else if (catRoll < 0.55) productCategory = 'Electronics';
    else if (catRoll < 0.70) productCategory = 'Home & Kitchen';
    else if (catRoll < 0.82) productCategory = 'Beauty';
    else if (catRoll < 0.92) productCategory = 'Sports';
    else productCategory = 'Books';

    const orderDate = randomDate(sixMonthsAgo, today);

    orders.push({
      order_id: 'ORD-' + pad(i, 5),
      customer_id: customerId,
      order_value: orderValue,
      payment_method: paymentMethod,
      order_status: orderStatus,
      order_date: orderDate,
      product_category: productCategory,
      delivery_city: customer.city
    });
  }

  // ==========================================================
  // 6. COMPUTE RISK SCORES (1000 – one per customer)
  // ==========================================================
  // Calculated from actual generated order data for consistency.

  const riskScores = [];

  customers.forEach(function (c) {
    const custOrders = orders.filter(function (o) { return o.customer_id === c.customer_id; });
    const totalOrders = custOrders.length;
    const rtoOrders = custOrders.filter(function (o) { return o.order_status === 'RTO'; }).length;
    const historicalRto = totalOrders > 0 ? (rtoOrders / totalOrders) * 100 : 0;
    const codOrders = custOrders.filter(function (o) { return o.payment_method === 'COD'; }).length;
    const prepaidOrders = totalOrders - codOrders;
    const preferredPayment = codOrders >= prepaidOrders ? 'COD' : 'Prepaid';
    const totalValue = custOrders.reduce(function (sum, o) { return sum + o.order_value; }, 0);
    const avgOrderValue = totalOrders > 0 ? Math.round(totalValue / totalOrders) : 0;

    // Sort orders by date descending to get last order
    const sortedOrders = custOrders.slice().sort(function (a, b) {
      return new Date(b.order_date) - new Date(a.order_date);
    });
    const lastOrderDate = sortedOrders.length > 0 ? sortedOrders[0].order_date : c.join_date;

    // --- Risk Score Calculation ---
    let score = 0;

    // Historical RTO > 40% → +50 points
    if (historicalRto > 40) score += 50;
    else if (historicalRto > 25) score += 30;
    else if (historicalRto > 15) score += 15;

    // Preferred payment COD → +20 points
    if (preferredPayment === 'COD') score += 20;

    // Avg order value > 3000 → +15 points
    if (avgOrderValue > 3000) score += 15;

    // Invalid address → +15 points (we'll check this after address gen,
    // but pre-compute using the risk tier as proxy for now)
    const tier = customerRiskTier[c.customer_id];
    if (tier === 'High') score += 15;
    else if (tier === 'Medium' && random() < 0.3) score += 15;

    // Base random factor: 0-10 points
    score += randInt(0, 10);

    // Clamp to 0-100
    score = Math.min(100, Math.max(0, score));

    // Determine risk level from score
    let riskLevel;
    if (score >= 70) riskLevel = 'High';
    else if (score >= 40) riskLevel = 'Medium';
    else riskLevel = 'Low';

    riskScores.push({
      customer_id: c.customer_id,
      risk_score: score,
      risk_level: riskLevel,
      historical_rto_percent: Math.round(historicalRto * 10) / 10,
      total_orders: totalOrders,
      total_rto_orders: rtoOrders,
      preferred_payment: preferredPayment,
      avg_order_value: avgOrderValue,
      last_order_date: lastOrderDate
    });
  });

  // ==========================================================
  // 7. GENERATE ADDRESSES (1000 – one per customer)
  // ==========================================================
  // ~70% Valid, ~20% Partially Valid, ~10% Invalid
  // High risk customers have more invalid addresses.

  const addresses = [];

  customers.forEach(function (c, idx) {
    const cityInfo = CITIES.find(function (ci) { return ci.city === c.city; });
    const pinSuffix = pad(randInt(10, 99), 2);
    const pincode = (cityInfo ? cityInfo.pinBase : '1100') + pinSuffix;
    const houseNo = randInt(1, 500);
    const floor = randInt(0, 12);
    const street = pick(STREET_NAMES);
    const area = pick(AREA_NAMES);
    const state = cityInfo ? cityInfo.state : 'Unknown';

    const fullAddress = houseNo + ', ' + (floor > 0 ? 'Floor ' + floor + ', ' : '') +
      street + ', ' + area + ', ' + c.city + ', ' + state + ' - ' + pincode;

    // Validity based on risk tier
    const tier = customerRiskTier[c.customer_id];
    let validityStatus, issues = [], suggestedCorrection = null, confidenceScore;
    const validRoll = random();

    if (tier === 'High') {
      // High risk: 35% Valid, 35% Partial, 30% Invalid
      if (validRoll < 0.35) {
        validityStatus = 'Valid';
        confidenceScore = randInt(85, 100);
      } else if (validRoll < 0.70) {
        validityStatus = 'Partially Valid';
        const numIssues = randInt(1, 2);
        for (let n = 0; n < numIssues; n++) {
          const issue = pick(ADDRESS_ISSUES);
          if (issues.indexOf(issue) === -1) issues.push(issue);
        }
        confidenceScore = randInt(50, 78);
        suggestedCorrection = houseNo + ', ' + street + ', ' + area + ', ' + c.city + ', ' + state + ' - ' + pincode;
      } else {
        validityStatus = 'Invalid';
        const numIssues = randInt(2, 4);
        for (let n = 0; n < numIssues; n++) {
          const issue = pick(ADDRESS_ISSUES);
          if (issues.indexOf(issue) === -1) issues.push(issue);
        }
        confidenceScore = randInt(10, 40);
        suggestedCorrection = houseNo + ', ' + street + ', ' + c.city + ', ' + state + ' - ' + pincode;
      }
    } else if (tier === 'Medium') {
      // Medium risk: 65% Valid, 25% Partial, 10% Invalid
      if (validRoll < 0.65) {
        validityStatus = 'Valid';
        confidenceScore = randInt(88, 100);
      } else if (validRoll < 0.90) {
        validityStatus = 'Partially Valid';
        issues.push(pick(ADDRESS_ISSUES));
        confidenceScore = randInt(55, 80);
        suggestedCorrection = houseNo + ', ' + street + ', ' + area + ', ' + c.city + ', ' + state + ' - ' + pincode;
      } else {
        validityStatus = 'Invalid';
        const numIssues = randInt(2, 3);
        for (let n = 0; n < numIssues; n++) {
          const issue = pick(ADDRESS_ISSUES);
          if (issues.indexOf(issue) === -1) issues.push(issue);
        }
        confidenceScore = randInt(15, 42);
        suggestedCorrection = houseNo + ', ' + street + ', ' + c.city + ', ' + state + ' - ' + pincode;
      }
    } else {
      // Low risk: 85% Valid, 12% Partial, 3% Invalid
      if (validRoll < 0.85) {
        validityStatus = 'Valid';
        confidenceScore = randInt(90, 100);
      } else if (validRoll < 0.97) {
        validityStatus = 'Partially Valid';
        issues.push(pick(ADDRESS_ISSUES));
        confidenceScore = randInt(60, 82);
        suggestedCorrection = houseNo + ', ' + street + ', ' + area + ', ' + c.city + ', ' + state + ' - ' + pincode;
      } else {
        validityStatus = 'Invalid';
        issues.push(pick(ADDRESS_ISSUES));
        issues.push(pick(ADDRESS_ISSUES));
        confidenceScore = randInt(20, 45);
        suggestedCorrection = houseNo + ', ' + street + ', ' + c.city + ', ' + state + ' - ' + pincode;
      }
    }

    const verificationDate = randomDate(sixMonthsAgo, today);

    addresses.push({
      address_id: 'ADDR-' + pad(idx + 1, 4),
      customer_id: c.customer_id,
      full_address: fullAddress,
      pincode: pincode,
      city: c.city,
      state: state,
      validity_status: validityStatus,
      issues: issues,
      suggested_correction: suggestedCorrection,
      verification_date: verificationDate,
      confidence_score: confidenceScore
    });
  });

  // ==========================================================
  // 8. A/B TEST DATA
  // ==========================================================
  // 30 days of experiment data comparing Normal vs Risk-Based Checkout

  const abTestStartDate = new Date('2026-05-05');

  // Generate 30 days of daily data
  const dailyData = [];
  let varA_totalOrders = 0, varA_totalConversions = 0, varA_totalRTO = 0;
  let varA_totalRevenue = 0, varA_totalLogisticsCost = 0;
  let varB_totalOrders = 0, varB_totalConversions = 0, varB_totalRTO = 0;
  let varB_totalRevenue = 0, varB_totalLogisticsCost = 0;

  for (let day = 0; day < 30; day++) {
    const d = new Date(abTestStartDate);
    d.setDate(d.getDate() + day);
    const dateStr = d.getFullYear() + '-' +
      pad(d.getMonth() + 1, 2) + '-' + pad(d.getDate(), 2);

    // Variant A: Normal Checkout (~22% RTO)
    const aOrders = randInt(150, 200);
    const aConversions = Math.round(aOrders * (0.72 + random() * 0.06));
    const aRTO = Math.round(aOrders * (0.20 + random() * 0.05));
    const aRevenue = aOrders * randInt(800, 1200);
    const aLogistics = aRTO * randInt(120, 200);

    // Variant B: Risk-Based Checkout (~15% RTO, higher conversion)
    const bOrders = randInt(150, 200);
    const bConversions = Math.round(bOrders * (0.78 + random() * 0.06));
    const bRTO = Math.round(bOrders * (0.12 + random() * 0.05));
    const bRevenue = bOrders * randInt(850, 1250);
    const bLogistics = bRTO * randInt(120, 200);

    dailyData.push({
      date: dateStr,
      variant_a: {
        orders: aOrders,
        conversions: aConversions,
        rto_count: aRTO,
        revenue: aRevenue,
        logistics_cost: aLogistics
      },
      variant_b: {
        orders: bOrders,
        conversions: bConversions,
        rto_count: bRTO,
        revenue: bRevenue,
        logistics_cost: bLogistics
      }
    });

    varA_totalOrders += aOrders;
    varA_totalConversions += aConversions;
    varA_totalRTO += aRTO;
    varA_totalRevenue += aRevenue;
    varA_totalLogisticsCost += aLogistics;

    varB_totalOrders += bOrders;
    varB_totalConversions += bConversions;
    varB_totalRTO += bRTO;
    varB_totalRevenue += bRevenue;
    varB_totalLogisticsCost += bLogistics;
  }

  const abEndDate = new Date(abTestStartDate);
  abEndDate.setDate(abEndDate.getDate() + 29);
  const abEndStr = abEndDate.getFullYear() + '-' +
    pad(abEndDate.getMonth() + 1, 2) + '-' + pad(abEndDate.getDate(), 2);

  const abTestData = {
    experiment_id: 'EXP-001',
    experiment_name: 'Risk-Based Checkout vs Normal Checkout',
    start_date: '2026-05-05',
    end_date: abEndStr,
    status: 'Completed',
    variant_a: {
      name: 'Normal Checkout',
      orders: varA_totalOrders,
      conversions: varA_totalConversions,
      conversion_rate: Math.round((varA_totalConversions / varA_totalOrders) * 1000) / 10,
      rto_count: varA_totalRTO,
      rto_rate: Math.round((varA_totalRTO / varA_totalOrders) * 1000) / 10,
      revenue: varA_totalRevenue,
      logistics_cost: varA_totalLogisticsCost,
      net_revenue: varA_totalRevenue - varA_totalLogisticsCost
    },
    variant_b: {
      name: 'Risk-Based Checkout',
      orders: varB_totalOrders,
      conversions: varB_totalConversions,
      conversion_rate: Math.round((varB_totalConversions / varB_totalOrders) * 1000) / 10,
      rto_count: varB_totalRTO,
      rto_rate: Math.round((varB_totalRTO / varB_totalOrders) * 1000) / 10,
      revenue: varB_totalRevenue,
      logistics_cost: varB_totalLogisticsCost,
      net_revenue: varB_totalRevenue - varB_totalLogisticsCost
    },
    daily_data: dailyData
  };

  // ==========================================================
  // 9. HELPER FUNCTIONS
  // ==========================================================

  /** Get all orders for a specific customer */
  function getCustomerOrders(customerId) {
    return orders.filter(function (o) { return o.customer_id === customerId; });
  }

  /** Get risk score record for a specific customer */
  function getCustomerRisk(customerId) {
    return riskScores.find(function (r) { return r.customer_id === customerId; }) || null;
  }

  /** Get address record for a specific customer */
  function getCustomerAddress(customerId) {
    return addresses.find(function (a) { return a.customer_id === customerId; }) || null;
  }

  /** Filter orders by status ('Delivered', 'RTO', 'In Transit', 'Processing') */
  function getOrdersByStatus(status) {
    return orders.filter(function (o) { return o.order_status === status; });
  }

  /** Get orders for customers at a specific risk level */
  function getOrdersByRiskLevel(level) {
    var custIds = {};
    riskScores.forEach(function (r) {
      if (r.risk_level === level) custIds[r.customer_id] = true;
    });
    return orders.filter(function (o) { return custIds[o.customer_id]; });
  }

  /** Return top N cities ranked by average risk score */
  function getTopRiskyCities(n) {
    var cityScores = {};
    riskScores.forEach(function (r) {
      var customer = customers.find(function (c) { return c.customer_id === r.customer_id; });
      if (!customer) return;
      var city = customer.city;
      if (!cityScores[city]) cityScores[city] = { totalScore: 0, count: 0, totalOrders: 0, rtoOrders: 0 };
      cityScores[city].totalScore += r.risk_score;
      cityScores[city].count += 1;
      cityScores[city].totalOrders += r.total_orders;
      cityScores[city].rtoOrders += r.total_rto_orders;
    });

    var result = [];
    for (var city in cityScores) {
      if (cityScores.hasOwnProperty(city)) {
        var cs = cityScores[city];
        result.push({
          city: city,
          avg_risk_score: Math.round((cs.totalScore / cs.count) * 10) / 10,
          customer_count: cs.count,
          total_orders: cs.totalOrders,
          rto_rate: cs.totalOrders > 0 ? Math.round((cs.rtoOrders / cs.totalOrders) * 1000) / 10 : 0
        });
      }
    }
    result.sort(function (a, b) { return b.avg_risk_score - a.avg_risk_score; });
    return result.slice(0, n || 10);
  }

  /** Return top N customers by risk score */
  function getTopRiskyCustomers(n) {
    var sorted = riskScores.slice().sort(function (a, b) { return b.risk_score - a.risk_score; });
    return sorted.slice(0, n || 10).map(function (r) {
      var customer = customers.find(function (c) { return c.customer_id === r.customer_id; });
      return {
        customer_id: r.customer_id,
        name: customer ? customer.name : 'Unknown',
        city: customer ? customer.city : 'Unknown',
        risk_score: r.risk_score,
        risk_level: r.risk_level,
        rto_percent: r.historical_rto_percent,
        total_orders: r.total_orders,
        preferred_payment: r.preferred_payment
      };
    });
  }

  /** Aggregate revenue by city */
  function getRevenueByCity() {
    var cityRevenue = {};
    orders.forEach(function (o) {
      if (!cityRevenue[o.delivery_city]) {
        cityRevenue[o.delivery_city] = { total_revenue: 0, order_count: 0, rto_count: 0 };
      }
      cityRevenue[o.delivery_city].total_revenue += o.order_value;
      cityRevenue[o.delivery_city].order_count += 1;
      if (o.order_status === 'RTO') cityRevenue[o.delivery_city].rto_count += 1;
    });

    var result = [];
    for (var city in cityRevenue) {
      if (cityRevenue.hasOwnProperty(city)) {
        var cr = cityRevenue[city];
        result.push({
          city: city,
          total_revenue: cr.total_revenue,
          order_count: cr.order_count,
          avg_order_value: Math.round(cr.total_revenue / cr.order_count),
          rto_count: cr.rto_count,
          rto_rate: Math.round((cr.rto_count / cr.order_count) * 1000) / 10
        });
      }
    }
    result.sort(function (a, b) { return b.total_revenue - a.total_revenue; });
    return result;
  }

  /** Return monthly RTO rates for the last 6 months */
  function getRTOTrend() {
    var months = {};
    var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    orders.forEach(function (o) {
      var d = new Date(o.order_date);
      var key = d.getFullYear() + '-' + pad(d.getMonth() + 1, 2);
      if (!months[key]) months[key] = { total: 0, rto: 0, month: monthNames[d.getMonth()], year: d.getFullYear() };
      months[key].total += 1;
      if (o.order_status === 'RTO') months[key].rto += 1;
    });

    // Sort by key (YYYY-MM) and take last 6
    var keys = Object.keys(months).sort();
    var recent = keys.slice(-6);
    return recent.map(function (key) {
      var m = months[key];
      return {
        month: m.month + ' ' + m.year,
        label: m.month,
        total_orders: m.total,
        rto_orders: m.rto,
        rto_rate: Math.round((m.rto / m.total) * 1000) / 10
      };
    });
  }

  /** COD vs Prepaid comparison metrics */
  function getCODvsPrepaid() {
    var cod = { orders: 0, revenue: 0, rto: 0, delivered: 0 };
    var prepaid = { orders: 0, revenue: 0, rto: 0, delivered: 0 };

    orders.forEach(function (o) {
      var bucket = o.payment_method === 'COD' ? cod : prepaid;
      bucket.orders += 1;
      bucket.revenue += o.order_value;
      if (o.order_status === 'RTO') bucket.rto += 1;
      if (o.order_status === 'Delivered') bucket.delivered += 1;
    });

    return {
      cod: {
        total_orders: cod.orders,
        total_revenue: cod.revenue,
        avg_order_value: Math.round(cod.revenue / cod.orders),
        rto_count: cod.rto,
        rto_rate: Math.round((cod.rto / cod.orders) * 1000) / 10,
        delivered_count: cod.delivered,
        delivery_rate: Math.round((cod.delivered / cod.orders) * 1000) / 10,
        share_percent: Math.round((cod.orders / orders.length) * 1000) / 10
      },
      prepaid: {
        total_orders: prepaid.orders,
        total_revenue: prepaid.revenue,
        avg_order_value: Math.round(prepaid.revenue / prepaid.orders),
        rto_count: prepaid.rto,
        rto_rate: Math.round((prepaid.rto / prepaid.orders) * 1000) / 10,
        delivered_count: prepaid.delivered,
        delivery_rate: Math.round((prepaid.delivered / prepaid.orders) * 1000) / 10,
        share_percent: Math.round((prepaid.orders / orders.length) * 1000) / 10
      }
    };
  }

  // ==========================================================
  // 10. EXPORT – window.MeeshoData
  // ==========================================================

  window.MeeshoData = {
    // Raw data tables
    customers: customers,
    orders: orders,
    riskScores: riskScores,
    addresses: addresses,
    abTestData: abTestData,

    // Helper / query functions
    getCustomerOrders: getCustomerOrders,
    getCustomerRisk: getCustomerRisk,
    getCustomerAddress: getCustomerAddress,
    getOrdersByStatus: getOrdersByStatus,
    getOrdersByRiskLevel: getOrdersByRiskLevel,
    getTopRiskyCities: getTopRiskyCities,
    getTopRiskyCustomers: getTopRiskyCustomers,
    getRevenueByCity: getRevenueByCity,
    getRTOTrend: getRTOTrend,
    getCODvsPrepaid: getCODvsPrepaid
  };

  // ==========================================================
  // 11. BACKWARD COMPATIBILITY – MOCK_DATA
  // ==========================================================
  // The existing app.js references MOCK_DATA with a specific
  // shape. Build it from the generated data so charts & tables
  // continue to work without changes to app.js.

  // Compute aggregate stats
  var totalOrders = orders.length;
  var rtoOrders = orders.filter(function (o) { return o.order_status === 'RTO'; }).length;
  var totalRevenue = orders.reduce(function (s, o) { return s + o.order_value; }, 0);
  var highRiskCount = riskScores.filter(function (r) { return r.risk_level === 'High'; }).length;
  var avgRTOCost = 150; // estimated per-RTO cost in INR
  var costSaved = Math.round(rtoOrders * avgRTOCost * 0.35); // 35% saved via interventions

  // Build MOCK_DATA.orders in the shape app.js expects
  var mockOrders = orders.slice(0, 20).map(function (o) {
    var cust = customers.find(function (c) { return c.customer_id === o.customer_id; });
    var risk = riskScores.find(function (r) { return r.customer_id === o.customer_id; });
    var addr = addresses.find(function (a) { return a.customer_id === o.customer_id; });
    return {
      id: o.order_id,
      customer: cust ? cust.name : 'Unknown',
      email: cust ? cust.email : '',
      value: o.order_value,
      payment: o.payment_method,
      riskScore: risk ? risk.risk_score : 0,
      riskLevel: risk ? risk.risk_level : 'Low',
      status: o.order_status,
      date: o.order_date,
      city: o.delivery_city,
      pincode: addr ? addr.pincode : '000000',
      items: randInt(1, 5),
      category: o.product_category
    };
  });

  // Build MOCK_DATA.customers with the detail shape app.js expects
  var topRiskyForLegacy = getTopRiskyCustomers(6);
  var mockCustomers = topRiskyForLegacy.map(function (tr) {
    var cust = customers.find(function (c) { return c.customer_id === tr.customer_id; });
    var risk = getCustomerRisk(tr.customer_id);
    var addr = getCustomerAddress(tr.customer_id);
    var custOrders = getCustomerOrders(tr.customer_id);
    var delivered = custOrders.filter(function (o) { return o.order_status === 'Delivered'; }).length;
    var rto = custOrders.filter(function (o) { return o.order_status === 'RTO'; }).length;
    var cancelled = custOrders.filter(function (o) { return o.order_status === 'Processing'; }).length;
    var rtoPercent = custOrders.length > 0 ? Math.round((rto / custOrders.length) * 1000) / 10 : 0;

    // Recommendation based on risk
    var recommendation;
    if (risk && risk.risk_level === 'High') {
      recommendation = 'Block COD & Flag Account. High RTO rate with risk indicators. Consider blocking COD entirely and implementing OTP verification for future orders.';
    } else if (risk && risk.risk_level === 'Medium') {
      recommendation = 'Partial Restriction. Moderate RTO rate warrants attention. Suggest implementing partial prepaid requirement (50% advance) for high-value orders above ₹1500.';
    } else {
      recommendation = 'Trusted Customer. Good delivery history. Eligible for premium benefits, priority shipping, and higher COD limits.';
    }

    // Last 6 orders for historical view
    var recentOrders = custOrders
      .sort(function (a, b) { return new Date(b.order_date) - new Date(a.order_date); })
      .slice(0, 6)
      .map(function (o) {
        return {
          id: o.order_id,
          date: o.order_date,
          value: o.order_value,
          status: o.order_status,
          payment: o.payment_method
        };
      });

    return {
      id: tr.customer_id,
      name: cust ? cust.name : 'Unknown',
      email: cust ? cust.email : '',
      phone: cust ? cust.phone : '',
      city: cust ? cust.city : '',
      pincode: addr ? addr.pincode : '',
      joinDate: cust ? cust.join_date : '',
      totalOrders: custOrders.length,
      deliveredOrders: delivered,
      rtoOrders: rto,
      cancelledOrders: cancelled,
      rtoPercent: rtoPercent,
      riskScore: risk ? risk.risk_score : 0,
      riskLevel: risk ? risk.risk_level : 'Low',
      avgOrderValue: risk ? risk.avg_order_value : 0,
      preferredPayment: risk ? risk.preferred_payment : 'COD',
      lastOrderDate: risk ? risk.last_order_date : '',
      addressChanges: randInt(0, 8),
      recommendation: recommendation,
      historicalOrders: recentOrders
    };
  });

  // Monthly trend from generated data
  var trend = getRTOTrend();
  var trendLabels = trend.map(function (t) { return t.label; });
  var trendData = trend.map(function (t) { return t.rto_rate; });
  // Simulated previous year (slightly higher)
  var trendPrevYear = trendData.map(function (v) { return Math.round((v + 4 + random() * 3) * 10) / 10; });

  // Top RTO cities from generated data
  var topCities = getTopRiskyCities(6);

  // Risk distribution
  var lowCount = riskScores.filter(function (r) { return r.risk_level === 'Low'; }).length;
  var medCount = riskScores.filter(function (r) { return r.risk_level === 'Medium'; }).length;
  var highCount = riskScores.filter(function (r) { return r.risk_level === 'High'; }).length;
  var totalCustomers = riskScores.length;

  // COD vs Prepaid monthly
  var codPrepaidData = getCODvsPrepaid();

  // Category RTO
  var categoryStats = {};
  orders.forEach(function (o) {
    if (!categoryStats[o.product_category]) categoryStats[o.product_category] = { total: 0, rto: 0 };
    categoryStats[o.product_category].total += 1;
    if (o.order_status === 'RTO') categoryStats[o.product_category].rto += 1;
  });
  var categoryRTO = [];
  for (var cat in categoryStats) {
    if (categoryStats.hasOwnProperty(cat)) {
      var cs = categoryStats[cat];
      categoryRTO.push({
        category: cat,
        rtoRate: Math.round((cs.rto / cs.total) * 1000) / 10,
        orders: cs.total
      });
    }
  }
  categoryRTO.sort(function (a, b) { return b.rtoRate - a.rtoRate; });

  // Monthly orders for trend chart
  var monthlyRTO = {};
  orders.forEach(function (o) {
    var d = new Date(o.order_date);
    var key = d.getFullYear() + '-' + pad(d.getMonth() + 1, 2);
    if (!monthlyRTO[key]) monthlyRTO[key] = { total: 0, rto: 0 };
    monthlyRTO[key].total += 1;
    if (o.order_status === 'RTO') monthlyRTO[key].rto += 1;
  });
  var monthKeys = Object.keys(monthlyRTO).sort().slice(-6);
  var monthlyRTOCount = monthKeys.map(function (k) { return monthlyRTO[k].rto; });
  var monthlyTotalOrders = monthKeys.map(function (k) { return monthlyRTO[k].total; });

  // COD vs Prepaid monthly breakdown
  var codMonthly = {};
  orders.forEach(function (o) {
    var d = new Date(o.order_date);
    var key = d.getFullYear() + '-' + pad(d.getMonth() + 1, 2);
    if (!codMonthly[key]) codMonthly[key] = { total: 0, cod: 0 };
    codMonthly[key].total += 1;
    if (o.payment_method === 'COD') codMonthly[key].cod += 1;
  });
  var codLabels = Object.keys(codMonthly).sort().slice(-6);
  var codPercents = codLabels.map(function (k) { return Math.round((codMonthly[k].cod / codMonthly[k].total) * 100); });
  var prepaidPercents = codPercents.map(function (v) { return 100 - v; });
  var codMonthLabels = codLabels.map(function (k) {
    var monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return monthNames[parseInt(k.split('-')[1], 10) - 1];
  });

  window.MOCK_DATA = {
    stats: {
      totalOrders: totalOrders,
      rtoPercent: Math.round((rtoOrders / totalOrders) * 1000) / 10,
      highRiskUsers: highRiskCount,
      costSaved: costSaved,
      totalRevenue: totalRevenue,
      avgOrderValue: Math.round(totalRevenue / totalOrders),
      prepaidPercent: Math.round(codPrepaidData.prepaid.share_percent),
      codPercent: Math.round(codPrepaidData.cod.share_percent),
      trends: {
        totalOrders: { value: 12.5, direction: 'up' },
        rtoPercent: { value: 3.2, direction: 'down' },
        highRiskUsers: { value: 8.1, direction: 'up' },
        costSaved: { value: 22.4, direction: 'up' }
      }
    },
    orders: mockOrders,
    customers: mockCustomers,
    analytics: {
      rtoTrend: {
        labels: trendLabels,
        data: trendData,
        previousYear: trendPrevYear
      },
      riskDistribution: {
        labels: ['Low Risk', 'Medium Risk', 'High Risk'],
        data: [
          Math.round((lowCount / totalCustomers) * 100),
          Math.round((medCount / totalCustomers) * 100),
          Math.round((highCount / totalCustomers) * 100)
        ],
        colors: ['#10b981', '#f59e0b', '#ef4444']
      },
      codVsPrepaid: {
        labels: codMonthLabels,
        cod: codPercents,
        prepaid: prepaidPercents
      },
      monthlyRTO: {
        labels: trendLabels,
        rtoCount: monthlyRTOCount,
        totalOrders: monthlyTotalOrders
      },
      topRTOCities: topCities.map(function (c) {
        return { city: c.city, rtoRate: c.rto_rate, orders: c.total_orders };
      }),
      categoryRTO: categoryRTO
    }
  };

  // ==========================================================
  // 12. DATA INTEGRITY LOG (console only, for verification)
  // ==========================================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📦 MeeshoData Generation Complete');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   Customers:  ' + customers.length);
  console.log('   Orders:     ' + orders.length);
  console.log('   RTO Orders: ' + rtoOrders + ' (' + (Math.round((rtoOrders / totalOrders) * 1000) / 10) + '%)');
  console.log('   Risk Scores:' + riskScores.length);
  console.log('   Addresses:  ' + addresses.length);
  console.log('   High Risk:  ' + highRiskCount);
  console.log('   Medium Risk:' + medCount);
  console.log('   Low Risk:   ' + lowCount);
  console.log('   COD Share:  ' + codPrepaidData.cod.share_percent + '%');
  console.log('   A/B Test:   ' + abTestData.experiment_name);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

})();
