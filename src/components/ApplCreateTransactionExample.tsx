import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

import React, { FormEvent, useContext, useState } from "react";
import { Button, Col, Form, Label, Nav, NavItem, NavLink, Row, TabContent, TabPane } from "reactstrap";
import PreLoadDataContextComponent, { PreLoadDataContext } from '../context/preLoadedData';
import PrismCode from './commons/Code';
import SenderDropdown from "./commons/FromDropdown";
import Integer from "./commons/Integer";
import "./interactive-examples.scss";

const codeV1 = `
import algosdk from "algosdk";
import MyAlgoConnect from '@randlabs/myalgo-connect';
 
const algodClient = new algosdk.Algodv2("",'https://api.testnet.algoexplorer.io', '');
const params = await algodClient.getTransactionParams().do();

const txn = {
    ...params,
    type: "appl",
    from: sender,
    appLocalByteSlices: 4,
    appGlobalByteSlices: 2,
    appLocalInts: 0,
    appGlobalInts: 2,
    appApprovalProgram: new Uint8Array(Buffer.from("AiADAAEFIjEYEkEAAiNDMRkkEg==", "base64")),
    appClearProgram: new Uint8Array(Buffer.from("AiABASJD", "base64")),
    appOnComplete: 0,
}

const myAlgoConnect = new MyAlgoConnect();
const signedTxn = await myAlgoConnect.signTransaction(txn);
`;

const codeV2 = `
import algosdk from "algosdk";
import MyAlgoConnect from '@randlabs/myalgo-connect';
 
const algodClient = new algosdk.Algodv2("",'https://api.testnet.algoexplorer.io', '');
const params = await algodClient.getTransactionParams().do();

const txn = algosdk.makeApplicationCreateTxnFromObject({
    suggestedParams: {
        ...params,
    },
    from: sender,
    numLocalByteSlices: 4,
    numGlobalByteSlices: 2,
    numLocalInts: 0,
    numGlobalInts: 2,
    approvalProgram: new Uint8Array(Buffer.from("AiADAAEFIjEYEkEAAiNDMRkkEg==", "base64")),
    clearProgram: new Uint8Array(Buffer.from("AiABASJD", "base64")),
    onComplete: 0,
});

const myAlgoConnect = new MyAlgoConnect();
const signedTxn = await myAlgoConnect.signTransaction(txn.toByte());
`;

function ApplCreateTransactionExample(): JSX.Element {
    const preLoadedData = useContext(PreLoadDataContext);
    const accounts = ExecutionEnvironment.canUseDOM && window.sharedAccounts && Array.isArray(window.sharedAccounts) ? window.sharedAccounts : [];
    const [localInt, setLocalInt] = useState(0);
    const [globalInt, setGlobalInt] = useState(0);
    const [localBytes, setLocalBytes] = useState(0);
    const [globalBytes, setGlobalBytes] = useState(0);
    const [accountSelected, selectAccount] = useState("");
    const [response, setResponse] = useState();
    const [activeTab, setActiveTab] = useState('1');

    const toggle = (tab: React.SetStateAction<string>) => {
        if (activeTab !== tab) setActiveTab(tab);
    }

    const onSubmitCreateAppl = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();

        try {
            if (accounts.length === 0) return;

            const params = {
                fee: 1000,
                firstRound: 15249878,
                flatFee: false,
                genesisHash: "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=",
                genesisID: "testnet-v1.0",
                lastRound: 15250878,
            }

            const txn = preLoadedData.algosdk.makeApplicationCreateTxnFromObject({
                suggestedParams: {
                    ...params,
                    fee: 1000,
                    flatFee: true,
                },
                from: accountSelected,
                numLocalByteSlices: localBytes || 0,
                numGlobalByteSlices: globalBytes || 0,
                numLocalInts: localInt || 0,
                numGlobalInts: globalInt || 0,
                approvalProgram: new Uint8Array(Buffer.from("AiADAAEFIjEYEkEAAiNDMRkkEg==", "base64")),
                clearProgram: new Uint8Array(Buffer.from("AiABASJD", "base64")),
                onComplete: 0,
            });

            const signedTxn = await preLoadedData.myAlgoWallet.signTransaction(txn.toByte());

            setResponse(signedTxn);
        }
        catch (err) {
            console.error(err);
            setResponse(err.message);
        }
    }

    return (
        <div className="interactive-example">
            <Nav tabs>
                <NavItem>
                    <NavLink
                        className={activeTab === '1' ? "active active-tab" : ""}
                        onClick={() => { toggle('1'); }}>
                        Form
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink
                        className={activeTab === '2' ? "active active-tab" : ""}
                        onClick={() => { toggle('2'); }}>
                        Code
                </NavLink>
                </NavItem>
            </Nav>
            <TabContent activeTab={activeTab}>
                <TabPane tabId="1">
                    <Row className="mt-3">
                        <Col xs="12" lg="6" className="mt-2">
                            <Form id="payment-tx" onSubmit={onSubmitCreateAppl}>
                                <SenderDropdown onSelectSender={selectAccount} accounts={accounts} />
                                <Integer label="Local Bytes" onChangeNumber={setLocalBytes} />
                                <Integer label="Global Bytes" onChangeNumber={setGlobalBytes} />
                                <Integer label="Local Int" onChangeNumber={setLocalInt} />
                                <Integer label="Global Int" onChangeNumber={setGlobalInt} />
                                <Button color="primary" block type="submit" className="mt-2" disabled={accounts.length === 0}>
                                    Submit
                                </Button>
                            </Form>
                        </Col>
                        <Col xs="12" lg="6" className="mt-2 mt-xs-2">
                            <Label className="tx-label">
                                signTransaction() Response
                            </Label>
                            <div className="txn-appl-create-response">
                                <PrismCode
                                    code={response ? JSON.stringify(response, null, 1) : ""}
                                    language="js"
                                    plugins={["response"]}
                                />
                            </div>
                            <Button
                                className="button-margin"
                                color="primary"
                                block
                                disabled={!response}
                                onClick={() => setResponse("")}>
                                Clear Method Response
                            </Button>
                        </Col>
                    </Row>
                    {accounts.length === 0 &&
                        <div className="error-connect mt-3"> In order to run this example, you need to execute connect() method. </div>
                    }
                </TabPane>
                <TabPane tabId="2">
                    <div className="mt-4"> The following codes allow you to create and sent to MyAlgo Connect an application transaction to be sign by the user. There are two alternatives to create it. Pick the one you prefere.</div>
                    <Row className="mt-3">
                        <Col>
                            <Label className="tx-label">
                                Using Algosdk (Recommended)
                            </Label>
                            <PrismCode
                                code={codeV2}
                                language="js"
                            />
                        </Col>
                        <Col className="mt-4">
                            <Label className="tx-label">
                                Another alternative
                            </Label>
                            <PrismCode
                                code={codeV1}
                                language="js"
                            />
                        </Col>
                    </Row>
                </TabPane>
            </TabContent>
        </div>
    )
}

export default () => <PreLoadDataContextComponent><ApplCreateTransactionExample /></PreLoadDataContextComponent>;