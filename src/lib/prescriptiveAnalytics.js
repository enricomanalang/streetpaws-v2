/**
 * Prescriptive Analytics Module for StreetPaws
 * Implements resource allocation and recommendation algorithms
 */

/**
 * Optimizes resource allocation based on hotspot analysis
 * @param {Array} hotspots - Array of detected hotspots
 * @param {Object} availableResources - Available resources (volunteers, budget, equipment)
 * @returns {Array} Optimized resource allocation recommendations
 */
export const optimizeResourceAllocation = (hotspots, availableResources = {}) => {
  try {
    if (!Array.isArray(hotspots) || hotspots.length === 0) {
      console.warn('No hotspots provided for resource allocation');
      return [];
    }

    const {
      volunteers = 10,
      budget = 50000,
      vehicles = 2,
      equipment = 5
    } = availableResources;

    const recommendations = [];
    let remainingVolunteers = volunteers;
    let remainingBudget = budget;
    let remainingVehicles = vehicles;
    let remainingEquipment = equipment;

    // Sort hotspots by priority
    const sortedHotspots = [...hotspots].sort((a, b) => b.priority - a.priority);

    sortedHotspots.forEach((hotspot, index) => {
      const requiredResources = calculateRequiredResources(hotspot);
      const canAllocate = canAllocateResources(requiredResources, {
        volunteers: remainingVolunteers,
        budget: remainingBudget,
        vehicles: remainingVehicles,
        equipment: remainingEquipment
      });

      if (canAllocate) {
        const recommendation = {
          id: `rec_${index + 1}`,
          hotspotId: hotspot.id,
          zone: hotspot.center,
          priority: hotspot.priority,
          priorityLevel: getPriorityLevel(hotspot.priority),
          recommendedActions: generateActionPlan(hotspot),
          resourceAllocation: allocateResources(requiredResources, {
            volunteers: remainingVolunteers,
            budget: remainingBudget,
            vehicles: remainingVehicles,
            equipment: remainingEquipment
          }),
          expectedImpact: calculateExpectedImpact(hotspot, requiredResources),
          timeline: calculateTimeline(hotspot),
          costBenefit: calculateCostBenefit(hotspot, requiredResources),
          successProbability: calculateSuccessProbability(hotspot, requiredResources)
        };

        recommendations.push(recommendation);

        // Update remaining resources
        remainingVolunteers -= recommendation.resourceAllocation.volunteers;
        remainingBudget -= recommendation.resourceAllocation.budget;
        remainingVehicles -= recommendation.resourceAllocation.vehicles;
        remainingEquipment -= recommendation.resourceAllocation.equipment;
      } else {
        // Add recommendation with limited resources
        recommendations.push({
          id: `rec_${index + 1}`,
          hotspotId: hotspot.id,
          zone: hotspot.center,
          priority: hotspot.priority,
          priorityLevel: getPriorityLevel(hotspot.priority),
          recommendedActions: generateBasicActionPlan(hotspot),
          resourceAllocation: {
            volunteers: Math.min(1, remainingVolunteers),
            budget: Math.min(1000, remainingBudget),
            vehicles: 0,
            equipment: Math.min(1, remainingEquipment)
          },
          expectedImpact: 'Limited',
          timeline: 'Extended',
          costBenefit: 'Low',
          successProbability: 0.3,
          note: 'Limited resources available'
        });
      }
    });

    console.log(`Generated ${recommendations.length} resource allocation recommendations`);
    return recommendations;

  } catch (error) {
    console.error('Error in optimizeResourceAllocation:', error);
    return [];
  }
};

/**
 * Calculates required resources for a hotspot
 * @param {Object} hotspot - Hotspot data
 * @returns {Object} Required resources
 */
const calculateRequiredResources = (hotspot) => {
  const baseVolunteers = Math.min(8, Math.max(2, Math.ceil(hotspot.size / 3)));
  const baseBudget = Math.min(10000, Math.max(1000, hotspot.size * 500));
  const baseVehicles = Math.min(2, Math.ceil(hotspot.size / 10));
  const baseEquipment = Math.min(3, Math.ceil(hotspot.size / 5));

  // Adjust based on severity and risk
  const severityMultiplier = 1 + (hotspot.severity * 0.5);
  const riskMultiplier = 1 + (hotspot.risk * 0.3);

  return {
    volunteers: Math.ceil(baseVolunteers * severityMultiplier),
    budget: Math.ceil(baseBudget * severityMultiplier * riskMultiplier),
    vehicles: Math.ceil(baseVehicles * severityMultiplier),
    equipment: Math.ceil(baseEquipment * severityMultiplier)
  };
};

/**
 * Checks if resources can be allocated
 * @param {Object} required - Required resources
 * @param {Object} available - Available resources
 * @returns {boolean} Can allocate
 */
const canAllocateResources = (required, available) => {
  return required.volunteers <= available.volunteers &&
         required.budget <= available.budget &&
         required.vehicles <= available.vehicles &&
         required.equipment <= available.equipment;
};

/**
 * Allocates resources based on priority and availability
 * @param {Object} required - Required resources
 * @param {Object} available - Available resources
 * @returns {Object} Allocated resources
 */
const allocateResources = (required, available) => {
  return {
    volunteers: Math.min(required.volunteers, available.volunteers),
    budget: Math.min(required.budget, available.budget),
    vehicles: Math.min(required.vehicles, available.vehicles),
    equipment: Math.min(required.equipment, available.equipment)
  };
};

/**
 * Generates action plan for a hotspot
 * @param {Object} hotspot - Hotspot data
 * @returns {Array} Action plan
 */
const generateActionPlan = (hotspot) => {
  const actions = [];

  // Immediate actions based on severity
  if (hotspot.severity > 0.8) {
    actions.push({
      action: "Emergency Response",
      priority: "Critical",
      description: "Deploy emergency rescue team immediately",
      timeframe: "0-2 hours",
      resources: "2 volunteers, 1 vehicle, emergency equipment"
    });
  }

  if (hotspot.severity > 0.6) {
    actions.push({
      action: "Intensive Patrol",
      priority: "High",
      description: "Increase patrol frequency to 3x daily",
      timeframe: "1-3 days",
      resources: "3 volunteers, 1 vehicle"
    });
  }

  // Size-based actions
  if (hotspot.size > 15) {
    actions.push({
      action: "Mass Sterilization Campaign",
      priority: "High",
      description: "Organize community sterilization drive",
      timeframe: "1-2 weeks",
      resources: "5 volunteers, 2 vehicles, medical equipment"
    });
  }

  if (hotspot.size > 10) {
    actions.push({
      action: "Temporary Shelter Setup",
      priority: "Medium",
      description: "Set up temporary holding facility",
      timeframe: "3-5 days",
      resources: "3 volunteers, shelter materials"
    });
  }

  // Standard actions
  actions.push({
    action: "Community Awareness",
    priority: "Medium",
    description: "Conduct community education campaign",
    timeframe: "1 week",
    resources: "2 volunteers, educational materials"
  });

  actions.push({
    action: "Regular Monitoring",
    priority: "Low",
    description: "Establish regular monitoring schedule",
    timeframe: "Ongoing",
    resources: "1 volunteer, basic equipment"
  });

  return actions;
};

/**
 * Generates basic action plan when resources are limited
 * @param {Object} hotspot - Hotspot data
 * @returns {Array} Basic action plan
 */
const generateBasicActionPlan = (hotspot) => {
  return [
    {
      action: "Basic Monitoring",
      priority: "Medium",
      description: "Regular check-ins with available resources",
      timeframe: "Ongoing",
      resources: "1 volunteer"
    },
    {
      action: "Community Outreach",
      priority: "Low",
      description: "Inform community about the situation",
      timeframe: "1-2 weeks",
      resources: "Educational materials"
    }
  ];
};

/**
 * Calculates expected impact of intervention
 * @param {Object} hotspot - Hotspot data
 * @param {Object} resources - Allocated resources
 * @returns {string} Expected impact level
 */
const calculateExpectedImpact = (hotspot, resources) => {
  const resourceScore = (resources.volunteers * 0.3) + 
                       (resources.budget / 1000 * 0.2) + 
                       (resources.vehicles * 0.3) + 
                       (resources.equipment * 0.2);
  
  const hotspotScore = (hotspot.severity * 0.4) + (hotspot.risk * 0.6);
  
  const impactScore = resourceScore * hotspotScore;
  
  if (impactScore > 0.7) return 'High';
  if (impactScore > 0.4) return 'Medium';
  return 'Low';
};

/**
 * Calculates timeline for intervention
 * @param {Object} hotspot - Hotspot data
 * @returns {string} Timeline estimate
 */
const calculateTimeline = (hotspot) => {
  if (hotspot.severity > 0.8) return '1-3 days';
  if (hotspot.severity > 0.6) return '1-2 weeks';
  if (hotspot.size > 15) return '2-4 weeks';
  return '1-2 weeks';
};

/**
 * Calculates cost-benefit ratio
 * @param {Object} hotspot - Hotspot data
 * @param {Object} resources - Required resources
 * @returns {string} Cost-benefit level
 */
const calculateCostBenefit = (hotspot, resources) => {
  const cost = resources.budget;
  const benefit = hotspot.size * 1000; // Estimated value per animal helped
  
  const ratio = benefit / cost;
  
  if (ratio > 3) return 'High';
  if (ratio > 1.5) return 'Medium';
  return 'Low';
};

/**
 * Calculates success probability
 * @param {Object} hotspot - Hotspot data
 * @param {Object} resources - Required resources
 * @returns {number} Success probability (0-1)
 */
const calculateSuccessProbability = (hotspot, resources) => {
  const resourceAdequacy = Math.min(1, 
    (resources.volunteers / 5) * 0.4 +
    (resources.budget / 5000) * 0.3 +
    (resources.vehicles / 2) * 0.2 +
    (resources.equipment / 3) * 0.1
  );
  
  const hotspotDifficulty = 1 - ((hotspot.severity + hotspot.risk) / 2);
  
  return Math.max(0.1, Math.min(0.95, resourceAdequacy * hotspotDifficulty));
};

/**
 * Gets priority level based on priority score
 * @param {number} priority - Priority score
 * @returns {string} Priority level
 */
const getPriorityLevel = (priority) => {
  if (priority > 0.8) return 'Critical';
  if (priority > 0.6) return 'High';
  if (priority > 0.4) return 'Medium';
  return 'Low';
};

/**
 * Generates strategic recommendations for overall operations
 * @param {Array} hotspots - All detected hotspots
 * @param {Object} resources - Available resources
 * @returns {Object} Strategic recommendations
 */
export const generateStrategicRecommendations = (hotspots, resources) => {
  try {
    if (!Array.isArray(hotspots) || hotspots.length === 0) {
      return { recommendations: [], summary: 'No hotspots to analyze' };
    }

    const totalHotspots = hotspots.length;
    const criticalHotspots = hotspots.filter(h => h.priority > 0.8).length;
    const highPriorityHotspots = hotspots.filter(h => h.priority > 0.6).length;
    
    const totalReports = hotspots.reduce((sum, h) => sum + h.size, 0);
    const avgSeverity = hotspots.reduce((sum, h) => sum + h.severity, 0) / totalHotspots;
    
    const recommendations = [];
    
    // Resource allocation strategy
    if (criticalHotspots > 0) {
      recommendations.push({
        type: 'Resource Allocation',
        priority: 'Critical',
        recommendation: `Focus 70% of resources on ${criticalHotspots} critical hotspots`,
        rationale: 'Critical hotspots require immediate attention to prevent escalation',
        timeframe: 'Immediate'
      });
    }
    
    // Staffing recommendations
    const requiredStaff = Math.ceil(totalReports / 5);
    if (requiredStaff > resources.volunteers) {
      recommendations.push({
        type: 'Staffing',
        priority: 'High',
        recommendation: `Recruit ${requiredStaff - resources.volunteers} additional volunteers`,
        rationale: `Current staff can handle ${resources.volunteers * 5} reports, but ${totalReports} reports detected`,
        timeframe: '2-4 weeks'
      });
    }
    
    // Budget recommendations
    const estimatedBudget = totalReports * 500;
    if (estimatedBudget > resources.budget) {
      recommendations.push({
        type: 'Budget',
        priority: 'High',
        recommendation: `Seek additional funding of ₱${estimatedBudget - resources.budget}`,
        rationale: 'Current budget insufficient for optimal response',
        timeframe: '1-2 months'
      });
    }
    
    // Operational recommendations
    if (avgSeverity > 0.7) {
      recommendations.push({
        type: 'Operations',
        priority: 'High',
        recommendation: 'Implement emergency response protocol',
        rationale: 'High average severity indicates need for rapid response procedures',
        timeframe: '1 week'
      });
    }
    
    if (totalHotspots > 10) {
      recommendations.push({
        type: 'Operations',
        priority: 'Medium',
        recommendation: 'Establish zone-based management system',
        rationale: 'Large number of hotspots requires organized management approach',
        timeframe: '2-3 weeks'
      });
    }
    
    return {
      recommendations,
      summary: {
        totalHotspots,
        criticalHotspots,
        highPriorityHotspots,
        totalReports,
        avgSeverity: Math.round(avgSeverity * 100) / 100,
        resourceUtilization: Math.round((totalReports / (resources.volunteers * 5)) * 100)
      }
    };
    
  } catch (error) {
    console.error('Error in generateStrategicRecommendations:', error);
    return { recommendations: [], summary: 'Error generating recommendations' };
  }
};

export default {
  optimizeResourceAllocation,
  generateStrategicRecommendations
};

