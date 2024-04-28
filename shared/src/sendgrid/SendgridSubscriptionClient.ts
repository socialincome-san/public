import { Client } from '@sendgrid/client';
import { ClientRequest } from '@sendgrid/client/src/request';
import { CountryCode } from '../types/country';
import { SendgridContactType } from '@socialincome/shared/src/sendgrid/SendgridContactType'

export type NewsletterSubscriptionData = {
	email: string;
	status: "subscribed" | "unsubscribed";
	language?: 'de' | 'en';
	firstname?: string;
	lastname?: string;
	country?: CountryCode;
	source?: 'contributor' | 'subscriber';
};

export type SendgridSubscriptionClientProps = {
    apiKey: string;
    listId: string;
    suppressionListId: string;
}


export class SendgridSubscriptionClient extends Client {
    listId: string;
    suppressionListId: string;
    
	constructor(sendgridClientProps: SendgridSubscriptionClientProps) {
        super();
		this.setApiKey(sendgridClientProps.apiKey)
        this.listId = sendgridClientProps.listId;
        this.suppressionListId = sendgridClientProps.suppressionListId;
	}

	getSubscriber = async (email: string) => {
        const requestData = {
            "emails": [
                email
              ]
          };
        const clientRequest: ClientRequest = {
            method: 'POST',
            url: '/v3/marketing/contacts/search/emails',
            body: requestData,
        }
        try {
            const [,body] = await this.request(clientRequest);
            const contact: SendgridContactType = body.result[email].contact;
            for(let i = 0; i < contact.list_ids.length; ++i) {
                if (contact.list_ids[i] === this.listId) {
                    if (await this.#isSuppressed(email)) {
                        return {...contact, status: 'unsubscribed'} as SendgridContactType
                    } else {
                        return {...contact, status: 'subscribed'} as SendgridContactType
                    }
                }
            }
            return null;
        } catch (e: any) {
            if (e.code === 404) {
                return null;
            } else {
                throw new Error(e);
            }
        }
    }

    upsertSubscription = async (data: NewsletterSubscriptionData) => {
        try {
            const contact: SendgridContactType | null = await this.getSubscriber(data.email);
            if (contact == null) {
                this.#addSubscription(data);
            }

            if (data.status === 'subscribed') {
                if (await this.#isSuppressed(data.email)) {
                    this.#removeSuppression(data.email);
                }
            } else {
                if (!(await this.#isSuppressed(data.email))) {
                    this.#addSuppression(data.email);
                }
            }

        } catch {

        }		
	};

    #addSubscription = async (data: NewsletterSubscriptionData) => {
        const requestData = {
            "list_ids" : [this.listId],
            "contacts": [
              {
                "email": data.email,  
                "first_name": data.firstname ?? '',
                "last_name": data.lastname ?? '',
                "country": data.country ?? '',
                "custom_fields": {
                    "status": data.status,
                    "language" : data.language ?? 'en',
                    "source": data.source ?? 'subscriber',
                }
              }
            ]
          };
          
        const clientRequest:ClientRequest = {
            url: `/v3/marketing/contacts`,
            method: 'PUT',
            body: requestData
        }
        try {
            await this.request(clientRequest);
            return
        } catch(e: any) {
            throw new Error(e);
        }
        
    }

    #isSuppressed = async (email: string) => {
        const request:ClientRequest = {
          url: `/v3/asm/suppressions/${email}`,
          method: 'GET',
        }
        try {
            const [,body] = await this.request(request);
            console.log(body);
            for(let i = 0; i < body.suppressions.length; ++i) {
                if (body.suppressions[i].id.toString() === this.suppressionListId && body.suppressions[i].suppressed) {
                    return true
                }
            }
            return false;
        } catch(e: any) {
            return false;
        }
        
    }

    #removeSuppression = async (email : string) => {
        const request: ClientRequest = {
            url: `/v3/asm/groups/${this.suppressionListId}/suppressions/${email}`,
            method: 'DELETE',
          }

          try {
            const response = await this.request(request);
            console.log(response);
            return
        } catch(e: any) {
            throw new Error(e);
        }
    }

    #addSuppression = async (email: string) => {
        const data = {
        "recipient_emails": [
            email
        ]
        };

        const request: ClientRequest = {
            url: `/v3/asm/groups/${this.suppressionListId}/suppressions`,
            method: 'POST',
            body: data
        }
        try {
            await this.request(request);
            return
        } catch(e: any) {
            throw new Error(e);
        }
    }
}