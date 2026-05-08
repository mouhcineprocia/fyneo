import React from 'react';
import { colors } from '../../utils/colors';
import styles from './Loader.module.css';

const Loader: React.FC = () => {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: colors.background.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div className={styles.wrapper}>
        <div
          className={styles.circle}
          style={{ backgroundColor: colors.text.primary }}
        />
        <div
          className={styles.circle}
          style={{ backgroundColor: colors.text.primary }}
        />
        <div
          className={styles.circle}
          style={{ backgroundColor: colors.text.primary }}
        />
        <div
          className={styles.shadow}
          style={{ backgroundColor: `${colors.text.primary}30` }}
        />
        <div
          className={styles.shadow}
          style={{ backgroundColor: `${colors.text.primary}30` }}
        />
        <div
          className={styles.shadow}
          style={{ backgroundColor: `${colors.text.primary}30` }}
        />
      </div>
    </div>
  );
};

export default Loader;