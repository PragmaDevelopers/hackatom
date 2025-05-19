import React from 'react';

export default function LastOrders({ orders, modal }: { orders: any; modal: any }) {
    return (
        <div className="w-full h-full bg-white dark:bg-dark-light rounded-md shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Últimas ordens</h2>

            <div className="grid text-sm text-black/60 dark:text-white/60 font-medium pb-2 border-b border-gray-200 dark:border-gray-700 grid-cols-6 gap-1">
                <span>Estratégia</span>
                <span>Conta</span>
                <span className="text-center">Idade</span>
                <span className="text-end">Lucro</span>
                <span className="text-end">Gás</span>
                <span className="text-end">Pass</span>
            </div>

            <div className="w-full grid">
                {orders?.list?.map((item: any, index: number) => (
                    <div
                        key={index}
                        onClick={() => modal.extractDetail(item.id)}
                        className="cursor-pointer py-2 px-1 grid grid-cols-6 gap-1 text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-black/50 odd:bg-gray-50 dark:odd:bg-dark-light"
                    >
                        <span className="capitalize">{item.strategy.name}</span>
                        <span>{item.transaction.account.name}</span>
                        <span className="text-center">{formatTimeDifference(item.createdAt)}</span>
                        <div
                            className={`flex justify-end font-medium group whitespace-nowrap ${item.transaction.value > 0 ? 'text-green-500 positive' : 'text-red-500'
                                }`}
                        >
                            <span className="mr-1">{item.transaction.value > 0 ? '+' : ''}</span>
                            <span>
                                {Number(item.transaction.value || 0).toFixed(8)}{' '}
                                <b className="text-xs text-grey ml-1">{item.token.symbol}</b>
                            </span>
                        </div>
                        <span className="text-end">
                            -{Number(item.transaction.gas || 0).toFixed(8)}{' '}
                            <b className="text-xs text-grey ml-1">POL</b>
                        </span>
                        <span className="text-end">
                            -{Number(item.transaction.pass || 0).toFixed(8)}{' '}
                            <b className="text-xs text-grey ml-1">WEbdEX</b>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function formatTimeDifference(dateString: string): string {
    const now = new Date();
    const created = new Date(dateString);
    const diff = Math.floor((now.getTime() - created.getTime()) / 1000);
    if (diff < 60) return `${diff}s atrás`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m atrás`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
    return `${Math.floor(diff / 86400)}d atrás`;
}