import styles from './PageLoader.module.css';

export default function PageLoader({ message = 'ડેટા સ્ટોર થઈ રહ્યો છે...' }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.box}>
        {/* Spinning rings */}
        <div className={styles.rings}>
          <div className={styles.ring1} />
          <div className={styles.ring2} />
          <div className={styles.ring3} />
          <div className={styles.dot} />
        </div>
        <p className={styles.message}>{message}</p>
        <p className={styles.sub}>કૃપા કરી રાહ જુઓ...</p>
      </div>
    </div>
  );
}
