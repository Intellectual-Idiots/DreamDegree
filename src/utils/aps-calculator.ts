const get_wits_aps = (): number => {
  // get resultsData array from local storage
  // looks like: [{'subject': 'mathematics', 'mark': 93}, ...]
  const resultsData = JSON.parse(localStorage.getItem('resultsData') || '[]');

  // check if mathematics/mathematical literacy and english home/first additional language are present
  if (resultsData.some((result: { subject: string }) => result.subject === 'mathematics' || result.subject === 'mathematical literacy') &&
      resultsData.some((result: { subject: string }) => result.subject === 'english home language' || result.subject === 'english first additional language') && 
      resultsData.some((result: { subject: string }) => result.subject === 'life orientation')) {
    
    let totalAps = 0;
    let subjectsProcessed = 0;

    // Helper function for English and Mathematics points
    const getEnglishMathPoints = (mark: number): number => {
      if (mark >= 90) return 10;
      if (mark >= 80) return 9;
      if (mark >= 70) return 8;
      if (mark >= 60) return 7;
      return 0; // Below 60% gets 0 points
    };

    // Helper function for Life Orientation points
    const getLifeOrientationPoints = (mark: number): number => {
      if (mark >= 90) return 4;
      if (mark >= 80) return 3;
      if (mark >= 70) return 2;
      if (mark >= 60) return 1;
      return 0; // Below 60% gets 0 points
    };

    // Helper function for regular subjects points
    const getRegularSubjectPoints = (mark: number): number => {
      if (mark >= 90) return 8;
      if (mark >= 80) return 7;
      if (mark >= 70) return 6;
      if (mark >= 60) return 5;
      if (mark >= 50) return 4;
      if (mark >= 40) return 3;
      return 0; // Below 40% gets 0 points
    };
    
    // First, process the 3 compulsory subjects
    const compulsorySubjects: string[] = [];
    
    // Find and process English
    const englishSubject = resultsData.find((result: { subject: string }) => 
      result.subject === 'english home language' || result.subject === 'english first additional language'
    );
    if (englishSubject) {
      totalAps += getEnglishMathPoints(englishSubject.mark);
      compulsorySubjects.push(englishSubject.subject);
      subjectsProcessed++;
    }
    
    // Find and process Mathematics
    const mathSubject = resultsData.find((result: { subject: string }) => 
      result.subject === 'mathematics'
    );
    if (mathSubject) {
      totalAps += getEnglishMathPoints(mathSubject.mark);
      compulsorySubjects.push(mathSubject.subject);
      subjectsProcessed++;
    }
    
    // Find and process Life Orientation
    const lifeOrientationSubject = resultsData.find((result: { subject: string }) => 
      result.subject === 'life orientation'
    );
    if (lifeOrientationSubject) {
      totalAps += getLifeOrientationPoints(lifeOrientationSubject.mark);
      compulsorySubjects.push(lifeOrientationSubject.subject);
      subjectsProcessed++;
    }
    
    // Now get the remaining subjects (excluding compulsory ones) and sort by marks
    const remainingSubjects = resultsData
      .filter((result: { subject: string }) => !compulsorySubjects.includes(result.subject))
      .sort((a: { mark: number }, b: { mark: number }) => b.mark - a.mark);
    
    // Add the highest-scoring remaining subjects to reach 7 total subjects
    const remainingSlotsNeeded = 7 - subjectsProcessed;
    for (let i = 0; i < Math.min(remainingSlotsNeeded, remainingSubjects.length); i++) {
      totalAps += (remainingSubjects[i].subject === "further studies mathematics" || remainingSubjects[i].subject === "further studies english") ? getEnglishMathPoints(remainingSubjects[i].mark) : getRegularSubjectPoints(remainingSubjects[i].mark);
      subjectsProcessed++;
    }
    
    return totalAps;
  }

  return -1;
}

const get_up_aps = (): number => {
  // get resultsData array from local storage
  const resultsData = JSON.parse(localStorage.getItem('resultsData') || '[]');

  // Check if compulsory subjects are present (same as Wits but excluding Life Orientation)
  if (resultsData.some((result: { subject: string }) => result.subject === 'mathematics' || result.subject === 'mathematical literacy') &&
      resultsData.some((result: { subject: string }) => result.subject === 'english home language' || result.subject === 'english first additional language')) {

    // Helper function for UP APS points calculation
    const getUpPoints = (mark: number): number => {
      if (mark >= 80) return 7;
      if (mark >= 70) return 6;
      if (mark >= 60) return 5;
      if (mark >= 50) return 4;
      if (mark >= 40) return 3;
      if (mark >= 30) return 2;
      return 1; // 0-29% gets 1 point
    };

    let totalAps = 0;
    let subjectsProcessed = 0;
    const compulsorySubjects: string[] = [];

    // Find and process English (compulsory)
    const englishSubject = resultsData.find((result: { subject: string }) => 
      result.subject === 'english home language' || result.subject === 'english first additional language'
    );
    if (englishSubject) {
      totalAps += getUpPoints(englishSubject.mark);
      compulsorySubjects.push(englishSubject.subject);
      subjectsProcessed++;
    }

    // Find and process Mathematics (compulsory)
    const mathSubject = resultsData.find((result: { subject: string }) => 
      result.subject === 'mathematics' || result.subject === 'mathematical literacy'
    );
    if (mathSubject) {
      totalAps += getUpPoints(mathSubject.mark);
      compulsorySubjects.push(mathSubject.subject);
      subjectsProcessed++;
    }

    // Get remaining subjects (excluding compulsory and Life Orientation) and sort by marks
    const remainingSubjects = resultsData
      .filter((result: { subject: string }) => 
        !compulsorySubjects.includes(result.subject) && result.subject !== 'life orientation')
      .sort((a: { mark: number }, b: { mark: number }) => b.mark - a.mark);

    // Add the highest-scoring remaining subjects to reach 6 total subjects
    const remainingSlotsNeeded = 6 - subjectsProcessed;
    for (let i = 0; i < Math.min(remainingSlotsNeeded, remainingSubjects.length); i++) {
      totalAps += getUpPoints(remainingSubjects[i].mark);
      subjectsProcessed++;
    }

    return totalAps;
  }

  return -1; // Missing compulsory subjects
}

const get_ufs_aps = (): number => {
  // get resultsData array from local storage
  const resultsData = JSON.parse(localStorage.getItem('resultsData') || '[]');

  // Check if compulsory subjects are present (same as Wits but excluding Life Orientation)
  if (resultsData.some((result: { subject: string }) => result.subject === 'mathematics' || result.subject === 'mathematical literacy') &&
      resultsData.some((result: { subject: string }) => result.subject === 'english home language' || result.subject === 'english first additional language')) {

    // Helper function for UFS APS points calculation
    const getUfsPoints = (mark: number): number => {
      if (mark >= 80) return 7;
      if (mark >= 70) return 6;
      if (mark >= 60) return 5;
      if (mark >= 50) return 4;
      if (mark >= 40) return 3;
      if (mark >= 30) return 2;
      return 1; // 0-29% gets 1 point
    };

    let totalAps = 0;
    let subjectsProcessed = 0;
    const compulsorySubjects: string[] = [];

    // Find and process English (compulsory)
    const englishSubject = resultsData.find((result: { subject: string }) => 
      result.subject === 'english home language' || result.subject === 'english first additional language'
    );
    if (englishSubject) {
      totalAps += getUfsPoints(englishSubject.mark);
      compulsorySubjects.push(englishSubject.subject);
      subjectsProcessed++;
    }

    // Find and process Mathematics (compulsory)
    const mathSubject = resultsData.find((result: { subject: string }) => 
      result.subject === 'mathematics' || result.subject === 'mathematical literacy'
    );
    if (mathSubject) {
      totalAps += getUfsPoints(mathSubject.mark);
      compulsorySubjects.push(mathSubject.subject);
      subjectsProcessed++;
    }

    // Get remaining subjects (excluding compulsory and Life Orientation) and sort by marks
    const remainingSubjects = resultsData
      .filter((result: { subject: string }) => 
        !compulsorySubjects.includes(result.subject) && result.subject !== 'life orientation')
      .sort((a: { mark: number }, b: { mark: number }) => b.mark - a.mark);

    // Add the highest-scoring remaining subjects to reach 6 total subjects
    const remainingSlotsNeeded = 6 - subjectsProcessed;
    for (let i = 0; i < Math.min(remainingSlotsNeeded, remainingSubjects.length); i++) {
      totalAps += getUfsPoints(remainingSubjects[i].mark);
      subjectsProcessed++;
    }

    // Check for Life Orientation bonus point
    const lifeOrientationSubject = resultsData.find((result: { subject: string }) => 
      result.subject === 'life orientation'
    );
    
    if (lifeOrientationSubject && lifeOrientationSubject.mark >= 60) {
      totalAps += 1; // Add 1 bonus point for 60-100% in Life Orientation
    }

    return totalAps;
  }

  return -1; // Missing compulsory subjects
}

export { get_wits_aps, get_up_aps, get_ufs_aps };