import { useState, useEffect } from 'react';
import Head from 'next/head';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import styles from '../../styles/Admin.module.css';
import { DEPARTMENTS, EDUCATION, OCCUPATION } from '../../lib/constants';

const ALL_COLUMNS = [
  { id: 'timestamp', label: 'Timestamp' },
  { id: 'fullName', label: 'Full Name' },
  { id: 'headName', label: 'Head of Family' },
  { id: 'mobile', label: 'Mobile' },
  { id: 'email', label: 'Email' },
  { id: 'village', label: 'Village/Ward' },
  // { id: 'taluka', label: 'Taluka' },
  { id: 'district', label: 'District' },
  { id: 'houseNo', label: 'House No' },
  { id: 'society', label: 'Society' },
  { id: 'department', label: 'Department' },
  { id: 'sex', label: 'Sex' },
  { id: 'maritalStatus', label: 'Marital Status' },
  { id: 'homeSituation', label: 'Home Situation' },
  { id: 'dob', label: 'Date of Birth' },
  { id: 'education', label: 'Education' },
  { id: 'occupation', label: 'Occupation' },
  { id: 'jobName', label: 'Job Name' },
  { id: 'caste', label: 'Caste' }
];

const DEFAULT_COLUMNS = [
  'fullName', 'mobile', 'village', 'district', 'department', 'education', 'occupation'
];

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState([]);

  const [isDataVisible, setIsDataVisible] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingCSV, setIsGeneratingCSV] = useState(false);

  // Column Selection
  const [selectedColumns, setSelectedColumns] = useState(DEFAULT_COLUMNS);
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  const [filters, setFilters] = useState({
    district: '',
    taluka: '',
    village: '',
    department: '',
    education: '',
    occupation: '',
    search: ''
  });

  const [isFiltering, setIsFiltering] = useState(false);

  useEffect(() => {
    const savedPassword = localStorage.getItem('adminPassword');
    if (savedPassword) {
      setPassword(savedPassword);
      verifyPassword(savedPassword);
    }
  }, []);

  const verifyPassword = async (pass) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pass }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setIsLoggedIn(true);
        localStorage.setItem('adminPassword', pass);
      } else {
        setError(result.message || 'Invalid password.');
        setIsLoggedIn(false);
        localStorage.removeItem('adminPassword');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    verifyPassword(password);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminPassword');
    setIsLoggedIn(false);
    setData([]);
    setPassword('');
    setIsDataVisible(false);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = async () => {
    setIsFiltering(true);
    setShowColumnSelector(false);
    try {
      const res = await fetch('/api/admin/fetch-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, filters }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setData(result.data);
        setIsDataVisible(true);
      } else {
        alert(result.message || 'Error fetching report data');
      }
    } catch (error) {
      console.error(error);
      alert('Network error while fetching report data');
    } finally {
      setIsFiltering(false);
    }
  };

  const clearFilters = () => {
    const emptyFilters = {
      district: '', taluka: '', village: '', department: '', education: '', occupation: '', search: ''
    };
    setFilters(emptyFilters);
    setData([]);
    setIsDataVisible(false);
  };

  const toggleColumn = (colId) => {
    setSelectedColumns(prev => {
      if (prev.includes(colId)) {
        return prev.filter(id => id !== colId);
      } else {
        return [...prev, colId];
      }
    });
  };

  // Helper to get selected column objects in the order of ALL_COLUMNS
  const getVisibleColumns = () => {
    return ALL_COLUMNS.filter(col => DEFAULT_COLUMNS.includes(col.id) || selectedColumns.includes(col.id));
  };

  const exportCSV = () => {
    if (!isDataVisible || data.length === 0) return;
    setIsGeneratingCSV(true);

    setTimeout(() => {
      try {
        const visibleCols = getVisibleColumns();
        const headers = visibleCols.map(col => col.label);

        const rows = data.map(item => {
          return visibleCols.map(col => item[col.id]);
        });

        let csvString = headers.join(',') + '\n';
        rows.forEach(row => {
          const escapedRow = row.map(val => {
            const stringVal = String(val || '');
            return `"${stringVal.replace(/"/g, '""')}"`;
          });
          csvString += escapedRow.join(',') + '\n';
        });

        const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'obc_report.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } finally {
        setIsGeneratingCSV(false);
      }
    }, 50);
  };

  const exportPDF = async () => {
    if (!isDataVisible || data.length === 0) return;
    setIsGeneratingPDF(true);

    try {
      const doc = new jsPDF('landscape');

      const fontUrl = '/fonts/HindVadodara-Regular.ttf';
      const fontResponse = await fetch(fontUrl);
      const fontBuffer = await fontResponse.arrayBuffer();

      let binary = '';
      const bytes = new Uint8Array(fontBuffer);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const fontBase64 = btoa(binary);

      doc.addFileToVFS("HindVadodara-Regular.ttf", fontBase64);
      doc.addFont("HindVadodara-Regular.ttf", "HindVadodara", "normal");
      doc.setFont("HindVadodara");

      doc.text('OBC Form Submissions Report', 14, 15);

      const visibleCols = getVisibleColumns();
      const tableColumn = visibleCols.map(col => col.label);

      const tableRows = [];

      data.forEach(item => {
        const rowData = visibleCols.map(col => item[col.id]);
        tableRows.push(rowData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        styles: {
          font: "HindVadodara",
          fontSize: 8
        },
        headStyles: {
          fillColor: [41, 128, 185],
          font: "HindVadodara"
        },
      });

      doc.save('obc_report.pdf');
    } catch (e) {
      console.error("Error generating PDF:", e);
      alert("Failed to generate PDF with Gujarati fonts. Ensure fonts are loaded.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className={styles.loginContainer}>
        <Head><title>Admin Login - OBC Form</title></Head>
        <div className={styles.loginCard}>
          <h2 className={styles.loginTitle}>Admin Login</h2>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className={styles.loginInput}
            />
            {error && <div className={styles.errorText}>{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className={styles.loginBtn}
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const visibleCols = getVisibleColumns();

  return (
    <div className={styles.container}>
      <Head><title>Admin Dashboard - OBC Form</title></Head>

      <div className={styles.header}>
        <h1 className={styles.title}>Admin Dashboard</h1>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Logout
        </button>
      </div>

      {/* Filters Section */}
      <div className={styles.filtersCard}>
        <h2 className={styles.filtersTitle}>Filters & Search</h2>
        <div className={styles.filtersGrid}>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Search (Name, Email, Phone)</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search anything..."
              className={styles.filterInput}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Department</label>
            <select name="department" value={filters.department} onChange={handleFilterChange} className={styles.filterSelect}>
              <option value="">All Departments</option>
              {DEPARTMENTS.map(val => <option key={val} value={val}>{val}</option>)}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Education</label>
            <select name="education" value={filters.education} onChange={handleFilterChange} className={styles.filterSelect}>
              <option value="">All Education</option>
              {EDUCATION.map(val => <option key={val} value={val}>{val}</option>)}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Occupation</label>
            <select name="occupation" value={filters.occupation} onChange={handleFilterChange} className={styles.filterSelect}>
              <option value="">All Occupations</option>
              {OCCUPATION.map(val => <option key={val} value={val}>{val}</option>)}
            </select>
          </div>

        </div>

        <div className={styles.filtersActions}>
          <button onClick={applyFilters} disabled={isFiltering} className={`${styles.btn} ${styles.btnPrimary}`}>
            {isFiltering ? 'Fetching Report...' : 'Apply Filters & View Data'}
          </button>
          <button onClick={clearFilters} className={`${styles.btn} ${styles.btnSecondary}`}>
            Clear & Hide
          </button>

          <button
            onClick={() => setShowColumnSelector(!showColumnSelector)}
            className={`${styles.btn} ${styles.btnSecondary}`}
          >
            {showColumnSelector ? 'Hide Columns' : 'Select Columns'}
          </button>

          <div className={styles.spacer}></div>

          {isDataVisible && data.length > 0 && (
            <>
              <button
                onClick={exportCSV}
                disabled={isGeneratingCSV || isGeneratingPDF}
                className={`${styles.btn} ${styles.btnSecondary}`}
              >
                {isGeneratingCSV ? <><span className={styles.spinner}></span> CSV...</> : 'Download CSV'}
              </button>
              <button
                onClick={exportPDF}
                disabled={isGeneratingPDF || isGeneratingCSV}
                className={`${styles.btn} ${styles.btnSecondary}`}
              >
                {isGeneratingPDF ? <><span className={styles.spinner}></span> PDF...</> : 'Download PDF'}
              </button>
            </>
          )}
        </div>

        {/* Column Selector Panel */}
        {showColumnSelector && (
          <div className={styles.columnSelector}>
            <h3 className={styles.filtersTitle} style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Select Columns to Display & Export</h3>
            <div className={styles.columnGrid}>
              {ALL_COLUMNS.map(col => {
                const isMandatory = DEFAULT_COLUMNS.includes(col.id);
                return (
                  <label 
                    key={col.id} 
                    className={styles.columnLabel}
                    style={{ opacity: isMandatory ? 0.6 : 1, cursor: isMandatory ? 'not-allowed' : 'pointer' }}
                  >
                    <input
                      type="checkbox"
                      checked={isMandatory || selectedColumns.includes(col.id)}
                      onChange={() => !isMandatory && toggleColumn(col.id)}
                      disabled={isMandatory}
                      className={styles.columnCheckbox}
                      style={{ cursor: isMandatory ? 'not-allowed' : 'pointer' }}
                    />
                    {col.label}
                    {isMandatory && <span style={{fontSize: '0.7em', color: 'var(--text-muted)'}}>(Req)</span>}
                  </label>
                );
              })}
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setSelectedColumns(ALL_COLUMNS.map(c => c.id))}
                className={`${styles.btn} ${styles.btnSecondary}`}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
              >
                Select All
              </button>
              <button
                onClick={() => setSelectedColumns(DEFAULT_COLUMNS)}
                className={`${styles.btn} ${styles.btnSecondary}`}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
              >
                Reset to Default
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      {isFiltering ? (
        <div className={styles.tableCard}>
          <div className={styles.emptyState}>
            <span className={styles.spinner} style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: 'var(--accent-1)' }}></span>
            Loading report...
          </div>
        </div>
      ) : isDataVisible ? (
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <span className={styles.tableCount}>
              Showing {data.length} {data.length === 1 ? 'record' : 'records'}
            </span>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {visibleCols.map(col => (
                    <th key={col.id}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => (
                  <tr key={idx}>
                    {visibleCols.map(col => (
                      <td key={col.id}>
                        <div className={styles.primaryText}>{item[col.id]}</div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {data.length === 0 && (
              <div className={styles.emptyState}>
                No records found matching the current filters.
              </div>
            )}
            {visibleCols.length === 0 && (
              <div className={styles.emptyState}>
                No columns selected. Please select at least one column to view data.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.emptyState}>
            Please select your desired filters and click "Apply Filters & View Data" to load the report.
          </div>
        </div>
      )}

    </div>
  );
}
