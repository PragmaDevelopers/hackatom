import { useState } from 'react';

type TokenInfo = {
    symbol: string;
};

type Liquidity = {
    current: number;
    added: number;
    removed: number;
};

type Strategy = {
    symbol: 'CSE' | 'MDT' | 'BLD';
    name: string;
    totalActive: number;
    subAccounts: any[];
};

type Info = {
    token?: TokenInfo;
    liquidity?: Liquidity;
    strategies?: Strategy[];
};

type WalletService = {
    rateOperation: number;
};

type Subaccounts = {
    accountsSelected: any[];
    list?: any[];
};

type AccountCardProps = {
    info: Info;
    gas: number;
    pass: number;
    walletService: WalletService;
    subaccounts: Subaccounts;
    modal: {
        viewAccounts: () => void;
    };
};

export default function AccountCard({ info, gas = 0, pass = 0, walletService, subaccounts, modal }: AccountCardProps) {
    return (
        <div className="w-full h-full bg-white dark:bg-dark-light rounded-md shadow p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Conta</h2>
                <button className="text-sm text-blue-500">Detalhes</button>
            </div>

            <div className="grid mb-4">
                <span className="text-grey text-sm font-medium">Total em Liquidez</span>
                <Counter value={info?.liquidity?.current} suffix={info?.token?.symbol} maxDigits={8} minDigits={6} className="text-lg font-medium text-black dark:text-white" />

                <div className="w-full grid grid-cols-2 divide-x divide-grey/50 my-3">
                    <div className="w-full px-2 flex flex-col items-center">
                        <ArrowUpIcon className="size-4 text-green-500" />
                        <Counter value={info?.liquidity?.added} suffix={info?.token?.symbol} maxDigits={4} minDigits={3} className="text-center text-dark dark:text-white font-medium" />
                        <span className="text-xs text-grey">Adicionado</span>
                    </div>
                    <div className="w-full px-2 flex flex-col items-center">
                        <ArrowDownIcon className="size-4 text-red-500" />
                        <Counter value={info?.liquidity?.removed} suffix={info?.token?.symbol} maxDigits={4} minDigits={3} className="text-center text-dark dark:text-white font-medium" />
                        <span className="text-xs text-grey">Removido</span>
                    </div>
                </div>
            </div>

            <div className="w-full grid gap-1.5 mb-4">
                <button onClick={modal.viewAccounts} className="w-full bg-white hover:bg-gray-100 px-2 py-1.5 rounded flex items-center gap-1 text-base text-dark">
                    Visualizando:
                    <div className="flex gap-1">
                        <Counter value={subaccounts.accountsSelected.length} maxDigits={0} />/
                        <Counter value={subaccounts.list?.length || 0} maxDigits={0} />
                    </div>
                    <PencilIcon className="size-3 ml-auto" />
                </button>
            </div>

            {/* Pass Balance */}
            <BalanceItem label="Saldo Passe" value={pass} suffix="WEbdEX" />
            {/* Gas Balance */}
            <BalanceItem label="Saldo gás" value={gas} suffix="POL" />
            {/* Gas Tracker */}
            <BalanceItem label="Gas tracker" value={walletService.rateOperation || 0} suffix="POL" />

            <div className="grid gap-2 mt-4">
                <span className="text-sm font-medium text-dark dark:text-white">Estratégias</span>
                {info?.strategies?.map((item, index) => (
                    <div key={index} className="w-full flex items-center gap-2">
                        <div className="border border-grey/50 p-1.5 rounded-sm">
                            {item.symbol === 'CSE' && <ConservativeIcon />}
                            {item.symbol === 'MDT' && <ModerateIcon />}
                            {item.symbol === 'BLD' && <BoldIcon />}
                        </div>
                        <div className="grid">
                            <span className="text-sm text-grey">Estratégia {index + 1}</span>
                            <span className="text-xs font-medium text-dark dark:text-white">{item.name}</span>
                        </div>
                        <span className="text-base font-medium ml-auto text-dark dark:text-white">
                            <Counter value={item.totalActive} maxDigits={0} />/<Counter value={item.subAccounts.length} maxDigits={0} />
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

type CounterProps = {
    value: number;
    suffix?: string;
    maxDigits?: number;
    minDigits?: number;
    className?: string;
};

function Counter({ value, suffix, maxDigits, minDigits, className }: CounterProps) {
    const formatted = Number(value || 0).toLocaleString('en-US', {
        minimumFractionDigits: minDigits,
        maximumFractionDigits: maxDigits,
    });
    return <span className={className}>{formatted} {suffix}</span>;
}

function BalanceItem({ label, value, suffix }: any) {
    return (
        <div className="w-full flex items-center gap-2 mb-2">
            <svg className="size-8" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="30" height="30" rx="8" className="fill-dark dark:fill-white dark:opacity-10"></rect>
                <path d="M8.33 10.33c0-.35.14-.69.39-.94.25-.25.59-.39.94-.39h4v12h-4a1.33 1.33 0 01-1.33-1.33V10.33Zm8 0h4a1.33 1.33 0 011.33 1.33v3.33h-5.33V10.33Zm0 7h5.33v3.33a1.33 1.33 0 01-1.33 1.33h-4v-4.66Z" stroke="white" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="grid">
                <span className="text-xs text-grey">{label}</span>
                <Counter value={value} suffix={suffix} maxDigits={8} minDigits={6} className="text-dark dark:text-white font-medium" />
            </div>
        </div>
    );
}

function ArrowUpIcon(props: any) {
    return <i className="lucide lucide-circle-arrow-up" {...props}></i>;
}

function ArrowDownIcon(props: any) {
    return <i className="lucide lucide-circle-arrow-down" {...props}></i>;
}

function PencilIcon(props: any) {
    return <i className="lucide lucide-pencil" {...props}></i>;
}

function ConservativeIcon() {
    return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
}
function ModerateIcon() {
    return <div className="w-4 h-4 bg-teal-400 rounded-full" />;
}
function BoldIcon() {
    return <div className="w-4 h-4 bg-red-400 rounded-full" />;
}