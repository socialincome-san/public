import React from 'react';

export const SoDataList = ({data}) => {
    return (
        <datalist id="data-from-firestore">
            {data.map((item, i) => (
                <option key={i} value={item.value}>{item.label}</option>
            ))}
        </datalist>
    )
}


