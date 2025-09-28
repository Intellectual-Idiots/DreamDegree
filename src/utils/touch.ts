// write json array to qualified-degrees-v2.json in public
// write json array to almost-qualified-v2.json in public

// get all degrees from api/getall

import { get_ufs_aps, get_up_aps, get_wits_aps } from "./aps-calculator";

const get_aps_by_university = (university: string): number => {
  const normalizedUniversity = university.toLowerCase().trim();

  // Handle University of the Free State variations
  if (normalizedUniversity.includes('free state')) {
    return get_ufs_aps();
  }

  // Handle University of Pretoria variations
  if (normalizedUniversity.includes('pretoria')) {
    return get_up_aps();
  }

  // Handle University of the Witwatersrand variations (including typos)
  if (normalizedUniversity.includes('witwatersrand') ||
    normalizedUniversity.includes('witwatersradn') || // Handle the typo
    normalizedUniversity.includes('wits')) {
    return get_wits_aps();
  }

  throw new Error(`Unknown university: ${university}`);
}

const all_degrees = async () => {
  try {
    const response = await fetch('/api/getall');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching all degrees:', error);
  }
}

const get_qualified_degrees = async () => {
  try {
    const get_all = await all_degrees();
    console.log('All degrees fetched:', get_all);
    const user_marks = JSON.parse(localStorage.getItem('resultsData') || '[]');

    console.log('First 3 degrees:', get_all.slice(0, 3));
    console.log('User marks:', user_marks);
    console.log('Unique universities:', [...new Set(get_all.map((d: { university: any; }) => d.university))]);

    if (!get_all || !Array.isArray(get_all)) {
      throw new Error('Failed to fetch degrees data');
    }

    const qualified_degrees = get_all.filter((degree: any) => {
      return check_degree_qualification(degree, user_marks);
    });

    // Write to JSON file in public directory
    // await write_to_file('qualified-degrees-v2.json', qualified_degrees);

    return qualified_degrees;

  } catch (error) {
    console.error('Error getting qualified degrees:', error);
    return [];
  }
}

const check_degree_qualification = (degree: any, user_marks: any[]): boolean => {
  console.log(`\n=== Checking qualification for: ${degree.title} at ${degree.university} ===`);

  try {
    const user_aps = get_aps_by_university(degree.university);
    console.log(`User APS: ${user_aps}, Required APS: ${degree.aps}, University: ${degree.university}`);

    if (user_aps < degree.aps) {
      console.log(`❌ Failed APS check: ${user_aps} < ${degree.aps}`);
      return false;
    }
    console.log(`✅ Passed APS check: ${user_aps} >= ${degree.aps}`);

  } catch (error) {
    console.error(`❌ University not recognized: "${degree.university}"`, error);
    return false;
  }

  // Helper function to find user's mark for a subject (case-insensitive)
  const getUserMark = (subjectName: string) => {
    const result = user_marks.find((result: any) =>
      result.subject.toLowerCase() === subjectName.toLowerCase()
    );
    return result ? result.mark : null;
  };

  // Helper function to check mutually exclusive subjects
  const checkMutuallyExclusiveSubjects = (option1: string, option2: string, requiredMark: number) => {
    const mark1 = getUserMark(option1);
    const mark2 = getUserMark(option2);

    // Check if user has either subject and meets the requirement
    if (mark1 !== null && mark1 >= requiredMark) {
      console.log(`✅ Passed requirement via ${option1}: Required ${requiredMark}, User has ${mark1}`);
      return true;
    }

    if (mark2 !== null && mark2 >= requiredMark) {
      console.log(`✅ Passed requirement via ${option2}: Required ${requiredMark}, User has ${mark2}`);
      return true;
    }

    console.log(`❌ Failed requirement: Need ${requiredMark} in either ${option1} or ${option2}. User has: ${option1}=${mark1}, ${option2}=${mark2}`);
    return false;
  };

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

    const subjectLower = subject.toLowerCase();
    console.log(`Checking subject requirement: ${subject}, required: ${required_mark}`);

    // Handle English language requirements (mutually exclusive)
    if (subjectLower === 'english home language' || subjectLower === 'english first additional language') {
      if (!checkMutuallyExclusiveSubjects('english home language', 'english first additional language', required_mark)) {
        return false;
      }
      continue;
    }

    // Handle Mathematics requirements (mutually exclusive)
    if (subjectLower === 'mathematics' || subjectLower === 'mathematical literacy') {
      if (!checkMutuallyExclusiveSubjects('mathematics', 'mathematical literacy', required_mark)) {
        return false;
      }
      continue;
    }

    // Handle regular subjects (non-mutually exclusive)
    const userMark = getUserMark(subject);
    if (userMark === null || userMark < required_mark) {
      console.log(`❌ Failed requirement: ${subject} - Required: ${required_mark}, User: ${userMark || 'N/A'}`);
      return false;
    }

    console.log(`✅ Passed requirement: ${subject} - Required: ${required_mark}, User: ${userMark}`);
  }

  console.log(`✅ QUALIFIED for: ${degree.title}`);
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
    // await write_to_file('almost-qualified-v2.json', almost_qualified_degrees);

    console.log('almost qualified degrees:', almost_qualified_degrees);

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

  try {
    const user_aps = get_aps_by_university(degree.university);

    // Check APS requirement - must be within 2 points
    const aps_gap = degree.aps - user_aps;
    if (aps_gap > 2) {
      return false; // APS gap is too large
    }
  } catch (error) {
    return false; // Unknown university
  }

  // Helper function to find user's mark for a subject (case-insensitive)
  const getUserMark = (subjectName: string) => {
    const result = user_marks.find((result: any) =>
      result.subject.toLowerCase() === subjectName.toLowerCase()
    );
    return result ? result.mark : null;
  };

  // Helper function to check mutually exclusive subjects for "almost qualified"
  const checkMutuallyExclusiveAlmostQualified = (option1: string, option2: string, requiredMark: number) => {
    const mark1 = getUserMark(option1);
    const mark2 = getUserMark(option2);

    // User must have at least one of these subjects
    if (mark1 === null && mark2 === null) {
      return false; // User doesn't have either subject
    }

    // Check if either subject is within 5 points of requirement
    const gap1 = mark1 !== null ? requiredMark - mark1 : Infinity;
    const gap2 = mark2 !== null ? requiredMark - mark2 : Infinity;

    const minGap = Math.min(gap1, gap2);

    if (minGap <= 5) {
      return true; // Within 5 points
    }

    return false; // Gap is too large
  };

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

    const subjectLower = subject.toLowerCase();

    // Handle English language requirements (mutually exclusive)
    if (subjectLower === 'english home language' || subjectLower === 'english first additional language') {
      if (!checkMutuallyExclusiveAlmostQualified('english home language', 'english first additional language', required_mark)) {
        return false;
      }
      continue;
    }

    // Handle Mathematics requirements (mutually exclusive)
    if (subjectLower === 'mathematics' || subjectLower === 'mathematical literacy') {
      if (!checkMutuallyExclusiveAlmostQualified('mathematics', 'mathematical literacy', required_mark)) {
        return false;
      }
      continue;
    }

    // Handle regular subjects
    const userMark = getUserMark(subject);

    if (userMark === null) {
      // User doesn't have this subject at all - disqualifies from "almost qualified"
      return false;
    }

    const subject_gap = required_mark - userMark;
    if (subject_gap > 5) {
      return false; // Subject gap is too large
    }
  }

  // If we get here, the degree meets the "almost qualified" criteria:
  // - APS gap ≤ 2
  // - All subject gaps ≤ 5 (considering mutually exclusive subjects)
  // - User has all required subjects (or alternatives)
  return true;
}

export { get_qualified_degrees, get_almost_qualified_degrees }