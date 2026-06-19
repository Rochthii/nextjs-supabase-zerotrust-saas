export interface Bank {
    id: number;
    name: string;
    code: string;
    bin: string;
    isTransfer: number;
    shortName: string;
    logo: string;
    transferSupported: number;
    lookupSupported: number;
}

export interface BankResponse {
    code: string;
    desc: string;
    data: Bank[];
}

export async function getBanks(): Promise<Bank[]> {
    try {
        const response = await fetch('https://api.vietqr.io/v2/banks');
        if (!response.ok) {
            throw new Error('Failed to fetch banks');
        }
        const result: BankResponse = await response.json();
        if (result.code !== '00') {
            throw new Error(result.desc || 'API Error');
        }
        return result.data;
    } catch (error) {
        console.error('Error fetching banks:', error);
        return [];
    }
}
