/**
 * Predictive Analytics Module for StreetPaws
 * Implements forecasting and hotspot detection algorithms
 */

// Helper function to calculate variance for confidence intervals
const calculateVariance = (data) => {
  if (data.length === 0) return 0;
  const mean = data.reduce((sum, d) => sum + d.value, 0) / data.length;
  const variance = data.reduce((sum, d) => sum + Math.pow(d.value - mean, 2), 0) / data.length;
  return variance;
};

// Helper function to calculate distance between two points (Haversine formula)
const calculateDistance = (p1, p2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (p2.latitude - p1.latitude) * Math.PI / 180;
  const dLon = (p2.longitude - p1.longitude) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(p1.latitude * Math.PI / 180) * Math.cos(p2.latitude * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Helper function to find neighbors within epsilon distance
const findNeighbors = (point, allPoints, eps) => {
  return allPoints
    .map((p, i) => ({ point: p, index: i }))
    .filter(({ point: p }) => 
      calculateDistance(point, p) <= eps
    )
    .map(({ index }) => index);
};

// Helper function to calculate cluster center
const calculateCenter = (cluster) => {
  if (cluster.length === 0) return { latitude: 0, longitude: 0 };
  
  const sumLat = cluster.reduce((sum, p) => sum + p.latitude, 0);
  const sumLng = cluster.reduce((sum, p) => sum + p.longitude, 0);
  
  return {
    latitude: sumLat / cluster.length,
    longitude: sumLng / cluster.length
  };
};

// Helper function to calculate cluster severity
const calculateSeverity = (cluster) => {
  if (cluster.length === 0) return 0;
  
  const abuseCount = cluster.filter(p => 
    p.condition === 'abuse' || p.condition === 'fighting'
  ).length;
  
  return abuseCount / cluster.length;
};

// Helper function to calculate risk level
const calculateRiskLevel = (cluster) => {
  const size = cluster.length;
  const severity = calculateSeverity(cluster);
  const recency = calculateRecency(cluster);
  
  // Weighted risk calculation
  return (size * 0.3) + (severity * 0.5) + (recency * 0.2);
};

// Helper function to calculate recency score
const calculateRecency = (cluster) => {
  if (cluster.length === 0) return 0;
  
  const now = Date.now();
  const avgAge = cluster.reduce((sum, p) => {
    const createdAt = new Date(p.createdAt || now).getTime();
    return sum + ((now - createdAt) / (1000 * 60 * 60 * 24)); // days
  }, 0) / cluster.length;
  
  // Higher score for more recent reports (inverse of age)
  return Math.max(0, 1 - (avgAge / 30)); // Decay over 30 days
};

// Helper function to expand cluster (DBSCAN algorithm)
const expandCluster = (point, neighbors, allPoints, eps, minPoints, visited = new Set()) => {
  const cluster = [point];
  const queue = [...neighbors];
  
  while (queue.length > 0) {
    const neighborIndex = queue.shift();
    if (visited.has(neighborIndex)) continue;
    
    visited.add(neighborIndex);
    cluster.push(allPoints[neighborIndex]);
    
    const newNeighbors = findNeighbors(allPoints[neighborIndex], allPoints, eps);
    if (newNeighbors.length >= minPoints) {
      queue.push(...newNeighbors);
    }
  }
  
  return cluster;
};

/**
 * Forecasts animal reports for the next 6 months using linear regression
 * @param {Array} historicalData - Array of monthly data with {month, value} structure
 * @returns {Array} Forecast data with predicted values and confidence
 */
export const forecastAnimalReports = (historicalData) => {
  try {
    if (!Array.isArray(historicalData) || historicalData.length < 2) {
      console.warn('Insufficient historical data for forecasting');
      return [];
    }

    // Prepare data for linear regression
    const months = historicalData.map((_, index) => index);
    const values = historicalData.map(d => d.value || 0);
    
    const n = months.length;
    const sumX = months.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = months.reduce((sum, x, i) => sum + x * values[i], 0);
    const sumXX = months.reduce((sum, x) => sum + x * x, 0);
    
    // Calculate slope and intercept for linear regression
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate confidence based on data variance
    const variance = calculateVariance(historicalData);
    const baseConfidence = Math.max(0.3, 1 - (variance / 100));
    
    // Generate forecast for next 6 months
    const forecast = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 0; i < 6; i++) {
      const futureMonth = months.length + i;
      const predictedValue = Math.max(0, Math.round(slope * futureMonth + intercept));
      
      // Confidence decreases for further future predictions
      const confidence = Math.max(0.1, baseConfidence * (1 - (i * 0.1)));
      
      const currentDate = new Date();
      const targetMonth = (currentDate.getMonth() + i + 1) % 12;
      
      forecast.push({
        month: monthNames[targetMonth],
        predicted: predictedValue,
        confidence: Math.round(confidence * 100),
        trend: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable'
      });
    }
    
    console.log('Forecast generated:', forecast);
    return forecast;
    
  } catch (error) {
    console.error('Error in forecastAnimalReports:', error);
    return [];
  }
};

/**
 * Detects hotspots using DBSCAN clustering algorithm
 * @param {Array} markers - Array of report markers with latitude, longitude, condition, createdAt
 * @param {Object} options - Clustering parameters
 * @returns {Array} Array of detected hotspots with center, size, severity, and risk
 */
export const detectHotspots = (markers, options = {}) => {
  try {
    if (!Array.isArray(markers) || markers.length === 0) {
      console.warn('No markers provided for hotspot detection');
      return [];
    }

    const {
      minPoints = 2, // Reduced from 3 to 2 for easier detection
      eps = 0.01, // Increased from 0.005 to 0.01 (~1km radius)
      maxDistance = 5 // km
    } = options;

    const clusters = [];
    const visited = new Set();
    
    // Filter markers to only include those with valid coordinates
    const validMarkers = markers.filter(marker => 
      marker.latitude && marker.longitude && 
      !isNaN(marker.latitude) && !isNaN(marker.longitude)
    );

    console.log(`Processing ${validMarkers.length} valid markers for hotspot detection`);

    validMarkers.forEach((marker, index) => {
      if (visited.has(index)) return;
      
      const neighbors = findNeighbors(marker, validMarkers, eps);
      
      if (neighbors.length >= minPoints) {
        const cluster = expandCluster(marker, neighbors, validMarkers, eps, minPoints, visited);
        
        if (cluster.length >= minPoints) {
          const center = calculateCenter(cluster);
          const severity = calculateSeverity(cluster);
          const risk = calculateRiskLevel(cluster);
          
          // Only include clusters with reasonable risk level
          if (risk > 0.1) {
            clusters.push({
              id: `hotspot_${clusters.length + 1}`,
              center: center,
              size: cluster.length,
              severity: Math.round(severity * 100) / 100,
              risk: Math.round(risk * 100) / 100,
              markers: cluster,
              priority: calculatePriority(severity, cluster.length, risk)
            });
          }
          
          // Mark all cluster points as visited
          cluster.forEach((_, clusterIndex) => {
            const originalIndex = validMarkers.findIndex(m => m === cluster[clusterIndex]);
            if (originalIndex !== -1) visited.add(originalIndex);
          });
        }
      }
    });

    // Sort by priority (highest first)
    const sortedClusters = clusters.sort((a, b) => b.priority - a.priority);
    
    console.log(`Detected ${sortedClusters.length} hotspots`);
    return sortedClusters;
    
  } catch (error) {
    console.error('Error in detectHotspots:', error);
    return [];
  }
};

/**
 * Calculates priority score for a hotspot
 * @param {number} severity - Severity score (0-1)
 * @param {number} size - Number of reports in cluster
 * @param {number} risk - Risk score (0-1)
 * @returns {number} Priority score
 */
const calculatePriority = (severity, size, risk) => {
  const severityWeight = 0.4;
  const sizeWeight = 0.3;
  const riskWeight = 0.3;
  
  return (severity * severityWeight) + 
         (Math.min(size / 20, 1) * sizeWeight) + // Normalize size to 0-1
         (risk * riskWeight);
};

/**
 * Analyzes trends in the data
 * @param {Array} data - Historical data
 * @returns {Object} Trend analysis results
 */
export const analyzeTrends = (data) => {
  try {
    if (!Array.isArray(data) || data.length < 3) {
      return { trend: 'insufficient_data', confidence: 0 };
    }

    const values = data.map(d => d.value || 0);
    const n = values.length;
    
    // Calculate trend using simple linear regression
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const rSquared = calculateRSquared(x, values, slope, sumY / n);
    
    let trend = 'stable';
    if (slope > 0.1) trend = 'increasing';
    else if (slope < -0.1) trend = 'decreasing';
    
    return {
      trend,
      slope: Math.round(slope * 100) / 100,
      confidence: Math.round(rSquared * 100),
      direction: slope > 0 ? 'up' : slope < 0 ? 'down' : 'flat'
    };
    
  } catch (error) {
    console.error('Error in analyzeTrends:', error);
    return { trend: 'error', confidence: 0 };
  }
};

/**
 * Calculates R-squared for trend analysis
 */
const calculateRSquared = (x, y, slope, meanY) => {
  const n = x.length;
  const ssRes = x.reduce((sum, xi, i) => {
    const predicted = slope * xi + (meanY - slope * (x.reduce((a, b) => a + b, 0) / n));
    return sum + Math.pow(y[i] - predicted, 2);
  }, 0);
  
  const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0);
  
  return ssTot === 0 ? 0 : 1 - (ssRes / ssTot);
};

export default {
  forecastAnimalReports,
  detectHotspots,
  analyzeTrends
};
