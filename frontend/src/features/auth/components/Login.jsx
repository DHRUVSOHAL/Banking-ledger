import React, { useState, useEffect } from 'react';

export default function Login() {
    const headingText = "You can Login to your account here";
    const [displayedHeading, setDisplayedHeading] = useState("");
    const [isAnimationDone, setIsAnimationDone] = useState(false);

    useEffect(() => {
        setDisplayedHeading("");
        setIsAnimationDone(false);
        let index = 0;
        let timer;

        timer = setInterval(() => {
            if (index < headingText.length) {
                index++;
                setDisplayedHeading(headingText.slice(0, index));
            } else {
                clearInterval(timer);
                setIsAnimationDone(true);
            }
        }, 20);

        return () => clearInterval(timer);
    }, []);

    return (
        /* 1. Fixed parent centering layout using modern flexbox utilities */
        <div className="max-w-md mx-auto min-h-screen flex flex-col justify-center px-4 select-text">
            <h1 className="text-4xl font-bold text-zinc-900 mb-6 tracking-tight min-h-[48px] flex items-center">
                {displayedHeading}
                {displayedHeading.length < headingText.length && (
                    <span className="animate-pulse bg-zinc-900 ml-1 inline-block w-0.5 h-7"></span>
                )}
            </h1>

            {isAnimationDone && (
                /* 2. Added a standard fade-in transition duration */
                <div className="animate-fade-in transition-all duration-500"> 
                    <form className='flex flex-col gap-4'>
                    
                        
                        <div className="flex flex-col gap-1">
                            <label className='text-zinc-800 font-medium text-sm'>Email</label>
                            <input type="email" className="border border-zinc-300 rounded-md p-2 w-full h-10 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className='text-zinc-800 font-medium text-sm'>Password</label>
                            <input type="password" className="border border-zinc-300 rounded-md p-2 w-full h-10 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>

                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium p-2.5 rounded-md transition-colors mt-2">
                            Login
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}