import { useState, useEffect } from 'react';

// This hook will manage the state of the comparison list across your entire app
export const useCompare = () => {
    // Initialize state from localStorage, or an empty array if nothing is saved
    const [compareIds, setCompareIds] = useState(() => {
        try {
            const saved = localStorage.getItem('compareList');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error("Failed to parse compare list from localStorage", error);
            return [];
        }
    });

    // This effect runs whenever 'compareIds' changes, saving it back to localStorage
    useEffect(() => {
        localStorage.setItem('compareList', JSON.stringify(compareIds));
    }, [compareIds]);

    // Function to add or remove an item ID from the list
    const toggleCompare = (itemId) => {
        setCompareIds((prevList) => {
            if (prevList.includes(itemId)) {
                return prevList.filter(id => id !== itemId); // Remove item
            } else {
                if (prevList.length >= 4) {
                    alert("You can only compare up to 4 items."); // Optional limit
                    return prevList;
                }
                return [...prevList, itemId]; // Add item
            }
        });
    };

    // Function to clear the entire list
    const clearCompare = () => {
        setCompareIds([]);
    };

    return { compareIds, toggleCompare, clearCompare };
};