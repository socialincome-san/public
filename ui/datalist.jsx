import React from 'react';

const DataList = ({data}) => {
    return (
        <datalist id="data-from-firestore">
            {data.map((item, i) => (
                <option key={i} value={item.value}>{item.label}</option>
            ))}
        </datalist>
    )
}
export default DataList;

