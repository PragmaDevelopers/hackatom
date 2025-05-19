import { useMemo } from 'react';

export default function ExtractCard({ extract, modal }: { extract: any; modal: any }) {
    const renderTypeLabel = (type: string): string => {
        if (['add_pass', 'remove_pass'].includes(type)) return 'Assinatura';
        if (['add_gas', 'remove_gas'].includes(type)) return 'Gás';
        if (['add_liquidy', 'remove_liquidy'].includes(type)) return 'Liquidez';
        return 'Transação';
    };

    const isPositive = (type: string) =>
        ['add_pass', 'add_gas', 'add_liquidy'].includes(type);

    return (
        <div className="w-full h-full bg-white dark:bg-dark-light rounded-md shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Extrato</h2>

            <div className="grid text-sm text-black/60 dark:text-white/60 font-medium pb-2 border-b border-gray-200 dark:border-gray-700 grid-cols-3 gap-1">
                <span>Tipo</span>
                <span className="text-center">Idade</span>
                <span className="text-end">Valor</span>
            </div>

            <div className="w-full grid divide-y divide-gray-100 dark:divide-gray-800">
                {extract?.list?.map((item: any, index: number) => {
                    const positive = isPositive(item.type);
                    const value =
                        item.type === 'add_liquidy' || item.type === 'remove_liquidy'
                            ? item.total
                            : item.transaction?.value;

                    return (
                        <div
                            key={index}
                            onClick={() => modal.extractDetail(item.id)}
                            className="cursor-pointer py-2 px-1 grid grid-cols-3 gap-1 text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-black/50 odd:bg-gray-50 dark:odd:bg-dark-light"
                        >
                            <span className="capitalize">{renderTypeLabel(item.type)}</span>
                            <span className="text-center">{formatTimeDifference(item.createdAt)}</span>
                            <div
                                className={`flex justify-end font-medium whitespace-nowrap ${positive ? 'text-green-500' : 'text-red-500'
                                    }`}
                            >
                                <span className="mr-1">{positive ? '+' : '-'}</span>
                                <span>
                                    {Number(value || 0).toFixed(8)}{' '}
                                    <b className="text-xs text-grey ml-1">{item.token?.symbol}</b>
                                </span>
                            </div>
                        </div>
                    );
                })}
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