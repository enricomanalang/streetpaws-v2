const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, push } = require('firebase/database');

// Firebase configuration - replace with your actual config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Sample data for demonstration
const sampleData = {
  // Sample abuse reports
  reports: {
    'RPT-001': {
      animalType: 'dog',
      breed: 'Aspin',
      color: 'Brown',
      size: 'medium',
      condition: 'neglect',
      location: 'Barangay 1, Lipa City',
      latitude: 14.0583,
      longitude: 121.1656,
      description: 'Found a malnourished dog tied to a tree with no food or water for several days. The dog appears weak and dehydrated.',
      urgency: 'high',
      contactInfo: '+63 912 345 6789',
      images: ['placeholder-image-1'],
      submittedBy: {
        uid: 'user1',
        name: 'Maria Santos',
        email: 'maria.santos@email.com',
        role: 'user'
      },
      status: 'pending',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      reportId: 'RPT-001'
    },
    'RPT-002': {
      animalType: 'cat',
      breed: 'Persian',
      color: 'White',
      size: 'small',
      condition: 'physical-abuse',
      location: 'Barangay 2, Lipa City',
      latitude: 14.0683,
      longitude: 121.1756,
      description: 'Witnessed a cat being kicked by its owner. The cat is limping and appears injured.',
      urgency: 'urgent',
      contactInfo: '+63 912 345 6788',
      images: ['placeholder-image-2'],
      submittedBy: {
        uid: 'user2',
        name: 'Juan Dela Cruz',
        email: 'juan.delacruz@email.com',
        role: 'user'
      },
      status: 'investigating',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
      reportId: 'RPT-002'
    }
  },

  // Sample approved reports
  approvedReports: {
    'RPT-003': {
      animalType: 'dog',
      breed: 'Mixed',
      color: 'Black',
      size: 'large',
      condition: 'abandoned',
      location: 'Barangay 3, Lipa City',
      latitude: 14.0783,
      longitude: 121.1856,
      description: 'Found an abandoned dog in poor condition. The dog is friendly but appears to have been left without care.',
      urgency: 'medium',
      contactInfo: '+63 912 345 6787',
      images: ['placeholder-image-3'],
      submittedBy: {
        uid: 'user3',
        name: 'Ana Rodriguez',
        email: 'ana.rodriguez@email.com',
        role: 'user'
      },
      status: 'approved',
      availableForAdoption: true,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      reportId: 'RPT-003',
      reviewedBy: {
        uid: 'admin1',
        name: 'Admin User',
        email: 'admin@streetpaws.com'
      }
    }
  },

  // Sample lost pets
  lostPets: {
    'LOST-001': {
      petName: 'Buddy',
      animalType: 'dog',
      breed: 'Golden Retriever',
      color: 'Golden',
      size: 'large',
      age: '3 years old',
      gender: 'male',
      description: 'Friendly golden retriever with a red collar. Last seen near the park.',
      lastSeenLocation: 'Lipa City Park',
      latitude: 14.0583,
      longitude: 121.1656,
      lastSeenDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      contactInfo: '+63 912 345 6786',
      images: ['placeholder-image-4'],
      status: 'approved',
      submittedBy: {
        uid: 'user4',
        name: 'Carlos Mendoza',
        email: 'carlos.mendoza@email.com',
        role: 'user'
      },
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      reportId: 'LOST-001'
    }
  },

  // Sample found pets
  foundPets: {
    'FOUND-001': {
      animalType: 'cat',
      breed: 'Siamese',
      color: 'Cream',
      size: 'small',
      age: '1 year old',
      gender: 'female',
      description: 'Found a friendly Siamese cat near the market. She appears well-cared for and is looking for her owner.',
      foundLocation: 'Lipa City Market',
      latitude: 14.0483,
      longitude: 121.1556,
      foundDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      contactInfo: '+63 912 345 6785',
      images: ['placeholder-image-5'],
      status: 'found',
      submittedBy: {
        uid: 'user5',
        name: 'Lisa Garcia',
        email: 'lisa.garcia@email.com',
        role: 'user'
      },
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      reportId: 'FOUND-001'
    }
  },

  // Sample adoption requests
  adoptionRequests: {
    'ADOPT-001': {
      fullName: 'Roberto Silva',
      email: 'roberto.silva@email.com',
      phone: '+63 912 345 6784',
      age: '28',
      address: '123 Main Street, Barangay 4, Lipa City',
      occupation: 'Teacher',
      experience: 'experienced',
      livingSituation: 'house-with-yard',
      otherPets: 'None',
      reasonForAdoption: 'I have always wanted to provide a loving home for a rescued animal. I have experience with dogs and can provide proper care.',
      howDidYouHear: 'website',
      additionalInfo: 'I work from home and can provide constant care for the animal.',
      animalId: 'RPT-003',
      animalInfo: {
        animalType: 'dog',
        breed: 'Mixed',
        color: 'Black',
        size: 'large',
        age: 'Unknown',
        gender: 'Unknown',
        description: 'Found an abandoned dog in poor condition. The dog is friendly but appears to have been left without care.',
        images: ['placeholder-image-3'],
        location: 'Barangay 3, Lipa City'
      },
      applicant: {
        uid: 'user6',
        name: 'Roberto Silva',
        email: 'roberto.silva@email.com',
        role: 'user'
      },
      status: 'pending',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      requestId: 'ADOPT-001'
    }
  },

  // Sample contact messages
  contactMessages: {
    'CONTACT-001': {
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@email.com',
      category: 'Volunteer Inquiry',
      subject: 'Interested in Volunteering',
      message: 'I am a veterinarian and would like to volunteer my services to help with animal welfare in Lipa City. Please let me know how I can contribute.',
      status: 'new',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    'CONTACT-002': {
      name: 'Michael Torres',
      email: 'michael.torres@email.com',
      category: 'General Inquiry',
      subject: 'Question about Adoption Process',
      message: 'I am interested in adopting a pet through your system. Can you provide more information about the adoption process and requirements?',
      status: 'read',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  },

  // Sample users
  users: {
    'user1': {
      uid: 'user1',
      email: 'maria.santos@email.com',
      role: 'user',
      name: 'Maria Santos'
    },
    'user2': {
      uid: 'user2',
      email: 'juan.delacruz@email.com',
      role: 'user',
      name: 'Juan Dela Cruz'
    },
    'user3': {
      uid: 'user3',
      email: 'ana.rodriguez@email.com',
      role: 'user',
      name: 'Ana Rodriguez'
    },
    'user4': {
      uid: 'user4',
      email: 'carlos.mendoza@email.com',
      role: 'user',
      name: 'Carlos Mendoza'
    },
    'user5': {
      uid: 'user5',
      email: 'lisa.garcia@email.com',
      role: 'user',
      name: 'Lisa Garcia'
    },
    'user6': {
      uid: 'user6',
      email: 'roberto.silva@email.com',
      role: 'user',
      name: 'Roberto Silva'
    },
    'admin1': {
      uid: 'admin1',
      email: 'admin@streetpaws.com',
      role: 'admin',
      name: 'Admin User'
    }
  }
};

async function addSampleData() {
  try {
    console.log('Adding sample data to Firebase...');
    
    // Add each collection
    for (const [collectionName, data] of Object.entries(sampleData)) {
      console.log(`Adding ${collectionName}...`);
      const collectionRef = ref(database, collectionName);
      await set(collectionRef, data);
      console.log(`✓ Added ${collectionName}`);
    }
    
    console.log('✅ Sample data added successfully!');
    console.log('\nSample data includes:');
    console.log('- 2 pending abuse reports');
    console.log('- 1 approved report (available for adoption)');
    console.log('- 1 lost pet report');
    console.log('- 1 found pet report');
    console.log('- 1 adoption request');
    console.log('- 2 contact messages');
    console.log('- 7 sample users (6 regular users + 1 admin)');
    console.log('\nYou can now test the application with this sample data!');
    
  } catch (error) {
    console.error('Error adding sample data:', error);
  }
}

// Run the script
addSampleData();
