import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { commonDetails, familyMembers, headMemberIndex = 0, headMemberName = '' } = req.body;

    // Validate required environment variables
    if (!process.env.GOOGLE_SHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      console.error('Missing Google Sheets environment variables');
      return res.status(500).json({ success: false, message: 'Server configuration error.' });
    }

    // Validate input shape
    if (!commonDetails || !Array.isArray(familyMembers) || familyMembers.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid form data.' });
    }

    // Authenticate with Google
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();

    // Use first sheet
    const sheet = doc.sheetsByIndex[0];

    // Prepare the rows: one row per family member
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const rows = familyMembers.map((member, i) => ({
      'Timestamp': timestamp,
      'Email (ઈ-મેઇલ)': commonDetails.email || '',
      'Mobile (મોબાઈલ નંબર)': commonDetails.mobile || '',
      'House No (ઘર નંબર)': commonDetails.houseNo || '',
      'Society (સોસાયટી નું નામ)': commonDetails.society || '',
      'District (જિલ્લો)': commonDetails.district || '',
      'Taluka (તાલુકો)': commonDetails.taluka || '',
      'Village/Ward (ગામ/વોર્ડ)': commonDetails.village || '',
      'Department (વિભાગ)': commonDetails.department || '',
      'Head of Family (ઘર નો મુખ્ય સભ્ય)': headMemberName || '',
      'Full Name (પૂરું નામ)': member.fullName || '',
      'Is Head (મુખ્ય સભ્ય)': i === headMemberIndex ? 'હા (Yes)' : 'ના (No)',
      'Sex (લિંગ)': member.sex || '',
      'Marital Status (વૈવાહિક સ્થિતિ)': member.maritalStatus || '',
      'Home Situation (ઘર ની પરિસ્થિતિ)': member.homeSituation || '',
      'Date of Birth (જન્મ તારીખ)': member.dob || '',
      'Occupation (વ્યવસાય)': member.occupation || '',
      'Job/Business Name (નોકરી/વ્યવસાય નું નામ)': member.jobName || '',
      'Education (શિક્ષણ)': member.education || '',
      'Caste (જ્ઞાતિ - LC મુજબ)': member.caste || '',
    }));

    await sheet.addRows(rows);

    return res.status(200).json({ success: true, message: 'ડેટા સફળતાપૂર્વક સ્પ્રેડશીટ માં ઉમેરવામાં આવ્યો.' });

  } catch (error) {
    console.error('Google Sheets API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'ડેટા સ્પ્રેડશીટ માં ઉમેરવામાં ભૂલ આવી. ફરી પ્રયાસ કરો.',
      error: error.message,
      errorCode: error.code || error.status || null,
    });
  }
}
