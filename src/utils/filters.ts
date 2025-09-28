// write json array to qualified-degrees-v2.json in public
// write json array to almost-qualified-v2.json in public

// get all degrees from api/getall

import { get_ufs_aps, get_up_aps, get_wits_aps } from "./aps-calculator";

// Helper function to write JSON data to public directory
const write_to_file = async (filename: string, data: any) => {
  try {
    const response = await fetch('/api/write-file', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: filename,
        data: data
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to write ${filename}: ${response.statusText}`);
    }
    
    console.log(`Successfully wrote ${filename} to public directory`);
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
  }
}

const get_aps_by_university = (university: string): number => {
  switch (university) {
    case 'University of the Free State':
      return get_ufs_aps();
    case 'University of Pretoria':
      return get_up_aps();
    case 'University of the Witwatersrand':
      return get_wits_aps();
    default:
      throw new Error('Unknown university');
  }
}

const all_degrees = async () => {
  try {
    const response = await fetch('/api/getall');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching all degrees:', error);
  }
}

const get_qualified_degrees = async () => {
  try {
    const get_all = await all_degrees();
    const user_marks = JSON.parse(localStorage.getItem('resultsData') || '[]');
    
    if (!get_all || !Array.isArray(get_all)) {
      throw new Error('Failed to fetch degrees data');
    }
    
    const qualified_degrees = get_all.filter((degree: any) => {
      return check_degree_qualification(degree, user_marks);
    });
    
    // Write to JSON file in public directory
    await write_to_file('qualified-degrees-v2.json', qualified_degrees);
    
    return qualified_degrees;
    
  } catch (error) {
    console.error('Error getting qualified degrees:', error);
    return [];
  }
}

const check_degree_qualification = (degree: any, user_marks: any[]): boolean => {
  // Check APS requirement
  const user_aps = get_aps_by_university(degree.university);
  if (user_aps < degree.aps) {
    return false;
  }
  
  // Check subject requirements
  for (const [subject, required_mark] of Object.entries(degree)) {
    // Skip non-subject fields
    if (['id', 'title', 'description', 'faculty', 'duration', 'university', 'aps', 'careers', 'additional requirements'].includes(subject)) {
      continue;
    }
    
    // Ensure required_mark is a number
    if (typeof required_mark !== 'number') {
      continue;
    }
    
    // Find user's mark for this subject
    const user_subject_result = user_marks.find((result: any) => 
      result.subject.toLowerCase() === subject.toLowerCase()
    );
    
    // If user doesn't have this subject or mark is below requirement, they don't qualify
    if (!user_subject_result || user_subject_result.mark < required_mark) {
      return false;
    }
  }
  
  return true;
}

const get_almost_qualified_degrees = async () => {
  try {
    const get_all = await all_degrees();
    const user_marks = JSON.parse(localStorage.getItem('resultsData') || '[]');
    
    if (!get_all || !Array.isArray(get_all)) {
      throw new Error('Failed to fetch degrees data');
    }
    
    const almost_qualified_degrees = get_all.filter((degree: any) => {
      return check_almost_qualified(degree, user_marks);
    });
    
    // Write to JSON file in public directory
    await write_to_file('almost-qualified-v2.json', almost_qualified_degrees);
    
    return almost_qualified_degrees;
    
  } catch (error) {
    console.error('Error getting almost qualified degrees:', error);
    return [];
  }
}

const check_almost_qualified = (degree: any, user_marks: any[]): boolean => {
  // Don't include degrees they already qualify for
  if (check_degree_qualification(degree, user_marks)) {
    return false;
  }
  
  const user_aps = get_aps_by_university(degree.university);
  
  // Check APS requirement - must be within 2 points
  const aps_gap = degree.aps - user_aps;
  if (aps_gap > 2) {
    return false; // APS gap is too large
  }
  
  // Check subject requirement gaps - all must be within 5 points
  for (const [subject, required_mark] of Object.entries(degree)) {
    // Skip non-subject fields
    if (['id', 'title', 'description', 'faculty', 'duration', 'university', 'aps', 'careers', 'additional requirements'].includes(subject)) {
      continue;
    }
    
    // Ensure required_mark is a number
    if (typeof required_mark !== 'number') {
      continue;
    }
    
    const user_subject_result = user_marks.find((result: any) => 
      result.subject.toLowerCase() === subject.toLowerCase()
    );
    
    if (!user_subject_result) {
      // User doesn't have this subject at all - this disqualifies them from "almost qualified"
      return false;
    }
    
    const subject_gap = required_mark - user_subject_result.mark;
    if (subject_gap > 5) {
      return false; // Subject gap is too large
    }
  }
  
  // If we get here, the degree meets the "almost qualified" criteria:
  // - APS gap ≤ 2
  // - All subject gaps ≤ 5
  // - User has all required subjects
  return true;
}

export { get_qualified_degrees, get_almost_qualified_degrees };