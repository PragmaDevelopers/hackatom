import { TabLayoutContextValue, useTabLayoutContext } from "@/app/contexts/TabLayoutContext";
import { ReactNode, useEffect, useState } from "react";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

/**
 * Helper function to handle circular references in JSON stringification
 */
function getCircularReplacer(): any {
    const seen = new WeakSet();
    return (_: any, value: any) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return "[Circular Reference]";
            }
            seen.add(value);
        }
        return value;
    };
}

/**
 * JSON display component with syntax highlighting
 */
function JsonDisplay({ data, className }: { data: any, className?: string }): ReactNode {
    const jsonString = JSON.stringify(data, getCircularReplacer(), 4);

    return (
        <SyntaxHighlighter
            language="json"
            style={atomDark}
            wrapLines={true}
            wrapLongLines={true}
            className={className}
        >
            {jsonString}
        </SyntaxHighlighter>
    );
}

/**
 * Helper function to validate string existence
 */
function isValidString(
    value: unknown,
    options: {
        allowEmpty?: boolean;
        allowWhitespace?: boolean;
        pattern?: RegExp;
    } = {}
): value is string {
    const {
        allowEmpty = false,
        allowWhitespace = false,
        pattern = undefined
    } = options;

    if (typeof value !== 'string') {
        return false;
    }

    if (!allowEmpty && value.length === 0) {
        return false;
    }

    if (!allowWhitespace && value.trim().length === 0) {
        return false;
    }

    if (pattern && !pattern.test(value)) {
        return false;
    }

    return true;
}

/**
 * Tab layout component for displaying content and state
 */
export default function TabLayout({ children }: { children: ReactNode }): ReactNode {
    const { tabLayoutContextState, setTabLayoutContextState } = useTabLayoutContext();
    const { error, response, localState, type, shareState } = tabLayoutContextState;
    const [showAlert, setShowAlert] = useState<boolean>(false);

    useEffect(() => {
        if (isValidString(response) || isValidString(error)) {
            setShowAlert(true);
        }
    }, [response, error]);

    const handleClose: React.Dispatch<React.SetStateAction<boolean>> = (value: React.SetStateAction<boolean>) => {
        if (isValidString(response)) {
            setTabLayoutContextState((prev: TabLayoutContextValue) => {
                return {
                    ...prev,
                    response: "",
                }
            })
        }

        if (isValidString(error)) {
            setTabLayoutContextState((prev: TabLayoutContextValue) => {
                return {
                    ...prev,
                    error: null,
                }
            })
        }

        setShowAlert(value);
    }

    return (
        <div className="mx-auto flex flex-col h-full">
            <AlertDialog open={showAlert} onOpenChange={handleClose}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{response ? "Result" : "Error"}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {response ? response : error}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Close</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className='flex flex-row space-x-4 h-full'>
                <div className='w-1/2 bg-white p-2 rounded-md shadow-md h-fit'>
                    {children}
                </div>
                <div className='w-1/2 px-2 h-full'>
                    <Tabs defaultValue="sharedState" className="w-full h-full">
                        <TabsList className='w-full'>
                            <TabsTrigger value="sharedState">Shared State</TabsTrigger>
                            <TabsTrigger value="localState">Local State</TabsTrigger>
                        </TabsList>
                        <TabsContent value="sharedState" className='h-full rounded-md'>
                            <div className='overflow-auto h-full rounded-md'>
                                {Object.keys(shareState).length > 0 ? (
                                    <JsonDisplay data={shareState} className="overflow-auto rounded-lg h-[80%]" />
                                ) : (
                                    <h1 className='text-xl font-bold h-full w-full flex justify-center items-center'>No shared state data available</h1>
                                )}
                            </div>
                        </TabsContent>
                        <TabsContent value="localState" className='h-full rounded-md'>
                            <div className='overflow-auto h-full rounded-md'>
                                {localState[type] && Object.keys(localState[type]).length > 0 ? (
                                    <JsonDisplay data={localState[type]} className="overflow-auto rounded-lg h-[80%]" />
                                ) : (
                                    <h1 className='text-xl font-bold h-full w-full flex justify-center items-center'>No local state data available</h1>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}