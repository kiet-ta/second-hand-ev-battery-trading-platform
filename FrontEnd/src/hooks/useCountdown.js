import { useEffect, useState } from 'react';

const useCountdown = (endTimeStr) => {
    const calculateTimeRemaining = useCallback(() => {
        // Logic relies only on endTimeStr, ignoring external status
        if (!endTimeStr) return { time: "N/A", isFinished: true };

        const now = new Date().getTime();
        const endTime = new Date(endTimeStr).getTime();
        const distance = endTime - now;

        if (distance <= 0) { 
            return { time: "00h 00m 00s", isFinished: true };
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const pad = (num) => String(num).padStart(2, '0');

        if (days > 0) {
            return { time: `${days}d ${pad(hours)}h ${pad(minutes)}m`, isFinished: false };
        }
        return { time: `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`, isFinished: false };
    }, [endTimeStr]);

    const [countdown, setCountdown] = useState(calculateTimeRemaining);

    useEffect(() => {
        if (!endTimeStr) return;
        
        const initialCountdown = calculateTimeRemaining();
        setCountdown(initialCountdown);

        if (initialCountdown.isFinished) return;

        const intervalId = setInterval(() => {
            const newCountdown = calculateTimeRemaining(); 
            setCountdown(newCountdown);

            // This ensures the timer stops instantly when distance <= 0
            if (newCountdown.isFinished) { 
                clearInterval(intervalId); 
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, [calculateTimeRemaining, endTimeStr]); 

    return countdown;
};
export { useCountdown };