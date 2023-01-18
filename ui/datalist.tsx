import React, { FC } from 'react';

interface DataListProps {
    data: { value: string, label: string }[]
}
//explicit parameter
const DataList: FC<DataListProps> = ({data}: DataListProps) => {
    return (
        <datalist id="data-from-firestore">
            {data.map((item, i) => (
                <option key={i} value={item.value}>{item.label}</option>
            ))}
        </datalist>
    )
}

export default DataList;
