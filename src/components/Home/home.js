import React, { useEffect, useState } from 'react';
import { Typography, Layout, Button, Row, Col, notification } from 'antd';
import lottery from '../../contract/lottery';
import web3 from '../../contract/web3';
import { FaEthereum, FaLinkedin } from 'react-icons/fa';

const { Paragraph, Text } = Typography;
const { Header, Footer, Content } = Layout;

const Home = () => {
  const [managerAddress, setManagerAddress] = useState('');
  const [totalFunds, setTotalFunds] = useState(0);
  const [players, setPlayers] = useState([]);
  const [isJoining, setIsJoining] = useState(false);
  const [isEndingRound, setIsEndingRound] = useState(false);
  const [defalutAccount, setDefalutAccount] = useState([]);

  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    (async () => {
      try {
        setManagerAddress(await lottery.methods.manager().call());
        setTotalFunds(
          web3.utils.fromWei(
            await lottery.methods.currentFunds().call(),
            'ether'
          )
        );
        setPlayers(await lottery.methods.getPlayers().call());
        setDefalutAccount(await web3.eth.getAccounts());
      } catch (err) {}
    })();
  }, []);

  const handleEndRound = async () => {
    setIsEndingRound(true);
    await lottery.methods
      .pickWinner()
      .send({
        from: defalutAccount[0],
      })
      .on('confirmation', async (confirmationNumber, receipt) => {
        if (confirmationNumber === 0 && receipt.status) {
          notify(
            'success',
            `Round Ended 🤩\n and your TxHash is: ${receipt.transactionHash}`
          );
          setTotalFunds(
            web3.utils.fromWei(
              await lottery.methods.currentFunds().call(),
              'ether'
            )
          );
          setPlayers(await lottery.methods.getPlayers().call());
        }
        setIsEndingRound(false);
      })
      .on('error', (error, recipet) => {
        notify('error', 'Ending Round Failed 😰');
        setIsEndingRound(false);
      });
  };

  const handleJoining = async () => {
    setIsJoining(true);
    await lottery.methods
      .enter()
      .send({
        from: defalutAccount[0],
        value: web3.utils.toWei('0.011', 'ether'),
      })
      .on('transactionHash', (hash) => {
        notify('info', 'Transaction Sent Waiting for Confirmation');
        setIsJoining(false);
      })
      .on('confirmation', async (confirmationNumber, receipt) => {
        if (confirmationNumber === 0 && receipt.status) {
          notify(
            'success',
            `Transaction confirmed Successfully 🤩\n and your TxHash is: ${receipt.transactionHash}`
          );
          setTotalFunds(
            web3.utils.fromWei(
              await lottery.methods.currentFunds().call(),
              'ether'
            )
          );
          setPlayers(await lottery.methods.getPlayers().call());
        }
      })
      .on('error', (error, receipt) => {
        notify('error', 'Transaction Failed 😰');
      });
  };

  const notify = (severity, text) => {
    api[severity]({
      message: text,
      placement: 'topRight',
    });
  };

  return (
    <>
      {contextHolder}
      <Layout>
        <Header
          style={{ textAlign: 'center', color: 'whitesmoke', fontSize: '2em' }}
        >
          Lottery Contract
        </Header>
        <Content>
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
            <Col className='gutter-row' span={1} />
            <Col className='gutter-row' span={10}>
              <Paragraph>
                The Manager of This Contract is:{' '}
                <Text mark copyable>
                  {managerAddress}
                </Text>
              </Paragraph>
            </Col>
          </Row>

          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
            <Col className='gutter-row' span={1}></Col>
            <Col className='gutter-row' span={6}>
              <Paragraph>
                The are <Text mark>{players.length}</Text> Players Competing on
                Reward of <Text mark>{totalFunds} ether</Text>
                &nbsp;
                <FaEthereum />
              </Paragraph>
            </Col>
          </Row>

          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
            <Col className='gutter-row' span={1}></Col>
            <Col className='gutter-row' span={11}>
              <Paragraph>
                You Can Enter the Lottery Now and Compete &nbsp;&nbsp;
                <Button
                  type='primary'
                  shape='round'
                  loading={isJoining}
                  onClick={handleJoining}
                >
                  Enter for 0.011 Ether &nbsp;
                  <FaEthereum />
                </Button>
              </Paragraph>
            </Col>
          </Row>

          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
            <Col className='gutter-row' span={1}></Col>
            <Col className='gutter-row' span={10}>
              <Paragraph>
                End this Round and Start New One&nbsp;&nbsp;
                <Button
                  type='primary'
                  danger
                  loading={isEndingRound}
                  onClick={handleEndRound}
                >
                  End Current Round
                </Button>
              </Paragraph>
            </Col>
          </Row>
        </Content>
        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
          <Col className='gutter-row' span={12}>
            <Footer
              style={{
                textAlign: 'center',
                position: 'fixed',
                bottom: 0,
                width: '100%',
              }}
            >
              Made with Love By Assem{' '}
              <a
                target='_blank'
                href='https://www.linkedin.com/in/mohamedosamaassem/'
                rel='noreferrer'
              >
                <FaLinkedin size={20} />
              </a>
            </Footer>
          </Col>
        </Row>
      </Layout>
    </>
  );
};

export default Home;
