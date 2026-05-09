/**
 * Utility functions for extracting and organizing data from request bodies
 * Separates core fields (stored in dedicated columns) from detail fields (stored in JSON)
 */

/**
 * Extract project data from request body
 * @param {Object} body - Request body
 * @returns {Object} - { coreData, details }
 */
exports.extractProjectData = (body) => {
  const coreFields = ['name', 'description', 'projectType', 'status', 'startDate', 'endDate', 'budget', 'location', 'progress'];
  const coreData = {};
  const details = {};

  // Process core fields
  coreFields.forEach(field => {
    if (body[field] !== undefined) {
      coreData[field] = body[field];
    }
  });

  // All other fields go to details
  Object.keys(body).forEach(key => {
    if (!coreFields.includes(key) && body[key] !== undefined) {
      details[key] = body[key];
    }
  });

  return { coreData, details: Object.keys(details).length > 0 ? details : undefined };
};

/**
 * Extract worker data from request body
 */
exports.extractWorkerData = (body) => {
  const coreFields = ['name', 'contactNumber', 'email', 'skillType', 'experienceYears', 'dailyWage', 'status', 'joinedDate', 'leftDate'];
  const coreData = {};
  const details = {};

  coreFields.forEach(field => {
    if (body[field] !== undefined) {
      coreData[field] = body[field];
    }
  });

  Object.keys(body).forEach(key => {
    if (!coreFields.includes(key) && body[key] !== undefined) {
      details[key] = body[key];
    }
  });

  return { coreData, details: Object.keys(details).length > 0 ? details : undefined };
};

/**
 * Extract equipment data from request body
 */
exports.extractEquipmentData = (body) => {
  const coreFields = ['name', 'equipmentType', 'model', 'serialNumber', 'purchaseDate', 'purchaseCost', 'dailyRentalCost', 'status', 'lastMaintenanceDate', 'nextMaintenanceDate'];
  const coreData = {};
  const details = {};

  coreFields.forEach(field => {
    if (body[field] !== undefined) {
      coreData[field] = body[field];
    }
  });

  Object.keys(body).forEach(key => {
    if (!coreFields.includes(key) && body[key] !== undefined) {
      details[key] = body[key];
    }
  });

  return { coreData, details: Object.keys(details).length > 0 ? details : undefined };
};

/**
 * Extract BOQ line item data from request body
 */
exports.extractBOQLineItemData = (body) => {
  const coreFields = ['description', 'unit', 'quantity', 'rate', 'notes'];
  const coreData = {};
  const details = {};

  coreFields.forEach(field => {
    if (body[field] !== undefined) {
      coreData[field] = body[field];
    }
  });

  Object.keys(body).forEach(key => {
    if (!coreFields.includes(key) && body[key] !== undefined) {
      details[key] = body[key];
    }
  });

  return { coreData, details: Object.keys(details).length > 0 ? details : undefined };
};

/**
 * Extract purchase order data from request body
 */
exports.extractPurchaseOrderData = (body) => {
  const coreFields = ['purchaseRequestId', 'projectId', 'vendorId', 'orderNumber', 'orderDate', 'expectedDeliveryDate', 'actualDeliveryDate', 'totalAmount', 'taxAmount', 'status', 'paymentTerms', 'notes'];
  const coreData = {};
  const details = {};

  coreFields.forEach(field => {
    if (body[field] !== undefined) {
      coreData[field] = body[field];
    }
  });

  Object.keys(body).forEach(key => {
    if (!coreFields.includes(key) && body[key] !== undefined) {
      details[key] = body[key];
    }
  });

  return { coreData, details: Object.keys(details).length > 0 ? details : undefined };
};

/**
 * Extract daily report data from request body
 */
exports.extractDailyReportData = (body) => {
  const coreFields = ['projectId', 'reportDate', 'weather', 'temperature', 'workersPresent', 'workersAbsent', 'workSummary', 'challengesFaced', 'materialsConsumed', 'equipmentUsed', 'safetyIncidents', 'visitors'];
  const coreData = {};
  const details = {};

  coreFields.forEach(field => {
    if (body[field] !== undefined) {
      coreData[field] = body[field];
    }
  });

  Object.keys(body).forEach(key => {
    if (!coreFields.includes(key) && body[key] !== undefined) {
      details[key] = body[key];
    }
  });

  return { coreData, details: Object.keys(details).length > 0 ? details : undefined };
};

/**
 * Extract site issue data from request body
 */
exports.extractSiteIssueData = (body) => {
  const coreFields = ['projectId', 'taskId', 'issueType', 'severity', 'title', 'description', 'status', 'reportedBy', 'assignedTo', 'resolvedBy', 'resolvedAt', 'resolutionNotes'];
  const coreData = {};
  const details = {};

  coreFields.forEach(field => {
    if (body[field] !== undefined) {
      coreData[field] = body[field];
    }
  });

  Object.keys(body).forEach(key => {
    if (!coreFields.includes(key) && body[key] !== undefined) {
      details[key] = body[key];
    }
  });

  return { coreData, details: Object.keys(details).length > 0 ? details : undefined };
};
