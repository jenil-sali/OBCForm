import styles from './MemberCard.module.css';
import {
  SEX_OPTIONS,
  MARITAL_STATUS,
  HOME_SITUATION,
  OCCUPATION,
  EDUCATION,
} from '../lib/constants';

export default function MemberCard({ index, register, errors, onRemove, canRemove }) {
  const field = (name) => `members.${index}.${name}`;
  const err = (name) => errors?.members?.[index]?.[name];

  return (
    <div className={`${styles.card} ${index === 0 ? styles.cardHead : ''}`}>
      <div className={styles.cardHeader}>
        <div className={styles.cardBadge}>
          <span className={styles.badgeNumber}>{index + 1}</span>
          <span className={styles.badgeText}>સભ્ય</span>
        </div>
        <h3 className={styles.cardTitle}>પરિવારના સભ્ય #{index + 1}</h3>

        {index === 0 ? (
          <div className={styles.headBadge}>
            {/* <span>👑</span> */}
            <span>મુખ્ય સભ્ય</span>
          </div>
        ) : (
          <div className={styles.otherBadge}>
            <span>અન્ય સભ્ય</span>
          </div>
        )}

        {canRemove && (
          <button type="button" className={styles.removeBtn} onClick={() => onRemove(index)} aria-label="Remove member">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      <div className={styles.grid}>

        {/* Full Name */}
        <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
          <label className={styles.label}>
            ઘરના વ્યક્તિ પૂરુ નામ <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            className={`${styles.input} ${err('fullName') ? styles.inputError : ''}`}
            placeholder="સભ્ય નું સંપૂર્ણ નામ ગુજરાતીમાં"
            {...register(field('fullName'), {
              required: 'સભ્ય નું પૂરું નામ અનિવાર્ય છે',
              minLength: { value: 2, message: 'નામ ઓછામાં ઓછા 2 અક્ષર નું હોવું જોઈએ' },
            })}
          />
          {err('fullName') && <span className={styles.errorMsg}>{err('fullName').message}</span>}
        </div>

        {/* Sex */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            લિંગ <span className={styles.required}>*</span>
          </label>
          <select
            className={`${styles.select} ${err('sex') ? styles.inputError : ''}`}
            {...register(field('sex'), { required: 'લિંગ પસંદ કરો' })}
          >
            <option value="">-- પ્સ્ંદ કરો --</option>
            {SEX_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          {err('sex') && <span className={styles.errorMsg}>{err('sex').message}</span>}
        </div>

        {/* Marital Status */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            વૈવાહિક સ્થિતિ <span className={styles.required}>*</span>
          </label>
          <select
            className={`${styles.select} ${err('maritalStatus') ? styles.inputError : ''}`}
            {...register(field('maritalStatus'), { required: 'વૈવાહિક સ્થિતિ પસંદ કરો' })}
          >
            <option value="">-- પ્સ્ંદ કરો --</option>
            {MARITAL_STATUS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          {err('maritalStatus') && <span className={styles.errorMsg}>{err('maritalStatus').message}</span>}
        </div>

        {/* Home Situation */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            ઘર ની પરિસ્થિતિ <span className={styles.required}>*</span>
          </label>
          <select
            className={`${styles.select} ${err('homeSituation') ? styles.inputError : ''}`}
            {...register(field('homeSituation'), { required: 'ઘર ની પરિસ્થિતિ પસંદ કરો' })}
          >
            <option value="">-- પ્સ્ંદ કરો --</option>
            {HOME_SITUATION.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          {err('homeSituation') && <span className={styles.errorMsg}>{err('homeSituation').message}</span>}
        </div>

        {/* Date of Birth */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            જન્મ તારીખ <span className={styles.required}>*</span>
          </label>
          <input
            type="date"
            className={`${styles.input} ${err('dob') ? styles.inputError : ''}`}
            max={new Date().toISOString().split('T')[0]}
            {...register(field('dob'), {
              required: 'જન્મ તારીખ અનિવાર્ય છે',
              validate: (v) => {
                const birthDate = new Date(v);
                const today = new Date();
                return birthDate < today || 'ભવિષ્ય ની તારીખ ન ભરો';
              },
            })}
          />
          {err('dob') && <span className={styles.errorMsg}>{err('dob').message}</span>}
        </div>

        {/* Occupation */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            વ્યવસાય / નોકરી <span className={styles.required}>*</span>
          </label>
          <select
            className={`${styles.select} ${err('occupation') ? styles.inputError : ''}`}
            {...register(field('occupation'), { required: 'વ્યવસાય પસંદ કરો' })}
          >
            <option value="">-- પ્સ્ંદ કરો --</option>
            {OCCUPATION.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          {err('occupation') && <span className={styles.errorMsg}>{err('occupation').message}</span>}
        </div>

        {/* Job / Business Name */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>નોકરી / વ્યવસાય નું નામ</label>
          <input
            type="text"
            className={styles.input}
            placeholder="નોકરી અથવા વ્યવસાય નું નામ (વૈકલ્પિક)"
            {...register(field('jobName'))}
          />
        </div>

        {/* Education */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            શિક્ષણ <span className={styles.required}>*</span>
          </label>
          <select
            className={`${styles.select} ${err('education') ? styles.inputError : ''}`}
            {...register(field('education'), { required: 'શિક્ષણ પસંદ કરો' })}
          >
            <option value="">-- પ્સ્ંદ કરો --</option>
            {EDUCATION.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          {err('education') && <span className={styles.errorMsg}>{err('education').message}</span>}
        </div>

        {/* Caste */}
        <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
          <label className={styles.label}>
            સ્કૂલ લિવિંગ સર્ટિફિકેટ (LC) મુજબ જ્ઞાતિ અને પેટા જ્ઞાતિ <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            className={`${styles.input} ${err('caste') ? styles.inputError : ''}`}
            placeholder="LC માં લખેલ જ્ઞાતિ અને પેટા જ્ઞાતિ"
            {...register(field('caste'), {
              required: 'જ્ઞાતિ અનિવાર્ય છે',
            })}
          />
          {err('caste') && <span className={styles.errorMsg}>{err('caste').message}</span>}
        </div>

      </div>
    </div>
  );
}
