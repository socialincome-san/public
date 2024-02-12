//import { FirestoreAdmin } from '../firebase/admin/FirestoreAdmin';

import mailchimp from '@mailchimp/mailchimp_marketing';

export type MailchimpSubscriptionData = {
    firstname?: string;
    lastname?: string;
    gender?: string;
    email: string;
    country?: string;
    language: string;
    status: "subscribed" | "unsubscribed";
};

export class MailchimpEventHandler {
	constructor(apiKey: string, server: string) {
        mailchimp.setConfig({
            apiKey: apiKey,
            server: server
        })
	}

    checkSubscription = async (email: string, listId: string) => {
        try {
            const response = await mailchimp.lists.getListMember(listId, this.md5(email.toLowerCase()));
            if (response?.status === 'subscribed') {
                return 'subscribed';
            } else {
                return 'unsubscribed';
            }
        } catch (error) {
            return 'unsubscribed';
        }
	};

    updateUser = async (data: MailchimpSubscriptionData, listId: string) => {
        try {
            const response = await mailchimp.lists.batchListMembers(listId, {
                members: [
                    {
                        email_address: data.email,
                        email_type: "text",
                        status: data.status,
                        merge_fields: {
                            "FNAME": data.firstname ?? "",
	                        "LNAME": data.lastname ?? "",
                            "COUNTRY": data.country ?? "",
                            "LANGUAGE": data.language ?? "",
                            "GENDER": data.gender ?? ""
                        }
                    }
                ],
                update_existing: true
            });
            return response;
        } catch (error) {
            return null;
        }
    }

    

    // Helper function to calculate the MD5 hash
    md5 = (str: string):string => {
        const crypto = require('crypto');
        return crypto.createHash('md5').update(str).digest('hex');
    }

	
}
