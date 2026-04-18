import Head from 'next/head';
import { useForm, useFieldArray } from 'react-hook-form';
import { useState, useCallback } from 'react';
import MemberCard from '../components/MemberCard';
import PageLoader from '../components/PageLoader';
import Toast from '../components/Toast';
import { DEPARTMENTS, DEFAULT_MEMBER } from '../lib/constants';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const dismissToast = useCallback(() => setToast(null), []);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      mobile: '',
      headName: '',
      houseNo: '',
      society: '',
      district: '',
      taluka: '',
      village: '',
      department: '',
      members: [{ ...DEFAULT_MEMBER }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'members' });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setToast(null);
    try {
      const { email, mobile, headName, houseNo, society, district, taluka, village, department, members } = data;
      const headMemberName = members[0]?.fullName || 'સભ્ય #1';
      const res = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commonDetails: { email, mobile, headName, houseNo, society, district, taluka, village, department },
          familyMembers: members,
          headMemberIndex: 0,
          headMemberName,
        }),
      });
      const json = await res.json();
      if (json.success) {
        reset();
        setToast({ message: `ફોર્મ સફળતાપૂર્વક સ્પ્રેડશીટ માં ઉમેરાઈ ગયો! (${members.length} સભ્ય)`, type: 'success' });
      } else {
        setToast({ message: json.message || 'ત્રુટિ આવી. ફરી પ્રયાસ કરો.', type: 'error' });
      }
    } catch {
      setToast({ message: 'નેટવર્ક ભૂલ. ઇન્ટરનેટ તપાસો અને ફરી પ્રયાસ કરો.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const addMember = () => append({ ...DEFAULT_MEMBER });

  return (
    <>
      {/* Page Loader Overlay */}
      {isLoading && <PageLoader />}

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={dismissToast} />}
      <Head>
        <title>અખિલ ગુજરાત ક્રિયા કમિટી OBC ડેટા ફોર્મ</title>
        <meta name="description" content="ઘરના તમામ સભ્યોની માહિતી ભરો - OBC ડેટા ગુજરાત" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {/* Hero Header */}
        <div className={styles.hero}>
          <div className={styles.heroBadge}>
            <span>અ.ગ.ક્રિ.ક.</span>
          </div>
          <h1 className={styles.heroTitle}>અખિલ ગુજરાત ક્રિયા કમિટી</h1>
          <p className={styles.heroSubtitle}>OBC ડેટા ગુજરાત — પરિવાર માહિતી ફોર્મ</p>
          <p className={styles.heroDesc}>ઘરના તમામ વ્યક્તિના ફોર્મ ભરવા. આંકડા અંગ્રેજીમાં ભરવા.</p>
        </div>

        <form className={styles.formContainer} onSubmit={handleSubmit(onSubmit)} noValidate>

          {/* ===== COMMON DETAILS SECTION ===== */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}>🏠</div>
              <div>
                <h2 className={styles.sectionTitle}>સામાન્ય માહિતી</h2>
                <p className={styles.sectionDesc}>ઘર અને સંપર્ક ની વિગત</p>
              </div>
            </div>

            <div className={styles.grid}>

              {/* Email */}
              <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>ઈ-મેઇલ <span className={styles.req}>*</span></label>
                <input type="email" className={`${styles.input} ${errors.email ? styles.inputError : ''}`} placeholder="example@gmail.com"
                  {...register('email', {
                    required: 'ઈ-મેઇલ અનિવાર્ય છે',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'માન્ય ઈ-મેઇલ સરનામું ભરો' }
                  })} />
                {errors.email && <span className={styles.err}>{errors.email.message}</span>}
              </div>

              {/* Mobile */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>મોબાઈલ નંબર <span className={styles.req}>*</span></label>
                <input type="tel" className={`${styles.input} ${errors.mobile ? styles.inputError : ''}`} placeholder="10 અંકનો મોબાઈલ નંબર"
                  {...register('mobile', {
                    required: 'મોબાઈલ નંબર અનિવાર્ય છે',
                    pattern: { value: /^[6-9]\d{9}$/, message: '10 અંકનો માન્ય ભારતીય મોબાઈલ નંબર ભરો' }
                  })} />
                {errors.mobile && <span className={styles.err}>{errors.mobile.message}</span>}
              </div>

              {/* Head of Family Name */}
              <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>ઘર ના મુખ્ય સભ્ય નું નામ <span className={styles.req}>*</span></label>
                <input type="text" className={`${styles.input} ${errors.headName ? styles.inputError : ''}`} placeholder="ઘર ના મુખ્ય સભ્ય નું સંપૂર્ણ નામ"
                  {...register('headName', {
                    required: 'ઘર ના મુખ્ય સભ્ય નું નામ અનિવાર્ય છે',
                    minLength: { value: 2, message: 'નામ ઓછામાં ઓછા 2 અક્ષર નું હોવું જોઈએ' },
                  })} />
                {errors.headName && <span className={styles.err}>{errors.headName.message}</span>}
              </div>

              {/* House No */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>ઘર નંબર <span className={styles.req}>*</span></label>
                <input type="text" className={`${styles.input} ${errors.houseNo ? styles.inputError : ''}`} placeholder="House No. (English numbers)"
                  {...register('houseNo', { required: 'ઘર નંબર અનિવાર્ય છે' })} />
                {errors.houseNo && <span className={styles.err}>{errors.houseNo.message}</span>}
              </div>

              {/* Society */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>સોસાયટી નું નામ <span className={styles.req}>*</span></label>
                <input type="text" className={`${styles.input} ${errors.society ? styles.inputError : ''}`} placeholder="સોસાયટી / વિસ્તાર નું નામ"
                  {...register('society', { required: 'સોસાયટી નું નામ અનિવાર્ય છે' })} />
                {errors.society && <span className={styles.err}>{errors.society.message}</span>}
              </div>

              {/* District */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>જિલ્લો <span className={styles.req}>*</span></label>
                <input type="text" className={`${styles.input} ${errors.district ? styles.inputError : ''}`} placeholder="જિલ્લો"
                  {...register('district', { required: 'જિલ્લો અનિવાર્ય છે' })} />
                {errors.district && <span className={styles.err}>{errors.district.message}</span>}
              </div>

              {/* Taluka */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>તાલુકો <span className={styles.req}>*</span></label>
                <input type="text" className={`${styles.input} ${errors.taluka ? styles.inputError : ''}`} placeholder="તાલુકો"
                  {...register('taluka', { required: 'તાલુકો અનિવાર્ય છે' })} />
                {errors.taluka && <span className={styles.err}>{errors.taluka.message}</span>}
              </div>

              {/* Village */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>ગામ / વોર્ડ નું નામ <span className={styles.req}>*</span></label>
                <input type="text" className={`${styles.input} ${errors.village ? styles.inputError : ''}`} placeholder="ગામ અથવા વોર્ડ નું નામ"
                  {...register('village', { required: 'ગામ / વોર્ડ અનિવાર્ય છે' })} />
                {errors.village && <span className={styles.err}>{errors.village.message}</span>}
              </div>

              {/* Department */}
              <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>વિભાગ <span className={styles.req}>*</span></label>
                <select className={`${styles.select} ${errors.department ? styles.inputError : ''}`}
                  {...register('department', { required: 'વિભાગ પસંદ કરો' })}>
                  <option value="">-- વિભાગ પ્સ્ંદ કરો --</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.department && <span className={styles.err}>{errors.department.message}</span>}
              </div>

            </div>
          </section>

          {/* ===== FAMILY MEMBERS SECTION ===== */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}>👨‍👩‍👧‍👦</div>
              <div>
                <h2 className={styles.sectionTitle}>પરિવારના સભ્યો</h2>
                <p className={styles.sectionDesc}>ઘરના તમામ સભ્યોની વ્યક્તિગત માહિતી</p>
              </div>
            </div>

            {fields.map((field, index) => (
              <MemberCard
                key={field.id}
                index={index}
                register={register}
                errors={errors}
                onRemove={remove}
                canRemove={fields.length > 1}
              />
            ))}

            {/* Add Member Button */}
            <button type="button" className={styles.addBtn} onClick={addMember}>
              <span className={styles.addBtnIcon}>＋</span>
              <span>બીજા સભ્ય ઉમેરો</span>
            </button>
          </section>

          {/* Status messages replaced by Toast + PageLoader (see top of return) */}

          {/* ===== SUBMIT ===== */}
          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? (
              <><span className={styles.spinner} /> ડેટા સ્ટોર થઈ રહ્યો છે...</>
            ) : (
              <><span>📤</span> ફોર્મ સબમિટ કરો</>
            )}
          </button>

        </form>

        <footer className={styles.footer}>
          <p>© 2025 અખિલ ગુજરાત ક્રિયા કમિટી OBC | ગોપનીય માહિતી</p>
        </footer>
      </main>
    </>
  );
}
