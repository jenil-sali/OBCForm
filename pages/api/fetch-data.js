import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { mobile, email } = req.query;

  if (!mobile && !email) {
    return res.status(400).json({ success: false, message: 'Mobile or Email is required.' });
  }

  try {
    if (!process.env.GOOGLE_SHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      return res.status(500).json({ success: false, message: 'Server configuration error.' });
    }

    const rawKey = process.env.GOOGLE_PRIVATE_KEY || '';
    const privateKey = rawKey.split(String.fromCharCode(92, 110)).join('\n');

    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: privateKey.replace(/^"|"$/g, ''),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    const rows = await sheet.getRows();

    // Find all rows matching the mobile or email
    const matchedRows = rows.filter(row => {
      const rowMobile = row.get('Mobile (મોબાઈલ નંબર)') || '';
      const rowEmail = row.get('Email (ઈ-મેઇલ)') || '';

      let isMatch = false;
      if (mobile && rowMobile.toString() === mobile.toString()) isMatch = true;
      if (email && rowEmail.toString().toLowerCase() === email.toString().toLowerCase()) isMatch = true;

      return isMatch;
    });

    if (matchedRows.length === 0) {
      return res.status(404).json({ success: false, message: 'No data found' });
    }

    // Extract common details from the first matched row
    const firstRow = matchedRows[0];
    const commonDetails = {
      email: firstRow.get('Email (ઈ-મેઇલ)') || '',
      mobile: firstRow.get('Mobile (મોબાઈલ નંબર)') || '',
      headName: firstRow.get('Head of Family (ઘર નો મુખ્ય સભ્ય)') || '',
      houseNo: firstRow.get('House No (ઘર નંબર)') || '',
      society: firstRow.get('Society (સોસાયટી નું નામ)') || '',
      district: firstRow.get('District (જિલ્લો)') || '',
      taluka: firstRow.get('Taluka (તાલુકો)') || '',
      village: firstRow.get('Village/Ward (ગામ/વોર્ડ)') || '',
      department: firstRow.get('Department (વિભાગ)') || '',
    };

    const familyMembers = matchedRows.map(row => ({
      fullName: row.get('Full Name (પૂરું નામ)') || '',
      sex: row.get('Sex (લિંગ)') || '',
      maritalStatus: row.get('Marital Status (વૈવાહિક સ્થિતિ)') || '',
      homeSituation: row.get('Home Situation (ઘર ની પરિસ્થિતિ)') || '',
      dob: row.get('Date of Birth (જન્મ તારીખ)') || '',
      occupation: row.get('Occupation (વ્યવસાય)') || '',
      jobName: row.get('Job/Business Name (નોકરી/વ્યવસાય નું નામ)') || '',
      education: row.get('Education (શિક્ષણ)') || '',
      caste: row.get('Caste (જ્ઞાતિ - LC મુજબ)') || '',
    }));

    return res.status(200).json({
      success: true,
      data: {
        commonDetails,
        familyMembers,
      }
    });

  } catch (error) {
    console.error('Fetch Data Error:', error);
    return res.status(500).json({ success: false, message: 'Error fetching data', error: error.message });
  }
}
