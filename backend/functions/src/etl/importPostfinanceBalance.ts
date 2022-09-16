import * as functions from "firebase-functions";

import imaps from "imap-simple";

import _ from "lodash";

import { simpleParser, Source } from "mailparser";
import { POSTFINANCE_EMAIL_PASSWORD, POSTFINANCE_EMAIL_USER } from "../config";

import * as bankBalance from "../interfaces/collections/bankBalances";
import { createDoc } from "../useFirestoreAdmin";

/**
 * Function periodically connects to the gmail account where we send the postfinance balance statements,
 * parses the emails and stores the current balances into firestore.
 */
export const importBalanceMailFunc = functions.pubsub.schedule("0 * * * *").onRun(async () => {
  const balances = await retrieveBalanceMails();
  await storeBalances(balances);
});

export const retrieveBalanceMails = async (): Promise<bankBalance.BankBalance[]> => {
  try {
    functions.logger.info("Start checking balance inbox");
    const config = {
      imap: {
        user: POSTFINANCE_EMAIL_USER,
        password: POSTFINANCE_EMAIL_PASSWORD,
        host: "imap.gmail.com",
        port: 993,
        tls: true,
        tlsOptions: {
          rejectUnauthorized: false,
        },
        authTimeout: 10000,
      },
    };
    const connection = await imaps.connect(config);
    await connection.openBox("INBOX");
    functions.logger.info("Connected to inbox");
    const messages = await connection.search(searchCriteria, fetchOptions);
    const balances = await Promise.all(
      messages.map(async (item) => {
        const all = _.find(item.parts, { which: "" });
        const id = item.attributes.uid;
        const idHeader = "Imap-Id: " + id + "\r\n";
        const source = idHeader + all?.body;
        return parseEmail(source);
      })
    );
    connection.end();
    functions.logger.info("Retrieved balances");
    return balances.flat();
  } catch (error) {
    functions.logger.error("Could not ingest balance mails", error);
    return [];
  }
};

export const parseEmail = async (source: Source): Promise<bankBalance.BankBalance[]> => {
  const mail = await simpleParser(source);
  if (!mail || !mail.html) return [];
  try {
    return [
      {
        timestamp: mail.date!.getTime() / 1000,
        account: mail.html.match(accountRegex)!.groups!["account"].toLowerCase(),
        balance: Number.parseFloat(mail.html.match(balanceRegex)!.groups!["balance"].replace("’", "")),
        currency: "CHF",
      } as bankBalance.BankBalance,
    ];
  } catch {
    functions.logger.info(`Could not parse email with subject ${mail.subject}`);
    return [];
  }
};

export const storeBalances = async (balances: bankBalance.BankBalance[]): Promise<void> => {
  for await (const balance of balances) {
    await createDoc<bankBalance.BankBalance>(bankBalance.path, bankBalance.id(balance)).set(balance);
  }
};

// we retrieve only unseen mails and mark them as seen once we imported the balance
const searchCriteria = ["UNSEEN"];
const fetchOptions = {
  bodies: ["HEADER", "TEXT", ""],
  markSeen: true,
};

const balanceRegex = /balance: CHF (?<balance>[0-9’.]*)/; // regex to retrieve the balance from the email
const accountRegex = /(?<=account\W)(?<account>.*?)(?=\W)/; // regex to retrieve the account name from the email
