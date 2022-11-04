import React, { useState } from 'react';

export default function Counter({ children, count: initialCount }) {
    const [count, setCount] = useState(initialCount);
    const add = () => setCount((i) => i + 1);
    const subtract = () => setCount((i) => i - 1);

    return (
        <>
            <div>
                <button onClick={subtract}>-</button>
                <pre>{count}</pre>
                <button onClick={add}>+</button>
            </div>
            <div>{children}</div>
        </>
    );
}
