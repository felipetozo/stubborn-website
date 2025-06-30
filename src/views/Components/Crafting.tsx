'use client';

import styles from './Crafting.module.css';
import React, { useEffect } from 'react';

function Crafting() {

    return (
        <div className={styles.CraftingSection}>
            <div className={styles.CraftingWrapper}>
                <h1>Crafting long <span className="blueText">-</span> lasting experiences</h1>
            </div>
        </div>
    );
}

export default Crafting;