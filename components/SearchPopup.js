import { useState } from 'react';
import styles from './SearchPopup.module.css';

export default function SearchPopup({ isOpen, onClose, onSearch }) {
  const [searchValue, setSearchValue] = useState('');
  const [searchType, setSearchType] = useState('mobile');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!searchValue) return;
    onSearch(searchType, searchValue);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        <h2 className={styles.title}>માહિતી શોધો (Find Data)</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>શેના દ્વારા શોધવું છે?</label>
            <select 
              className={styles.select} 
              value={searchType} 
              onChange={(e) => {
                setSearchType(e.target.value);
                setSearchValue('');
              }}
            >
              <option value="mobile">મોબાઈલ નંબર (Mobile Number)</option>
              <option value="email">ઈ-મેઇલ (Email)</option>
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              {searchType === 'mobile' ? 'મોબાઈલ નંબર દાખલ કરો' : 'ઈ-મેઇલ દાખલ કરો'}
            </label>
            <input
              type={searchType === 'mobile' ? 'tel' : 'email'}
              className={styles.input}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={searchType === 'mobile' ? '10 અંકનો મોબાઈલ નંબર' : 'example@gmail.com'}
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn}>
            ડેટા શોધો (Search)
          </button>
        </form>
      </div>
    </div>
  );
}
