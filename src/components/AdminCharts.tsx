'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ref, onValue, off, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

const COLORS = ['#60A5FA', '#3B82F6'];

// Helper function to get month abbreviation
const getMonthAbbr = (monthIndex: number) => {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return months[monthIndex];
};

// Helper function to process data by month
const processDataByMonth = (data: any[], dateField: string = 'createdAt', targetYear?: number) => {
  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    month: getMonthAbbr(i),
    value: 0
  }));

  console.log(`Processing ${data.length} items with dateField: ${dateField}, targetYear: ${targetYear}`);
  
  data.forEach((item, index) => {
    const dateValue = item[dateField];
    if (dateValue) {
      try {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear();
          const monthIndex = date.getMonth();
          
          // Filter by year if targetYear is specified
          if (targetYear && year !== targetYear) {
            console.log(`Item ${index}: Skipping ${dateValue} - year ${year} doesn't match target ${targetYear}`);
            return;
          }
          
          if (monthIndex >= 0 && monthIndex < 12) {
            monthlyData[monthIndex].value += 1;
            console.log(`Item ${index}: ${dateValue} -> Year ${year}, Month ${monthIndex} (${getMonthAbbr(monthIndex)})`);
          } else {
            console.log(`Item ${index}: Invalid month index ${monthIndex} for date ${dateValue}`);
          }
        } else {
          console.log(`Item ${index}: Invalid date ${dateValue}`);
        }
      } catch (error) {
        console.log(`Item ${index}: Error parsing date ${dateValue}:`, error);
      }
    } else {
      console.log(`Item ${index}: No ${dateField} field found`);
    }
  });

  console.log('Final monthly data:', monthlyData);
  return monthlyData;
};


export const MonthlyTrendChart = ({ selectedYear }: { selectedYear: number }) => {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!database || authLoading || !user) {
      setLoading(false);
      return;
    }

    // Fetch data from all collections for comprehensive trend analysis
    const fetchAllData = async () => {
      try {
        console.log('Fetching dashboard trend data...');
        
        // Get data from all collections
        if (!database) {
          console.error('Database not initialized');
          return;
        }

        const [reportsSnap, approvedSnap, rejectedSnap, lostSnap, foundSnap, adoptSnap] = await Promise.all([
          get(ref(database, 'reports')),
          get(ref(database, 'approvedReports')),
          get(ref(database, 'rejectedReports')),
          get(ref(database, 'lostPets')),
          get(ref(database, 'foundPets')),
          get(ref(database, 'adoptionRequests'))
        ]);

        // Combine all data
        const allData: any[] = [];
        
        // Process each collection
        const collections = [
          { snap: reportsSnap, name: 'reports' },
          { snap: approvedSnap, name: 'approvedReports' },
          { snap: rejectedSnap, name: 'rejectedReports' },
          { snap: lostSnap, name: 'lostPets' },
          { snap: foundSnap, name: 'foundPets' },
          { snap: adoptSnap, name: 'adoptionRequests' }
        ];

        collections.forEach(({ snap, name }) => {
          if (snap.exists()) {
            const data = snap.val();
            const items = Object.keys(data).map(key => ({
              id: key,
              ...data[key],
              collection: name
            }));
            allData.push(...items);
            console.log(`Found ${items.length} items in ${name}`);
          }
        });

        console.log(`Total items for trend analysis: ${allData.length}`);
        const processedData = processDataByMonth(allData, 'createdAt', selectedYear);
        setData(processedData);
        
      } catch (error) {
        console.error('Error fetching trend data:', error);
        setData(Array.from({ length: 12 }, (_, i) => ({
          month: getMonthAbbr(i),
          value: 0
        })));
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [selectedYear, user, authLoading]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Activity Trend ({selectedYear})</h3>
        <div className="flex items-center justify-center h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Activity Trend ({selectedYear})</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#F97316" 
            strokeWidth={3}
            dot={{ fill: '#F97316', strokeWidth: 2, r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const AdoptionChart = ({ selectedYear }: { selectedYear: number }) => {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!database || authLoading || !user) {
      setLoading(false);
      return;
    }

    // Fetch adoption requests data
    const adoptionRequestsRef = ref(database, 'adoptionRequests');
    const unsubscribe = onValue(adoptionRequestsRef, (snapshot) => {
      console.log('Fetching adoption requests for chart...');
      if (snapshot.exists()) {
        const adoptionRequestsData = snapshot.val();
        const adoptionRequestsList = Object.keys(adoptionRequestsData).map(key => ({
          id: key,
          ...adoptionRequestsData[key]
        }));
        console.log(`Found ${adoptionRequestsList.length} adoption requests`);
        const processedData = processDataByMonth(adoptionRequestsList, 'createdAt', selectedYear).map(item => ({
          month: item.month,
          adoptions: item.value
        }));
        setData(processedData);
      } else {
        console.log('No adoption requests found');
        setData(Array.from({ length: 12 }, (_, i) => ({
          month: getMonthAbbr(i),
          adoptions: 0
        })));
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching adoption data:', error);
      setLoading(false);
    });

    return () => {
      off(adoptionRequestsRef, 'value', unsubscribe);
    };
  }, [selectedYear, user, authLoading]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">ADOPTIONS ({selectedYear})</h3>
        <div className="flex items-center justify-center h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">ADOPTIONS ({selectedYear})</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="adoptions" 
            stroke="#8B5CF6" 
            strokeWidth={3}
            dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
            activeDot={{ r: 8, stroke: '#8B5CF6', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const AbuseReportsChart = ({ selectedYear }: { selectedYear: number }) => {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!database || authLoading || !user) {
      setLoading(false);
      return;
    }

    // Fetch all reports data for stacked chart
    const fetchAllReports = async () => {
      try {
        console.log('Fetching reports data for stacked chart...');
        
        if (!database) {
          console.error('Database not initialized');
          return;
        }
        
        const [pendingSnap, approvedSnap, rejectedSnap] = await Promise.all([
          get(ref(database, 'reports')),
          get(ref(database, 'approvedReports')),
          get(ref(database, 'rejectedReports'))
        ]);

        // Process each status
        const processReports = (snap: any, status: string) => {
          if (snap.exists()) {
            const reportsData = snap.val();
            const reportsList = Object.keys(reportsData).map(key => ({
              id: key,
              ...reportsData[key],
              status
            }));
            console.log(`${status} reports found:`, reportsList.length);
            console.log(`${status} sample data:`, reportsList[0]);
            
            // Try different date fields
            const processedData = processDataByMonth(reportsList, 'createdAt') || 
                                 processDataByMonth(reportsList, 'updatedAt') ||
                                 processDataByMonth(reportsList, 'submittedAt');
            
            console.log(`${status} processed data:`, processedData);
            return processedData;
          }
          console.log(`No ${status} reports found`);
          return Array.from({ length: 12 }, (_, i) => ({
            month: getMonthAbbr(i),
            value: 0
          }));
        };

        const pendingData = processReports(pendingSnap, 'pending');
        const approvedData = processReports(approvedSnap, 'approved');
        const rejectedData = processReports(rejectedSnap, 'rejected');

        // Combine data for stacked chart
        const combinedData = Array.from({ length: 12 }, (_, i) => ({
          month: getMonthAbbr(i),
          pending: pendingData[i]?.value || 0,
          approved: approvedData[i]?.value || 0,
          rejected: rejectedData[i]?.value || 0
        }));

        console.log('Reports data processed:', combinedData);
        setData(combinedData);
        
      } catch (error) {
        console.error('Error fetching reports data:', error);
        setData(Array.from({ length: 12 }, (_, i) => ({
          month: getMonthAbbr(i),
          pending: 0,
          approved: 0,
          rejected: 0
        })));
      } finally {
        setLoading(false);
      }
    };

    fetchAllReports();
  }, [user, authLoading]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">REPORTS STATUS ({selectedYear})</h3>
        <div className="flex items-center justify-center h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">REPORTS STATUS ({selectedYear})</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="pending" stackId="a" fill="#F59E0B" name="Pending" />
          <Bar dataKey="approved" stackId="a" fill="#10B981" name="Approved" />
          <Bar dataKey="rejected" stackId="a" fill="#EF4444" name="Rejected" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const LostChart = ({ selectedYear }: { selectedYear: number }) => {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!database || authLoading || !user) {
      setLoading(false);
      return;
    }

    // Fetch lost pets data
    const lostPetsRef = ref(database, 'lostPets');
    const unsubscribe = onValue(lostPetsRef, (snapshot) => {
      console.log('Fetching lost pets for chart...');
      if (snapshot.exists()) {
        const lostPetsData = snapshot.val();
        const lostPetsList = Object.keys(lostPetsData).map(key => ({
          id: key,
          ...lostPetsData[key]
        }));
        console.log(`Found ${lostPetsList.length} lost pets`);
        const processedData = processDataByMonth(lostPetsList).map(item => ({
          month: item.month,
          lost: item.value
        }));
        setData(processedData);
      } else {
        console.log('No lost pets found');
        setData(Array.from({ length: 12 }, (_, i) => ({
          month: getMonthAbbr(i),
          lost: 0
        })));
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching lost pets data:', error);
      setLoading(false);
    });

    return () => {
      off(lostPetsRef, 'value', unsubscribe);
    };
  }, [user, authLoading]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">LOST PETS ({selectedYear})</h3>
        <div className="flex items-center justify-center h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">LOST PETS ({selectedYear})</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Area 
            type="monotone" 
            dataKey="lost" 
            stroke="#F59E0B" 
            fill="#F59E0B" 
            fillOpacity={0.6}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const FoundChart = ({ selectedYear }: { selectedYear: number }) => {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!database || authLoading || !user) {
      setLoading(false);
      return;
    }

    // Fetch found pets data
    const foundPetsRef = ref(database, 'foundPets');
    const unsubscribe = onValue(foundPetsRef, (snapshot) => {
      console.log('Fetching found pets for chart...');
      if (snapshot.exists()) {
        const foundPetsData = snapshot.val();
        const foundPetsList = Object.keys(foundPetsData).map(key => ({
          id: key,
          ...foundPetsData[key]
        }));
        console.log(`Found ${foundPetsList.length} found pets`);
        const processedData = processDataByMonth(foundPetsList).map(item => ({
          month: item.month,
          found: item.value
        }));
        setData(processedData);
      } else {
        console.log('No found pets found');
        setData(Array.from({ length: 12 }, (_, i) => ({
          month: getMonthAbbr(i),
          found: 0
        })));
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching found pets data:', error);
      setLoading(false);
    });

    return () => {
      off(foundPetsRef, 'value', unsubscribe);
    };
  }, [user, authLoading]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">FOUND PETS ({selectedYear})</h3>
        <div className="flex items-center justify-center h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">FOUND PETS ({selectedYear})</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Area 
            type="monotone" 
            dataKey="found" 
            stroke="#10B981" 
            fill="#10B981" 
            fillOpacity={0.6}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const AnimalTypeChart = ({ selectedYear }: { selectedYear: number }) => {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!database || authLoading || !user) {
      setLoading(false);
      return;
    }

    // Fetch all pets data to analyze by type
    const petsRef = ref(database, 'pets');
    const unsubscribe = onValue(petsRef, (snapshot) => {
      if (snapshot.exists()) {
        const petsData = snapshot.val();
        const petsList = Object.keys(petsData).map(key => ({
          id: key,
          ...petsData[key]
        }));

        // Process data by quarters
        const quarterlyData = [
          { period: 'Q1', CAT: 0, DOG: 0 },
          { period: 'Q2', CAT: 0, DOG: 0 },
          { period: 'Q3', CAT: 0, DOG: 0 },
          { period: 'Q4', CAT: 0, DOG: 0 }
        ];

        petsList.forEach(pet => {
          if (pet.createdAt) {
            const date = new Date(pet.createdAt);
            const month = date.getMonth();
            const quarter = Math.floor(month / 3);
            
            if (pet.animalType) {
              const animalType = pet.animalType.toUpperCase();
              if (animalType === 'CAT' || animalType === 'DOG') {
                (quarterlyData[quarter] as any)[animalType] += 1;
              }
            }
          }
        });

        setData(quarterlyData);
      } else {
        setData([
          { period: 'Q1', CAT: 0, DOG: 0 },
          { period: 'Q2', CAT: 0, DOG: 0 },
          { period: 'Q3', CAT: 0, DOG: 0 },
          { period: 'Q4', CAT: 0, DOG: 0 }
        ]);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching animal type data:', error);
      setLoading(false);
    });

    return () => {
      off(petsRef, 'value', unsubscribe);
    };
  }, [user, authLoading]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">ANIMAL TYPES ({selectedYear})</h3>
        <div className="flex items-center justify-center h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">ANIMAL TYPES ({selectedYear})</h3>
      <div className="flex items-center justify-center mb-4">
        <div className="flex space-x-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-300 rounded mr-2"></div>
            <span className="text-sm text-gray-600">CAT</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
            <span className="text-sm text-gray-600">DOG</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="CAT" stackId="a" fill="#60A5FA" />
          <Bar dataKey="DOG" stackId="a" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const PieChartComponent = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">ANIMAL DISTRIBUTION</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Main dashboard charts component
export const AdminDashboardCharts = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  // Get available years from data
  useEffect(() => {
    const getAvailableYears = async () => {
      if (!database) return;
      
      try {
        const years = new Set<number>();
        const currentYear = new Date().getFullYear();
        
        // Add years from 2020 to 2030
        for (let year = 2030; year >= 2020; year--) {
          years.add(year);
        }
        
        setAvailableYears(Array.from(years).sort((a, b) => b - a));
      } catch (error) {
        console.error('Error getting available years:', error);
        setAvailableYears([new Date().getFullYear()]);
      }
    };

    getAvailableYears();
  }, []);

  return (
    <div className="space-y-6">
      {/* Year Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Dashboard Filters</h3>
          <div className="flex items-center space-x-4">
            <label htmlFor="year-filter" className="text-sm font-medium text-gray-700">
              Year:
            </label>
            <select
              id="year-filter"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Showing data for {selectedYear}. Charts will update automatically when you change the year.
        </p>
      </div>

      {/* Top row - Line chart and Bar charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <MonthlyTrendChart selectedYear={selectedYear} />
        </div>
        <div className="lg:col-span-1">
          <AdoptionChart selectedYear={selectedYear} />
        </div>
        <div className="lg:col-span-1">
          <AbuseReportsChart selectedYear={selectedYear} />
        </div>
      </div>

      {/* Middle row - Lost and Found charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LostChart selectedYear={selectedYear} />
        <FoundChart selectedYear={selectedYear} />
      </div>

      {/* Bottom row - Animal Types */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <AnimalTypeChart selectedYear={selectedYear} />
      </div>
    </div>
  );
};
