import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { password, filters } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'; // fallback for development

  if (password !== adminPassword) {
    return res.status(401).json({ success: false, message: 'Invalid password' });
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

    // Parse all rows
    let data = rows.map(row => ({
      timestamp: row.get('Timestamp') || '',
      email: row.get('Email (ઈ-મેઇલ)') || '',
      mobile: row.get('Mobile (મોબાઈલ નંબર)') || '',
      headName: row.get('Head of Family (ઘર નો મુખ્ય સભ્ય)') || '',
      houseNo: row.get('House No (ઘર નંબર)') || '',
      society: row.get('Society (સોસાયટી નું નામ)') || '',
      district: row.get('District (જિલ્લો)') || '',
      taluka: row.get('Taluka (તાલુકો)') || '',
      village: row.get('Village/Ward (ગામ/વોર્ડ)') || '',
      department: row.get('Department (વિભાગ)') || '',
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

    // Server-side filtering
    if (filters) {
      data = data.filter(item => {
        let match = true;
        
        // Exact matches for dropdowns
        if (filters.department && item.department !== filters.department) match = false;
        if (filters.education && item.education !== filters.education) match = false;
        if (filters.occupation && item.occupation !== filters.occupation) match = false;
        
        // Partial/Case-insensitive matches for text inputs
        if (filters.district && !item.district.toLowerCase().includes(filters.district.toLowerCase())) match = false;
        if (filters.taluka && !item.taluka.toLowerCase().includes(filters.taluka.toLowerCase())) match = false;
        if (filters.village && !item.village.toLowerCase().includes(filters.village.toLowerCase())) match = false;
        
        // General Search
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          const searchFields = [
            item.fullName, item.headName, item.email, item.mobile, item.jobName, item.caste
          ];
          if (!searchFields.some(f => f && f.toLowerCase().includes(searchLower))) {
            match = false;
          }
        }
        
        return match;
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });

  } catch (error) {
    console.error('Admin Fetch Report Error:', error);
    return res.status(500).json({ success: false, message: 'Error fetching data', error: error.message });
  }
}
