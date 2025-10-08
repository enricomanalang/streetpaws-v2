# StreetPaws - Defense Guide

## Project Overview
StreetPaws is a comprehensive Geographic Information System (GIS) for Stray Animal Welfare in Lipa City. The system enables citizens to report animal abuse, manage lost/found pets, and facilitate adoptions through a modern web application.

## Key Features Implemented

### 1. **User Authentication & Role Management**
- Firebase Authentication with email/password
- Role-based access control (User, Volunteer, Admin)
- Secure user registration and login
- Profile management

### 2. **Animal Abuse Reporting System**
- Comprehensive report submission form
- Photo evidence upload (up to 5 images)
- Location picker with GPS coordinates
- Urgency level classification
- Real-time status tracking
- Admin approval/rejection workflow

### 3. **Lost & Found Pets Management**
- Lost pet reporting with detailed descriptions
- Found pet reporting system
- Photo uploads and location tracking
- Sighting notifications to pet owners
- Search and filter functionality

### 4. **Adoption System**
- Browse available animals for adoption
- Detailed adoption application form
- Admin approval workflow
- Animal information management
- Adoption request tracking

### 5. **Admin Dashboard**
- Comprehensive analytics and charts
- Report management (approve/reject)
- Lost/Found pets moderation
- Adoption request management
- Contact message handling
- Real-time statistics

### 6. **Heatmap & Analytics**
- Interactive map with Leaflet
- Visual representation of abuse reports
- Geographic data analysis
- Monthly trend charts
- Animal type distribution
- Status-based filtering

### 7. **Real-time Features**
- Live notifications for pet sightings
- Real-time data updates
- Status change notifications
- Interactive dashboard updates

## Technical Implementation

### **Frontend Technologies**
- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **React Leaflet** for maps
- **Recharts** for analytics

### **Backend & Database**
- **Firebase Realtime Database** for data storage
- **Firebase Authentication** for user management
- **Supabase Storage** for image uploads
- **Firebase Hosting** for deployment

### **Key Components**
- Responsive design for mobile/desktop
- Image upload with preview
- Interactive maps with markers
- Real-time notifications
- Role-based navigation
- Comprehensive form validation

## Demo Data Setup

### **Sample Data Included**
- 2 pending abuse reports
- 1 approved report (available for adoption)
- 1 lost pet report
- 1 found pet report
- 1 adoption request
- 2 contact messages
- 7 sample users (6 regular + 1 admin)

### **Demo Accounts**
- **Admin**: admin@streetpaws.com / password123
- **Regular User**: maria.santos@email.com / password123
- **Volunteer**: juan.delacruz@email.com / password123

## How to Run the Demo

### **1. Setup Environment**
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Firebase configuration to .env.local
```

### **2. Add Sample Data**
```bash
# Run the sample data script
node scripts/add-sample-data.js
```

### **3. Start Development Server**
```bash
npm run dev
```

### **4. Access the Application**
- Open http://localhost:3000
- Register a new account or use demo accounts
- Explore different user roles and features

## Defense Presentation Flow

### **1. Introduction (2 minutes)**
- Project overview and objectives
- Problem statement (stray animal welfare in Lipa City)
- Solution approach (GIS-based system)

### **2. System Architecture (3 minutes)**
- Technical stack overview
- Database structure
- User roles and permissions
- Real-time features

### **3. Feature Demonstration (10 minutes)**

#### **A. User Features**
- Registration and authentication
- Animal abuse reporting with photos
- Lost/found pet management
- Adoption browsing and applications

#### **B. Admin Features**
- Dashboard analytics
- Report management workflow
- Heatmap visualization
- User management

#### **C. Real-time Features**
- Live notifications
- Status updates
- Interactive maps

### **4. Technical Highlights (3 minutes)**
- Firebase integration
- Image upload system
- Map integration with Leaflet
- Responsive design
- Security measures

### **5. Results & Impact (2 minutes)**
- System capabilities
- User experience improvements
- Administrative efficiency
- Future enhancements

## Key Points to Emphasize

### **Technical Excellence**
- Modern React/Next.js architecture
- TypeScript for type safety
- Responsive design
- Real-time capabilities
- Secure authentication

### **User Experience**
- Intuitive interface
- Mobile-friendly design
- Comprehensive forms
- Visual feedback
- Easy navigation

### **Administrative Features**
- Comprehensive dashboard
- Data visualization
- Workflow management
- Analytics and reporting

### **Social Impact**
- Community engagement
- Animal welfare improvement
- Data-driven decisions
- Scalable solution

## Potential Questions & Answers

### **Q: How does the system handle image uploads?**
A: Uses Supabase Storage with secure upload URLs, supports up to 5 images per report, with automatic compression and validation.

### **Q: How is data security ensured?**
A: Firebase Authentication with role-based access, secure database rules, input validation, and HTTPS encryption.

### **Q: Can the system scale for larger cities?**
A: Yes, Firebase provides automatic scaling, and the modular architecture allows for easy feature additions.

### **Q: How does the heatmap work?**
A: Uses Leaflet maps with GPS coordinates from reports, color-coded by urgency, with real-time updates from Firebase.

### **Q: What about offline functionality?**
A: Currently online-only for real-time features, but can be enhanced with PWA capabilities for offline report drafting.

## Future Enhancements
- Mobile app development
- SMS notifications
- Integration with local veterinary services
- Advanced analytics and AI insights
- Multi-language support
- API for third-party integrations

## Conclusion
StreetPaws represents a comprehensive solution for animal welfare management, combining modern web technologies with user-centered design to create an effective platform for community engagement and administrative efficiency.
