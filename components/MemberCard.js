import { useEffect } from 'react';
import { useWatch } from 'react-hook-form';
import styles from './MemberCard.module.css';
import {
  SEX_OPTIONS,
  MARITAL_STATUS,
  HOME_SITUATION,
  OCCUPATION,
  EDUCATION,
} from '../lib/constants';

// Max selectable DOB: 01 Apr 2026
const MAX_DOB = '2026-04-01';
const MAX_DATE = new Date('2026-04-01');

// Returns true if the person is under 3 years old relative to 01 Apr 2026
function isUnder3Years(dobString) {
  if (!dobString) return false;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return false;
  const diffMs = MAX_DATE - dob;
  const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);
  return diffYears < 3;
}

export default function MemberCard({ index, register, control, setValue, errors, onRemove, canRemove }) {
  const field = (name) => `members.${index}.${name}`;
  const err = (name) => errors?.members?.[index]?.[name];

  // Watch DOB to conditionally hide education
  const dobValue = useWatch({ control, name: field('dob') });
  const hideEducation = isUnder3Years(dobValue);

  // When fields are hidden (child under 3 yrs), clear their values so blank is sent to API
  useEffect(() => {
    if (hideEducation) {
      setValue(field('education'), '', { shouldValidate: false });
      setValue(field('occupation'), '', { shouldValidate: false });
      setValue(field('jobName'), '', { shouldValidate: false });
    }
  }, [hideEducation]); // eslint-disable-line react-hooks/exhaustive-deps

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
            <option value="">-- પસંદ કરો --</option>
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
            <option value="">-- પસંદ કરો --</option>
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
            <option value="">-- પસંદ કરો --</option>
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
            max={MAX_DOB}
            {...register(field('dob'), {
              required: 'જન્મ તારીખ અનિવાર્ય છે',
              validate: (v) => {
                const birthDate = new Date(v);
                return birthDate <= MAX_DATE || `01 Apr 2026 પછી ની તારીખ ન ભરો`;
              },
            })}
          />
          {err('dob') && <span className={styles.errorMsg}>{err('dob').message}</span>}
        </div>

        {/* Occupation — hidden for children under 3 years */}
        {!hideEducation && (
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              વ્યવસાય / નોકરી <span className={styles.required}>*</span>
            </label>
            <select
              className={`${styles.select} ${err('occupation') ? styles.inputError : ''}`}
              {...register(field('occupation'), { required: 'વ્યવસાય પસંદ કરો' })}
            >
              <option value="">-- પસંદ કરો --</option>
              {OCCUPATION.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            {err('occupation') && <span className={styles.errorMsg}>{err('occupation').message}</span>}
          </div>
        )}

        {/* Job / Business Name — hidden for children under 3 years */}
        {!hideEducation && (
          <div className={styles.fieldGroup}>
            <label className={styles.label}>નોકરી / વ્યવસાય નું નામ</label>
            <input
              type="text"
              className={styles.input}
              placeholder="નોકરી અથવા વ્યવસાય નું નામ (વૈકલ્પિક)"
              {...register(field('jobName'))}
            />
          </div>
        )}

        {/* Education — hidden for children under 3 years (DOB within 3 yrs of 01 Apr 2026) */}
        {!hideEducation && (
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              શિક્ષણ <span className={styles.required}>*</span>
            </label>
            <select
              className={`${styles.select} ${err('education') ? styles.inputError : ''}`}
              {...register(field('education'), { required: 'શિક્ષણ પસંદ કરો' })}
            >
              <option value="">-- પસંદ કરો --</option>
              {EDUCATION.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            {err('education') && <span className={styles.errorMsg}>{err('education').message}</span>}
          </div>
        )}


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
