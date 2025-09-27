'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
import { ref, onValue, off } from 'firebase/database';
import { database } from '@/lib/firebase';

const COLORS = ['#60A5FA', '#3B82F6'];

// Helper function to get month abbreviation
const getMonthAbbr = (monthIndex: number) => {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return months[monthIndex];
};

// Helper function to process data by month
const processDataByMonth = (data: any[], dateField: string = 'createdAt') => {
  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    month: getMonthAbbr(i),
    value: 0
  }));

  data.forEach(item => {
    if (item[dateField]) {
      const date = new Date(item[dateField]);
      const monthIndex = date.getMonth();
      if (monthIndex >= 0 && monthIndex < 12) {
        monthlyData[monthIndex].value += 1;
      }
    }
  });

  return monthlyData;
};


export const MonthlyTrendChart = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!database) {
      setLoading(false);
      return;
    }

    // Fetch all reports data for trend analysis
    const reportsRef = ref(database, 'reports');
    const unsubscribe = onValue(reportsRef, (snapshot) => {
      if (snapshot.exists()) {
        const reportsData = snapshot.val();
        const reportsList = Object.keys(reportsData).map(key => ({
          id: key,
          ...reportsData[key]
        }));
        const processedData = processDataByMonth(reportsList);
        setData(processedData);
      } else {
        setData(Array.from({ length: 12 }, (_, i) => ({
          month: getMonthAbbr(i),
          value: 0
        })));
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching trend data:', error);
      setLoading(false);
    });

    return () => {
      off(reportsRef, 'value', unsubscribe);
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Activity Trend (2024)</h3>
        <div className="flex items-center justify-center h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Activity Trend (2024)</h3>
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

export const AdoptionChart = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!database) {
      setLoading(false);
      return;
    }

    // Fetch adoption data - you may need to adjust this path based on your database structure
    const adoptionsRef = ref(database, 'adoptions');
    const unsubscribe = onValue(adoptionsRef, (snapshot) => {
      if (snapshot.exists()) {
        const adoptionsData = snapshot.val();
        const adoptionsList = Object.keys(adoptionsData).map(key => ({
          id: key,
          ...adoptionsData[key]
        }));
        const processedData = processDataByMonth(adoptionsList).map(item => ({
          month: item.month,
          adoptions: item.value
        }));
        setData(processedData);
      } else {
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
      off(adoptionsRef, 'value', unsubscribe);
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">ADOPTIONS (2024)</h3>
        <div className="flex items-center justify-center h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">ADOPTIONS (2024)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="month" type="category" width={60} />
          <Tooltip />
          <Bar dataKey="adoptions" fill="#60A5FA" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const AbuseReportsChart = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!database) {
      setLoading(false);
      return;
    }

    // Fetch abuse reports data
    const reportsRef = ref(database, 'reports');
    const unsubscribe = onValue(reportsRef, (snapshot) => {
      if (snapshot.exists()) {
        const reportsData = snapshot.val();
        const reportsList = Object.keys(reportsData).map(key => ({
          id: key,
          ...reportsData[key]
        }));
        const processedData = processDataByMonth(reportsList).map(item => ({
          month: item.month,
          reports: item.value
        }));
        setData(processedData);
      } else {
        setData(Array.from({ length: 12 }, (_, i) => ({
          month: getMonthAbbr(i),
          reports: 0
        })));
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching abuse reports data:', error);
      setLoading(false);
    });

    return () => {
      off(reportsRef, 'value', unsubscribe);
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">ABUSE REPORTS (2024)</h3>
        <div className="flex items-center justify-center h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">ABUSE REPORTS (2024)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="month" type="category" width={60} />
          <Tooltip />
          <Bar dataKey="reports" fill="#EF4444" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const LostChart = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!database) {
      setLoading(false);
      return;
    }

    // Fetch lost pets data
    const lostPetsRef = ref(database, 'lostPets');
    const unsubscribe = onValue(lostPetsRef, (snapshot) => {
      if (snapshot.exists()) {
        const lostPetsData = snapshot.val();
        const lostPetsList = Object.keys(lostPetsData).map(key => ({
          id: key,
          ...lostPetsData[key]
        }));
        const processedData = processDataByMonth(lostPetsList).map(item => ({
          month: item.month,
          lost: item.value
        }));
        setData(processedData);
      } else {
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
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">LOST PETS (2024)</h3>
        <div className="flex items-center justify-center h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">LOST PETS (2024)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="month" type="category" width={60} />
          <Tooltip />
          <Bar dataKey="lost" fill="#F59E0B" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const FoundChart = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!database) {
      setLoading(false);
      return;
    }

    // Fetch found pets data
    const foundPetsRef = ref(database, 'foundPets');
    const unsubscribe = onValue(foundPetsRef, (snapshot) => {
      if (snapshot.exists()) {
        const foundPetsData = snapshot.val();
        const foundPetsList = Object.keys(foundPetsData).map(key => ({
          id: key,
          ...foundPetsData[key]
        }));
        const processedData = processDataByMonth(foundPetsList).map(item => ({
          month: item.month,
          found: item.value
        }));
        setData(processedData);
      } else {
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
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">FOUND PETS (2024)</h3>
        <div className="flex items-center justify-center h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">FOUND PETS (2024)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="month" type="category" width={60} />
          <Tooltip />
          <Bar dataKey="found" fill="#10B981" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const AnimalTypeChart = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!database) {
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
                quarterlyData[quarter][animalType as keyof typeof quarterlyData[0]] += 1;
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
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">ANIMAL TYPES (2024)</h3>
        <div className="flex items-center justify-center h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">ANIMAL TYPES (2024)</h3>
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
            data={animalTypeData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {animalTypeData.map((entry, index) => (
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
  return (
    <div className="space-y-6">
      {/* Top row - Line chart and Bar charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <MonthlyTrendChart />
        </div>
        <div className="lg:col-span-1">
          <AdoptionChart />
        </div>
        <div className="lg:col-span-1">
          <AbuseReportsChart />
        </div>
      </div>

      {/* Middle row - Lost and Found charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LostChart />
        <FoundChart />
      </div>

      {/* Bottom row - Animal Types */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <AnimalTypeChart />
      </div>
    </div>
  );
};
