"use client"

import { useEffect, useRef, useState } from "react";
import { getProgram, IDLPrograms } from "../utils/anchorConfig";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ProfileMenu } from "./ProfileMenu";

export const Header = () => {
    const { connected, publicKey, wallet } = useWallet();
    const WalletMultiButtonDynamic = dynamic(
        () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
        { ssr: false }
    );
    console.log(connected)
    console.log(publicKey)
    return (
        <header className="flex justify-between">
            {
                !connected && <div>
                    <WalletMultiButtonDynamic />
                </div>
            }
            <div className="flex items-center">
                <Image width={200} height={100} className="me-10" src={"/logo-webdex-color-dark.png"} alt="Logo Webdex Dark Mode" />
                <Link href="/swap" className="text-white me-5">Swap Book</Link>
                <Link href="/automation" className="text-white me-5">Automação</Link>
                <Link href="/broker" className="text-white me-5">Broker</Link>
                <Link href="/bots/list" className="text-white me-5">Bots</Link>
            </div>
            <div>
                <ProfileMenu publickey={publicKey} />
            </div>
        </header>
    );
};