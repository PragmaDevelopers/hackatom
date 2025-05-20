import { ReactNode, useEffect, useState } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { CheckIcon, CopyIcon } from "lucide-react";

/**
 * Copy button component with animation
 */
export default function CopyButton({
    value,
    className,
    variant = "outline",
    size = "sm",
    onCopy,
    ...props
}: any): ReactNode {
    const [hasCopied, setHasCopied] = useState(false);

    useEffect(() => {
        if (hasCopied) {
            const timeout = setTimeout(() => {
                setHasCopied(false)
            }, 2000)

            return () => clearTimeout(timeout)
        }
    }, [hasCopied]);

    const handleCopy = async () => {
        if (!value) return;

        try {
            await navigator.clipboard.writeText(value);
            setHasCopied(true);
            onCopy?.(value);
        } catch (error) {
            console.error('Failed to copy', error);
        }
    }

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleCopy}
            className={cn(
                "relative group",
                hasCopied && "text-green-500 border-green-500 hover:bg-green-50 dark:hover:bg-green-950",
                className
            )}
            {...props}
        >
            <span className={cn(
                "transition-opacity",
                hasCopied ? "opacity-0" : "opacity-100"
            )}>
                <CopyIcon className="h-4 w-4" />
            </span>

            <span className={cn(
                "absolute inset-0 flex items-center justify-center transition-opacity",
                hasCopied ? "opacity-100" : "opacity-0"
            )}>
                <CheckIcon className="h-4 w-4" />
            </span>

            <span className="sr-only">
                {hasCopied ? "Copied" : "Copy"}
            </span>
        </Button>
    )
}