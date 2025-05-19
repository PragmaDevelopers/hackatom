import React from 'react';

export default function ProfitCircle({ profits, token, listStrategies = [], system }: any) {
    const showCircles = listStrategies.length > 0;

    return (
        <div className="w-max relative flex flex-col items-center justify-center">
            {/* Outer SVG Circle */}
            <svg viewBox="0 0 454 454" className="hidden lg:block absolute size-[334px] lg:size-[350px]">
                <circle
                    opacity="0.8"
                    cx="227"
                    cy="227"
                    r="209"
                    className={`square1 ${showCircles ? 'active' : ''}`}
                    strokeWidth="36"
                    strokeDasharray="3 8"
                />
            </svg>

            {/* Inner SVG Circles */}
            <svg viewBox="0 0 454 454" className="w-[334px] size-[334px] lg:size-[350px]">
                <circle
                    opacity="0.8"
                    cx="227"
                    cy="227"
                    r="209"
                    stroke="url(#paint0_radial_535_526)"
                    strokeWidth="36"
                    strokeDasharray="3 8"
                />
                <circle cx="227" cy="227" r="157" className={`square2 ${showCircles ? 'active' : ''}`} strokeWidth="8" />
                <circle cx="227" cy="227" r="172.5" stroke="black" strokeOpacity="0.1" />
            </svg>

            {/* Center label */}
            <div className="flex flex-col items-center justify-center absolute left-0 right-0 my-auto text-black dark:text-white">
                <p className="text-3lg font-semibold uppercase">PNL</p>
                <Counter value={profits?.total?.value} maxDigits={4} className="text-xl lg:text-2xl font-bold" />
                <span className="text-lg font-medium -mt-2">{token?.symbol || '--'}</span>
            </div>

            {/* Small summary circles */}
            <div className="hidden lg:flex flex-col items-center absolute -right-3 text-dark dark:text-white">
                <div className="flex items-center gap-1">
                    <CircleStat label="Dia" value={profits?.today?.value} visible={showCircles} size={76} />
                    <CircleStat label="Semana" value={profits?.week?.value} visible={showCircles} size={57} />
                </div>
                <div className="ml-5">
                    <CircleStat label="Mês" value={profits?.month?.value} visible={showCircles} size={64} />
                </div>
            </div>

            {/* Bottom connector line and stats */}
            <div className="hidden lg:block lg:absolute -bottom-14 w-[calc(100%+140px)] left-1/2 -translate-x-1/2 text-black dark:text-white">
                <img
                    alt="Line"
                    loading="lazy"
                    width={1943}
                    height={845}
                    src={`assets/images/line${system?.theme === 'dark' ? '-dark' : ''}.png`}
                    className={`transition-all duration-1000 px-4 ${showCircles ? 'opacity-100' : 'opacity-0'}`}
                />

                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className={`flex flex-col items-center absolute transition-all duration-1000 ${i === 0
                            ? '-left-10 -top-20'
                            : i === 1
                                ? '-right-10 -top-20'
                                : 'left-0 right-0 -bottom-9'
                            } ${showCircles ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <p>{listStrategies[i]?.name || '--'}</p>
                        <span className="flex items-center font-medium">
                            💰 <Counter value={listStrategies[i]?.liquidity?.current} maxDigits={8} minDigits={6} />
                        </span>
                        <span className="flex items-center font-medium">
                            📈 <Counter value={listStrategies[i]?.profits?.total} maxDigits={4} />
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Counter({ value = 0, maxDigits = 4, minDigits = 0, className = '' }: any) {
    return (
        <span className={className}>
            {Number(value).toLocaleString('en-US', {
                minimumFractionDigits: minDigits,
                maximumFractionDigits: maxDigits,
            })}
        </span>
    );
}

function CircleStat({ label, value, visible, size }: { label: string; value: number; visible: boolean; size: number }) {
    return (
        <div
            className={`transition-all duration-1000 flex flex-col items-center justify-center rounded-full border-2 border-[#3D3D3D] dark:border-white bg-white dark:bg-dark-light/20 backdrop-blur-md ${visible ? 'opacity-100' : 'opacity-0'
                }`}
            style={{ width: size, height: size }}
        >
            <p className="text-xs font-medium">{label}</p>
            <Counter value={value} maxDigits={4} className="text-sm font-bold" />
        </div>
    );
}