export interface MakeBlueprintData {
    selectedText: string;
    userFields: Record<string, string>; // Dynamic user-provided fields
    webhookUrl?: string;
}

export interface MakeModule {
    id: number;
    module: string;
    version: number;
    parameters?: Record<string, any>;
    mapper?: Record<string, any>;
    metadata?: Record<string, any>;
}

export interface MakeBlueprint {
    name: string;
    flow: MakeModule[];
    metadata: {
        designer: {
            orphans: any[];
        };
        version: number;
    };
}

/**
 * Generates a Make.com compatible blueprint JSON
 * User can import this directly into Make.com
 */
export function generateMakeBlueprint(data: MakeBlueprintData): MakeBlueprint {
    const { selectedText, userFields, webhookUrl } = data;

    // Module 1: Webhook (receives the data)
    const webhookModule: MakeModule = {
        id: 1,
        module: "gateway:CustomWebHook",
        version: 1,
        parameters: {
            hook: webhookUrl || "YOUR_WEBHOOK_URL",
            maxResults: 1
        },
        mapper: {},
        metadata: {
            designer: {
                x: 0,
                y: 0
            },
            restore: {},
            expect: [
                { name: "selectedText", type: "text", label: "Selected Text" },
                ...Object.keys(userFields).map((key, index) => ({
                    name: key,
                    type: "text",
                    label: key.charAt(0).toUpperCase() + key.slice(1)
                }))
            ]
        }
    };

    // Module 2: HTTP Request (example: send to another service)
    const httpModule: MakeModule = {
        id: 2,
        module: "http:ActionSendData",
        version: 3,
        parameters: {},
        mapper: {
            url: "https://your-api-endpoint.com/process",
            method: "post",
            headers: [
                {
                    name: "Content-Type",
                    value: "application/json"
                }
            ],
            qs: [],
            bodyType: "raw",
            parseResponse: true,
            body: JSON.stringify({
                text: "{{1.selectedText}}",
                ...Object.keys(userFields).reduce((acc, key, index) => {
                    acc[key] = `{{1.${key}}}`;
                    return acc;
                }, {} as Record<string, string>)
            })
        },
        metadata: {
            designer: {
                x: 300,
                y: 0
            }
        }
    };

    // Module 3: Gmail (optional example)
    const gmailModule: MakeModule = {
        id: 3,
        module: "google-email:ActionSendEmail",
        version: 3,
        parameters: {
            account: "YOUR_GMAIL_CONNECTION"
        },
        mapper: {
            to: userFields.email || "{{1.email}}",
            subject: "Neural Pad Export",
            text: `Selected Text:\n{{1.selectedText}}\n\n${Object.keys(userFields).map(key => 
                `${key}: {{1.${key}}}`
            ).join('\n')}`
        },
        metadata: {
            designer: {
                x: 600,
                y: 0
            }
        }
    };

    return {
        name: "Neural Pad - Custom Export",
        flow: [webhookModule, httpModule, gmailModule],
        metadata: {
            designer: {
                orphans: []
            },
            version: 1
        }
    };
}

/**
 * Download blueprint as JSON file
 */
export function downloadBlueprint(blueprint: MakeBlueprint, filename: string = "neural-pad-blueprint.json") {
    const dataStr = JSON.stringify(blueprint, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Copy blueprint to clipboard
 */
export async function copyBlueprintToClipboard(blueprint: MakeBlueprint): Promise<void> {
    const dataStr = JSON.stringify(blueprint, null, 2);
    await navigator.clipboard.writeText(dataStr);
}
