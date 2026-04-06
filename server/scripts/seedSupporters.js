const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config({ path: __dirname + '/../.env' });

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

// Same topic sets used in the frontend
const TOPICS_BY_USER_TYPE = {
  'College Student': ['Academic Stress', 'Exam Anxiety', 'Placement Preparation', 'Coding/Programming', 'Project Guidance', 'Time Management', 'Hostel Life', 'Peer Pressure', 'Career Confusion', 'Internship Search', 'CGPA Improvement', 'Study Techniques', 'College Relationships', 'Financial Stress', 'Future Planning'],
  'High School Student': ['Board Exam Stress', 'Career Selection', 'Subject Difficulty', 'Parental Pressure', 'Study Motivation', 'Time Management', 'Peer Comparison', 'College Admissions', 'Entrance Exams', 'Self-esteem', 'Bullying', 'Future Anxiety', 'Learning Techniques', 'School Relationships', 'Extracurricular Balance'],
  'Working Professional': ['Work Stress', 'Burnout', 'Career Growth', 'Work-Life Balance', 'Job Satisfaction', 'Office Politics', 'Salary Negotiation', 'Job Switch', 'Workplace Relationships', 'Imposter Syndrome', 'Skill Development', 'Remote Work Challenges', 'Work Anxiety', 'Professional Boundaries', 'Leadership Pressure'],
  'Graduate Student': ['Research Stress', 'Thesis Anxiety', 'Publication Pressure', 'PhD Challenges', 'Lab Work', 'Supervisor Issues', 'Funding Worries', 'Academic Burnout', 'Future in Academia', 'Work-Study Balance', 'Research Isolation', 'Conference Prep', 'Networking Stress', 'Post-grad Plans', 'Imposter Syndrome'],
  'Other': ['Anxiety', 'Depression', 'Stress', 'Relationships', 'Family Issues', 'Self-esteem', 'Grief', 'Loneliness', 'Life Transitions', 'Personal Growth', 'Mindfulness', 'Motivation', 'Identity', 'Purpose', 'General Support']
};

const predefinedSupporters = [
  // College Student supporters
  {
    name: "Alex Johnson",
    email: "alex.college@example.com",
    role: "supporter",
    isApproved: true,
    bio: "Current senior who survived the exact same academic pressure and placement stress.",
    specialty: "College Life & Placements",
    topics: TOPICS_BY_USER_TYPE['College Student'].slice(0, 4),
    experience: "3 years peer tutoring"
  },
  {
    name: "Samantha Lee",
    email: "sam.college@example.com",
    role: "supporter",
    isApproved: true,
    bio: "Passionate about helping students manage project guidance and time management.",
    specialty: "Time Management Expert",
    topics: TOPICS_BY_USER_TYPE['College Student'].slice(4, 8),
    experience: "2 years mentoring"
  },
  
  // High School Student supporters
  {
    name: "Mr. Davis",
    email: "davis.highschool@example.com",
    role: "supporter",
    isApproved: true,
    bio: "Dedicated to helping teens navigate board exams, career selections, and parental expectations.",
    specialty: "Teen Counselor",
    topics: TOPICS_BY_USER_TYPE['High School Student'].slice(0, 4),
    experience: "5 years counseling"
  },
  {
    name: "Emma Wilson",
    email: "emma.highschool@example.com",
    role: "supporter",
    isApproved: true,
    bio: "I've been there. Focusing on peer comparison, self-esteem, and building a balanced school life.",
    specialty: "Student Well-being",
    topics: TOPICS_BY_USER_TYPE['High School Student'].slice(4, 8),
    experience: "4 years student support"
  },

  // Working Professional supporters
  {
    name: "Rachel Green",
    email: "rachel.work@example.com",
    role: "supporter",
    isApproved: true,
    bio: "Corporate veteran who transitioned through burnout and discovered effective work-life balance.",
    specialty: "Career Coach",
    topics: TOPICS_BY_USER_TYPE['Working Professional'].slice(0, 4),
    experience: "10 years industry"
  },
  {
    name: "David Kim",
    email: "david.work@example.com",
    role: "supporter",
    isApproved: true,
    bio: "Specializing in office politics, salary negotiations, and overcoming imposter syndrome.",
    specialty: "Leadership Mentor",
    topics: TOPICS_BY_USER_TYPE['Working Professional'].slice(4, 9),
    experience: "8 years management"
  },

  // Graduate Student supporters
  {
    name: "Dr. Alok Verma",
    email: "alok.grad@example.com",
    role: "supporter",
    isApproved: true,
    bio: "PhD graduate. I know all about supervisor issues, thesis anxiety, and the academic trenches.",
    specialty: "Academic Advisor",
    topics: TOPICS_BY_USER_TYPE['Graduate Student'].slice(0, 5),
    experience: "5 years post-doc"
  },
  {
    name: "Maria Garcia",
    email: "maria.grad@example.com",
    role: "supporter",
    isApproved: true,
    bio: "Helping grad students maintain their sanity, handle funding worries, and navigate conferences.",
    specialty: "Graduate Wellness",
    topics: TOPICS_BY_USER_TYPE['Graduate Student'].slice(5, 10),
    experience: "3 years mentoring"
  },

  // General / Other supporters
  {
    name: "Dr. Michael Chen",
    email: "michael.general@example.com",
    role: "supporter",
    isApproved: true,
    bio: "Licensed professional specializing in deeper challenges, anxiety, depression and long-term wellness.",
    specialty: "Mental Health Specialist",
    topics: TOPICS_BY_USER_TYPE['Other'].slice(0, 4),
    experience: "8 years clinical"
  },
  {
    name: "Jessica Taylor",
    email: "jessica.general@example.com",
    role: "supporter",
    isApproved: true,
    bio: "Focused on personal growth, overcoming loneliness, and discovering finding identity and purpose.",
    specialty: "Life Coach",
    topics: TOPICS_BY_USER_TYPE['Other'].slice(6, 11),
    experience: "6 years coaching"
  }
];

const seedDB = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env");
    }

    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const commonPassword = "Password123";

    for (let supData of predefinedSupporters) {
      supData.password = commonPassword;
      supData.rating = { average: (Math.random() * (5 - 4.5) + 4.5).toFixed(1), count: Math.floor(Math.random() * 200) + 10 };
      supData.topics = supData.topics.filter(Boolean); // Clean any undefined

      const existingSupporter = await User.findOne({ email: supData.email });
      
      if (existingSupporter) {
        console.log(`Supporter already exists: ${supData.email}, skipping...`);
      } else {
        const supporter = new User(supData);
        // We handle password hashing inside userSchema.pre('save')
        await supporter.save();
        console.log(`Inserted supporter: ${supData.name} - ${supData.email}`);
      }
    }

    console.log("🎉 Seeding completed successfully!");
    console.log("\n--- Supporter Login Details ---");
    console.log("Password for all newly created supporters: Password123\n");
    predefinedSupporters.forEach(sup => {
      console.log(`- ${sup.name} (${sup.specialty})`);
      console.log(`  Email: ${sup.email}`);
    });

  } catch (error) {
    console.error("❌ Seeding failed:");
    console.error(error);
  } finally {
    mongoose.connection.close();
  }
};

seedDB();
