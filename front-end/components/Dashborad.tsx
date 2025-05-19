import { useState } from 'react';
import AccountCard from './Account';

export default function Dashboard() {
    const [active, setActive] = useState<boolean[]>([]);

    // mock data
    const listStrategies = [
        { symbol: 'CSE', address: '...', liquidity: {}, profits: {}, used: {}, totalActive: 5, totalPaused: 2 },
        { symbol: 'MDT', address: '...', liquidity: {}, profits: {}, used: {}, totalActive: 3, totalPaused: 4 },
        { symbol: 'BLD', address: '...', liquidity: {}, profits: {}, used: {}, totalActive: 6, totalPaused: 1 },
    ];

    const token = { symbol: 'SOL' }; // mock token

    return (
        <div className="flex">
            {/* LEFT */}
            <div className="w-[350px] flex flex-col gap-5">
                <Extract />
                <Swapbook />
            </div>

            {/* CENTER */}
            <div className="w-full max-w-[calc(100%-640px)] relative flex flex-col items-center">
                <GraphStrategies />
                <LastOrders />
                <div className="w-full max-w-[800px] grid grid-cols-3 gap-2 fixed -bottom-[279px] z-30">
                    {listStrategies.map((item, index) => {
                        const isActive = active[index];
                        return (
                            <div key={index} className={`w-full flex flex-col items-center transition-all ${isActive ? '-translate-y-[279px]' : 'translate-y-0'}`}>
                                <div className="w-full relative flex justify-center">
                                    <div className={`absolute -top-2.5 ${isActive ? 'rotate-180' : 'rotate-0'}`}>
                                        {/* Add arrow SVG here */}
                                    </div>
                                    <div
                                        className="w-full pt-8 px-5 flex items-center gap-3 z-10 absolute cursor-pointer"
                                        onClick={() => setActive(prev => prev.map((a, i) => (i === index ? !a : a)))}
                                    >
                                        {/* Add icon based on item.symbol */}
                                        <div className="grid text-black">
                                            <span className="text-base font-medium">Estratégia {index + 1}</span>
                                            <span className="text-md font-semibold leading-none">{item.symbol}</span>
                                        </div>
                                    </div>
                                    {/* Add strategy background SVG based on item.symbol */}
                                </div>

                                <div
                                    className={`w-full rounded-t-lg p-4 flex flex-col gap-3 z-10 -mt-3 transition-all ${item.symbol === 'CSE'
                                        ? 'bg-[#d0d7d9]'
                                        : item.symbol === 'MDT'
                                            ? 'bg-[#0ed7ca]'
                                            : 'bg-[#e4967e]'
                                        }`}
                                >
                                    {/* Content: balances, profits, gas/pass, status, actions */}
                                    <div className="leading-tight grid gap-1">
                                        <span className="text-black text-base font-medium">Balance</span>
                                        <span className="text-black text-2md font-medium line-text">
                                            {(item?.liquidity?.current || 0.0).toFixed(8)} {token?.symbol || '--'}
                                        </span>
                                    </div>

                                    {/* ...profits and other details here... */}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* RIGHT */}
            <div className="w-[350px] flex flex-col gap-5">
                <AccountCard />
                <Resume />
            </div>
        </div>
    );
}

// Stub Components (You should implement them or import real ones)
function Extract() {
    return <div className="min-h-[450px] bg-gray-200 rounded">Extract</div>;
}
function Swapbook() {
    return <div className="min-h-[280px] bg-gray-200 rounded">Swapbook</div>;
}
function GraphStrategies() {
    return <div className="h-[485px] pt-3 bg-gray-100 w-full">GraphStrategies</div>;
}
function LastOrders() {
    return <div className="px-8 h-[calc(100%-485px)] bg-gray-50 w-full">LastOrders</div>;
}
function Resume() {
    return <div className="min-h-fit bg-gray-200 rounded">Resume</div>;
}