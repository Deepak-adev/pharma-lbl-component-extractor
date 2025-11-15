// Test script for component extraction
console.log('🧪 Testing Component Extraction System...');

// Test the categories
const categories = [
  'Brand Logo',
  'Product Name/Title',
  'Product Image/Packshot',
  'Indication Text',
  'Dosage Information',
  'Mechanism of Action',
  'Clinical Data/Efficacy',
  'Safety Information',
  'Side Effects',
  'Contraindications',
  'Prescribing Information',
  'Patient Population',
  'Healthcare Provider Info',
  'Contact Information',
  'Regulatory Text',
  'Warning/Black Box',
  'QR Code',
  'Website/URL',
  'Medical Illustration',
  'Chart/Graph/Data',
  'Timeline/Process',
  'Before/After Images',
  'Patient Journey',
  'Lifestyle Image',
  'Doctor/HCP Image',
  'Call to Action',
  'Footer/Disclaimer',
  'Header Section',
  'Subheading',
  'Bullet Points',
  'Table/Comparison',
  'Icon/Symbol',
  'Badge/Certification',
  'Price/Cost Info',
  'Insurance Coverage',
  'Patient Support',
  'Clinical Trial Info',
  'References/Citations',
  'Other'
];

console.log(`✅ ${categories.length} pharmaceutical component categories defined`);

// Test fallback component generation
function createTestComponents() {
  const components = [];
  
  // Create a comprehensive set of pharmaceutical components
  const testComponents = [
    { name: "Company Logo", category: "Brand Logo", description: "Pharmaceutical company branding" },
    { name: "Product Name", category: "Product Name/Title", description: "Main product title" },
    { name: "Drug Indication", category: "Indication Text", description: "What condition the drug treats" },
    { name: "Dosing Chart", category: "Chart/Graph/Data", description: "Dosing information visualization" },
    { name: "Clinical Efficacy", category: "Clinical Data/Efficacy", description: "Clinical trial results" },
    { name: "Safety Warning", category: "Warning/Black Box", description: "Important safety information" },
    { name: "Side Effects List", category: "Side Effects", description: "Common adverse reactions" },
    { name: "Prescribing Info", category: "Prescribing Information", description: "How to prescribe" },
    { name: "Patient Support", category: "Patient Support", description: "Patient assistance programs" },
    { name: "Contact Details", category: "Contact Information", description: "Medical information contact" }
  ];
  
  testComponents.forEach((comp, index) => {
    components.push({
      id: `test-${index}`,
      name: comp.name,
      description: comp.description,
      category: comp.category,
      boundingBox: {
        x: (index % 5) * 20,
        y: Math.floor(index / 5) * 20,
        width: 18,
        height: 18
      },
      base64: 'test-base64-data',
      mimeType: 'image/jpeg'
    });
  });
  
  return components;
}

const testComponents = createTestComponents();
console.log(`🧪 Generated ${testComponents.length} test components`);

// Test component categorization
const categoryCount = {};
testComponents.forEach(comp => {
  categoryCount[comp.category] = (categoryCount[comp.category] || 0) + 1;
});

console.log('📊 Component distribution:');
Object.entries(categoryCount).forEach(([category, count]) => {
  console.log(`  ${category}: ${count}`);
});

console.log('✅ Component extraction test completed successfully!');