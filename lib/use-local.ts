import { useState } from 'react';

/**
 * A custom hook to manage state with localStorage.
 * @param key The key to store the value in localStorage.
 * @param initialValue The initial value for the state.
 */
export function useLocalState<T>(key: string, initialValue: T): [T, (value: T| ((prev: T) => T)) => void] {
    const [state, setState] = useState<T>(() => {
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : initialValue;
    });

    const setLocalState = (value: T | ((prev: T) => T)) => {
        const newValue = typeof value === 'function' ? (value as (prev: T) => T)(state) : value;
        setState(newValue);
        localStorage.setItem(key, JSON.stringify(newValue));
    };

    return [state, setLocalState];
}