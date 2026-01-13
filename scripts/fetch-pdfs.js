const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Parse folder path: "Nenamaga/Grade 6/Science/English/2023_Term1_Test.pdf"
function parseFilePath(folderPath, fileName) {
  const parts = folderPath.split('/').filter(Boolean);
  
  // Expected: [Nenamaga, Grade X, Subject, Medium]
  if (parts.length < 4) {
    console.warn(`⚠️  Invalid path structure: ${folderPath}`);
    return null;
  }
  
  const gradeMatch = parts[1].match(/Grade\s+(\d+)/i);
  const grade = gradeMatch ? parseInt(gradeMatch[1]) : null;
  const subject = parts[2];
  const medium = parts[3];
  
  // Parse filename for year and term: "2023_Term1_Test.pdf" or "Term1_2023.pdf"
  const yearMatch = fileName.match(/(\d{4})/);
  const termMatch = fileName.match(/Term\s*(\d+)/i);
  
  const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
  const term = termMatch ? parseInt(termMatch[1]) : 1;
  
  if (!grade || !subject || !medium) {
    return null;
  }
  
  // Generate ID: g11-maths-2023-t1-si
  const mediumCode = medium.toLowerCase().substring(0, 2);
  const subjectSlug = subject.toLowerCase().replace(/\s+/g, '-');
  const id = `g${grade}-${subjectSlug}-${year}-t${term}-${mediumCode}`;
  
  return {
    id,
    grade,
    subject,
    medium,
    year,
    term
  };
}

async function fetchPDFs() {
  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
  
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/spreadsheets.readonly'
    ]
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const drive = google.drive({ version: 'v3', auth });
  
  const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '';
  const ROOT_FOLDER_ID = process.env.FOLDER_ID || '';
  
  if (!ROOT_FOLDER_ID) {
    throw new Error('FOLDER_ID environment variable is required');
  }
  
  console.log('📊 Fetching manual data from Google Sheets...');
  
  // Fetch manual metadata from sheet (optional)
  let manualData = new Map();
  
  if (SPREADSHEET_ID) {
    try {
      const sheetResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Papers!A2:D', // filename, examType, title, notes
      });
      
      const sheetRows = sheetResponse.data.values || [];
      
      sheetRows.forEach(row => {
        if (row && row[0]) {
          const [filename, examType, title, notes] = row;
          manualData.set(filename.trim(), {
            examType: examType?.trim() || 'School Term Test',
            customTitle: title?.trim(),
            notes: notes?.trim()
          });
        }
      });
      
      console.log(`✅ Found ${manualData.size} entries with manual data`);
    } catch (error) {
      console.warn('⚠️  Could not fetch Google Sheets (optional):', error.message);
    }
  } else {
    console.log('ℹ️  No SPREADSHEET_ID provided, using auto-generated data only');
  }
  
  console.log('📁 Scanning Google Drive folders...');
  
  // Recursive function to get all PDFs with their paths
  async function getAllPDFs(folderId, currentPath = 'Nenamaga') {
    const files = [];
    
    try {
      const response = await drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: 'files(id, name, mimeType, webViewLink, webContentLink, modifiedTime, size)',
        pageSize: 1000
      });
      
      for (const file of response.data.files) {
        if (file.mimeType === 'application/pdf') {
          files.push({
            ...file,
            folderPath: currentPath
          });
        } else if (file.mimeType === 'application/vnd.google-apps.folder') {
          // Recursively scan subfolders
          const subFiles = await getAllPDFs(file.id, `${currentPath}/${file.name}`);
          files.push(...subFiles);
        }
      }
    } catch (error) {
      console.error(`❌ Error scanning folder ${currentPath}:`, error.message);
    }
    
    return files;
  }
  
  const allPDFs = await getAllPDFs(ROOT_FOLDER_ID);
  console.log(`✅ Found ${allPDFs.length} PDFs in folder structure`);
  
  // Process all PDFs
  const papers = [];
  const errors = [];
  
  for (const file of allPDFs) {
    const metadata = parseFilePath(file.folderPath, file.name);
    
    if (!metadata) {
      errors.push(`Invalid structure: ${file.folderPath}/${file.name}`);
      continue;
    }
    
    const manual = manualData.get(file.name) || {};
    
    // Generate title if not manually provided
    const title = manual.customTitle || 
      `Grade ${metadata.grade} ${metadata.subject} ${metadata.year} Term ${metadata.term}${metadata.medium !== 'English' ? ' ' + metadata.medium + ' Medium' : ''}`;
    
    const paper = {
      id: metadata.id,
      grade: metadata.grade,
      subject: metadata.subject,
      medium: metadata.medium,
      year: metadata.year,
      term: metadata.term,
      examType: manual.examType || 'School Term Test',
      title: title,
      pdfUrl: file.webViewLink,
      addedDate: new Date(file.modifiedTime).toISOString().split('T')[0]
    };
    
    // Add optional fields
    if (file.webContentLink) {
      paper.downloadUrl = file.webContentLink;
    }
    if (file.size) {
      paper.fileSize = parseInt(file.size);
    }
    if (manual.notes) {
      paper.notes = manual.notes;
    }
    
    papers.push(paper);
  }
  
  // Sort by most recent first
  papers.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate));
  
  // Ensure data directory exists
  const dataDir = path.join(__dirname, '..', 'src', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Write to JSON file
  fs.writeFileSync(
    path.join(dataDir, 'papers.json'),
    JSON.stringify(papers, null, 2)
  );
  
  console.log(`\n✅ Successfully processed ${papers.length} papers`);
  
  if (errors.length > 0) {
    console.log(`\n⚠️  Errors (${errors.length}):`);
    errors.slice(0, 10).forEach(e => console.log(`   - ${e}`));
    if (errors.length > 10) {
      console.log(`   ... and ${errors.length - 10} more errors`);
    }
  }
  
  // Generate summary
  const summary = {
    totalPapers: papers.length,
    lastUpdated: new Date().toISOString(),
    byGrade: {},
    bySubject: {},
    byMedium: {}
  };
  
  papers.forEach(p => {
    summary.byGrade[p.grade] = (summary.byGrade[p.grade] || 0) + 1;
    summary.bySubject[p.subject] = (summary.bySubject[p.subject] || 0) + 1;
    summary.byMedium[p.medium] = (summary.byMedium[p.medium] || 0) + 1;
  });
  
  console.log('\n📈 Summary:');
  console.log(`   Total: ${summary.totalPapers} papers`);
  console.log(`   Grades: ${Object.keys(summary.byGrade).sort((a,b) => a-b).join(', ')}`);
  console.log(`   Subjects: ${Object.keys(summary.bySubject).sort().join(', ')}`);
  console.log(`   Mediums: ${Object.keys(summary.byMedium).sort().join(', ')}`);
  
  return papers;
}

// Run the script
fetchPDFs()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
