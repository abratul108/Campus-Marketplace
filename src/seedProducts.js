
import { auth, db } from "./firebase";

import {
  collection,
  getDocs,
  doc,
  writeBatch,
  serverTimestamp
} from "firebase/firestore";

const demoProducts = [
  // BOOKS & NOTES
  {
    productName: "Introduction to Programming",
    description: "Beginner friendly programming book for university students.",
    price: 350,
    category: "Books & Notes",
    condition: "Used",
    location: "Boalkhali"
  },
  {
    productName: "Data Structures and Algorithms",
    description: "Useful book for learning data structures and algorithms.",
    price: 450,
    category: "Books & Notes",
    condition: "Good",
    location: "Chattogram"
  },
  {
    productName: "Engineering Mathematics",
    description: "Mathematics book for engineering students.",
    price: 500,
    category: "Books & Notes",
    condition: "Good",
    location: "Chattogram"
  },
  {
    productName: "Physics Notes",
    description: "Complete handwritten physics notes.",
    price: 150,
    category: "Books & Notes",
    condition: "Used",
    location: "Boalkhali"
  },
  {
    productName: "Database Management System",
    description: "DBMS reference book for computer science students.",
    price: 400,
    category: "Books & Notes",
    condition: "Good",
    location: "Chattogram"
  },
  {
    productName: "C Programming Book",
    description: "C programming guide with practical examples.",
    price: 300,
    category: "Books & Notes",
    condition: "Good",
    location: "Boalkhali"
  },
  {
    productName: "Calculus Notes",
    description: "Easy calculus notes for university exams.",
    price: 180,
    category: "Books & Notes",
    condition: "Used",
    location: "Chattogram"
  },
  {
    productName: "English Grammar Book",
    description: "English grammar and writing practice book.",
    price: 250,
    category: "Books & Notes",
    condition: "Good",
    location: "Boalkhali"
  },
  {
    productName: "Operating System Concepts",
    description: "Useful operating system book for CSE students.",
    price: 550,
    category: "Books & Notes",
    condition: "Good",
    location: "Chattogram"
  },
  {
    productName: "Computer Networks Book",
    description: "Networking concepts and practical examples.",
    price: 480,
    category: "Books & Notes",
    condition: "Good",
    location: "Boalkhali"
  },
  {
    productName: "Software Engineering",
    description: "Software development and engineering textbook.",
    price: 420,
    category: "Books & Notes",
    condition: "Used",
    location: "Chattogram"
  },
  {
    productName: "Digital Logic Design",
    description: "Digital electronics and logic design book.",
    price: 380,
    category: "Books & Notes",
    condition: "Good",
    location: "Boalkhali"
  },
  {
    productName: "Chemistry Reference Book",
    description: "Chemistry reference for university students.",
    price: 350,
    category: "Books & Notes",
    condition: "Good",
    location: "Chattogram"
  },
  {
    productName: "Microprocessor Notes",
    description: "Important microprocessor notes for exams.",
    price: 180,
    category: "Books & Notes",
    condition: "Used",
    location: "Boalkhali"
  },
  {
    productName: "Computer Graphics Book",
    description: "Computer graphics theory and algorithms.",
    price: 450,
    category: "Books & Notes",
    condition: "Good",
    location: "Chattogram"
  },
  {
    productName: "Statistics for Students",
    description: "Basic statistics book with solved problems.",
    price: 320,
    category: "Books & Notes",
    condition: "New",
    location: "Boalkhali"
  },

  // ELECTRONICS
  {
    productName: "Scientific Calculator",
    description: "Scientific calculator suitable for engineering students.",
    price: 650,
    category: "Electronics",
    condition: "Good",
    location: "Chattogram"
  },
  {
    productName: "Wireless Mouse",
    description: "Comfortable wireless mouse for laptop and desktop.",
    price: 450,
    category: "Electronics",
    condition: "New",
    location: "Boalkhali"
  },
  {
    productName: "USB Keyboard",
    description: "Standard USB keyboard for everyday use.",
    price: 550,
    category: "Electronics",
    condition: "Good",
    location: "Chattogram"
  },
  {
    productName: "Bluetooth Headphone",
    description: "Wireless headphone with comfortable ear cushions.",
    price: 1200,
    category: "Electronics",
    condition: "Good",
    location: "Chattogram"
  },
  {
    productName: "USB Flash Drive 32GB",
    description: "32GB USB flash drive for storing study materials.",
    price: 500,
    category: "Electronics",
    condition: "New",
    location: "Boalkhali"
  },
  {
    productName: "Laptop Cooling Pad",
    description: "Cooling pad for laptop users.",
    price: 850,
    category: "Electronics",
    condition: "Good",
    location: "Chattogram"
  },
  {
    productName: "LED Desk Lamp",
    description: "Rechargeable LED lamp for night study.",
    price: 700,
    category: "Electronics",
    condition: "New",
    location: "Boalkhali"
  },
  {
    productName: "Power Bank 10000mAh",
    description: "Portable power bank for mobile devices.",
    price: 1100,
    category: "Electronics",
    condition: "Good",
    location: "Chattogram"
  },
  {
    productName: "Mechanical Keyboard",
    description: "Comfortable mechanical keyboard for programming.",
    price: 1800,
    category: "Electronics",
    condition: "New",
    location: "Chattogram"
  },
  {
    productName: "Wireless Earbuds",
    description: "Compact wireless earbuds for daily use.",
    price: 950,
    category: "Electronics",
    condition: "Good",
    location: "Boalkhali"
  },
  {
    productName: "Laptop Stand",
    description: "Adjustable laptop stand for comfortable study.",
    price: 650,
    category: "Electronics",
    condition: "New",
    location: "Chattogram"
  },
  {
    productName: "Webcam HD",
    description: "HD webcam for online classes and meetings.",
    price: 1300,
    category: "Electronics",
    condition: "Good",
    location: "Chattogram"
  },
  {
    productName: "Portable Bluetooth Speaker",
    description: "Small portable speaker with clear sound.",
    price: 850,
    category: "Electronics",
    condition: "Good",
    location: "Boalkhali"
  },
  {
    productName: "Smart Watch",
    description: "Smart watch with fitness tracking features.",
    price: 1600,
    category: "Electronics",
    condition: "New",
    location: "Chattogram"
  },
  {
    productName: "HDMI Cable",
    description: "High quality HDMI cable for monitors.",
    price: 250,
    category: "Electronics",
    condition: "New",
    location: "Boalkhali"
  },
  {
    productName: "Rechargeable Fan",
    description: "Portable rechargeable fan for study desk.",
    price: 900,
    category: "Electronics",
    condition: "Good",
    location: "Chattogram"
  },

  // LAB EQUIPMENT
  {
    productName: "Digital Multimeter",
    description: "Digital multimeter for electrical measurements.",
    price: 950,
    category: "Lab Equipment",
    condition: "Good",
    location: "Chattogram"
  },
  {
    productName: "Breadboard",
    description: "Breadboard for electronics circuit experiments.",
    price: 180,
    category: "Lab Equipment",
    condition: "New",
    location: "Boalkhali"
  },
  {
    productName: "Arduino Uno",
    description: "Arduino Uno board for electronics projects.",
    price: 750,
    category: "Lab Equipment",
    condition: "Good",
    location: "Chattogram"
  },
  {
    productName: "Digital Vernier Caliper",
    description: "Digital measuring tool for laboratory experiments.",
    price: 1200,
    category: "Lab Equipment",
    condition: "Good",
    location: "Chattogram"
  },
  {
    productName: "Soldering Iron",
    description: "Soldering iron for electronics practical work.",
    price: 400,
    category: "Lab Equipment",
    condition: "Good",
    location: "Boalkhali"
  },
  {
    productName: "Physics Lab Kit",
    description: "Basic physics experiment equipment set.",
    price: 900,
    category: "Lab Equipment",
    condition: "New",
    location: "Chattogram"
  },
  {
    productName: "Resistor Pack",
    description: "Different values of resistors for circuit projects.",
    price: 120,
    category: "Lab Equipment",
    condition: "New",
    location: "Boalkhali"
  },
  {
    productName: "Digital Oscilloscope",
    description: "Oscilloscope for electronics laboratory practice.",
    price: 4500,
    category: "Lab Equipment",
    condition: "Good",
    location: "Chattogram"
  },
  {
    productName: "DC Power Supply",
    description: "Adjustable DC power supply for lab experiments.",
    price: 1800,
    category: "Lab Equipment",
    condition: "Good",
    location: "Boalkhali"
  },
  {
    productName: "Jumper Wire Set",
    description: "Male to male and female jumper wire set.",
    price: 150,
    category: "Lab Equipment",
    condition: "New",
    location: "Chattogram"
  },
  {
    productName: "Electronic Component Kit",
    description: "Basic electronic components for student projects.",
    price: 550,
    category: "Lab Equipment",
    condition: "New",
    location: "Boalkhali"
  },
  {
    productName: "Digital Thermometer",
    description: "Digital thermometer for laboratory measurements.",
    price: 350,
    category: "Lab Equipment",
    condition: "Good",
    location: "Chattogram"
  },
  {
    productName: "Screwdriver Set",
    description: "Small screwdriver set for electronics projects.",
    price: 280,
    category: "Lab Equipment",
    condition: "New",
    location: "Boalkhali"
  },
  {
    productName: "Arduino Sensor Kit",
    description: "Sensor collection for Arduino experiments.",
    price: 850,
    category: "Lab Equipment",
    condition: "New",
    location: "Chattogram"
  },

  // STUDY MATERIAL
  {
    productName: "Exam Preparation Notes",
    description: "Helpful notes for semester examination preparation.",
    price: 200,
    category: "Study Material",
    condition: "Good",
    location: "Chattogram"
  },
  {
    productName: "Programming Cheat Sheet",
    description: "Quick programming reference sheet for students.",
    price: 100,
    category: "Study Material",
    condition: "New",
    location: "Boalkhali"
  },
  {
    productName: "IELTS Vocabulary Notes",
    description: "Useful vocabulary collection for IELTS preparation.",
    price: 220,
    category: "Study Material",
    condition: "Good",
    location: "Chattogram"
  },
  {
    productName: "Mathematics Formula Sheet",
    description: "Important mathematics formulas for quick revision.",
    price: 80,
    category: "Study Material",
    condition: "New",
    location: "Boalkhali"
  },
  {
    productName: "Computer Science MCQ Book",
    description: "Practice MCQ questions for computer science students.",
    price: 280,
    category: "Study Material",
    condition: "Good",
    location: "Chattogram"
  },
  {
    productName: "University Admission Guide",
    description: "Admission preparation guide for university applicants.",
    price: 320,
    category: "Study Material",
    condition: "Good",
    location: "Chattogram"
  },
  {
    productName: "Handwritten Programming Notes",
    description: "Easy handwritten notes for programming practice.",
    price: 160,
    category: "Study Material",
    condition: "Used",
    location: "Boalkhali"
  },
  {
    productName: "Web Development Notes",
    description: "HTML CSS and JavaScript study notes.",
    price: 200,
    category: "Study Material",
    condition: "Good",
    location: "Chattogram"
  },
  {
    productName: "Python Programming Guide",
    description: "Beginner Python programming study guide.",
    price: 300,
    category: "Study Material",
    condition: "New",
    location: "Boalkhali"
  },
  {
    productName: "C++ Practice Sheet",
    description: "C++ programming problems with examples.",
    price: 120,
    category: "Study Material",
    condition: "New",
    location: "Chattogram"
  },
  {
    productName: "Machine Learning Notes",
    description: "Basic machine learning concepts and notes.",
    price: 250,
    category: "Study Material",
    condition: "Good",
    location: "Boalkhali"
  },
  {
    productName: "Networking Practical Guide",
    description: "Networking lab tasks and practical instructions.",
    price: 220,
    category: "Study Material",
    condition: "Good",
    location: "Chattogram"
  },
  {
    productName: "Final Exam Suggestion",
    description: "Important questions for semester final exams.",
    price: 100,
    category: "Study Material",
    condition: "New",
    location: "Boalkhali"
  },
  {
    productName: "Project Report Template",
    description: "Useful academic project report writing template.",
    price: 150,
    category: "Study Material",
    condition: "New",
    location: "Chattogram"
  }
];

export async function seedProducts() {
  const user = auth.currentUser;

  if (!user) {
    alert("Please login first!");
    return;
  }

  try {
    const snapshot = await getDocs(collection(db, "products"));

    const existingIds = new Set(
      snapshot.docs.map((item) => item.id)
    );

    const newProducts = demoProducts.filter(
      (_, index) => !existingIds.has(`demo_${index + 1}`)
    );

    if (newProducts.length === 0) {
      alert("Demo Dataset already added!");
      return;
    }

    const batch = writeBatch(db);

    newProducts.forEach((product) => {
      const index = demoProducts.indexOf(product);

      const productRef = doc(
        db,
        "products",
        `demo_${index + 1}`
      );

      batch.set(productRef, {
        ...product,
        image: "",
        sellerId: user.uid,
        sellerName:
          user.displayName ||
          user.email?.split("@")[0] ||
          "Demo Seller",
        createdAt: serverTimestamp()
      });
    });

    await batch.commit();

    alert(`${newProducts.length} Demo Products added successfully!`);

  } catch (error) {
    console.error("Dataset error:", error);
    alert("Dataset add করা যায়নি: " + error.message);
  }
}
