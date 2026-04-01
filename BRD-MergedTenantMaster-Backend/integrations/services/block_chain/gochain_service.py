from web3 import Web3


class GoChainService:

    RPC_URL = "https://ethereum-mainnet.core.chainstack.com/1c2dd4e6bc12f394c96f23811fdb764b"

    @classmethod
    def _connect(cls):
        return Web3(Web3.HTTPProvider(cls.RPC_URL))

    @classmethod
    def get_block_number(cls):
        web3 = cls._connect()

        if not web3.is_connected():
            return {
                "status": "error",
                "message": "Unable to connect to Ethereum"
            }

        return {
            "status": "success",
            "block_number": web3.eth.block_number
        }

    @classmethod
    def get_balance(cls, wallet_address):
        web3 = cls._connect()

        if not web3.is_connected():
            return {
                "status": "error",
                "message": "Unable to connect to Ethereum"
            }

        try:
            balance = web3.eth.get_balance(wallet_address)
            eth_balance = web3.from_wei(balance, 'ether')

            return {
                "status": "success",
                "wallet": wallet_address,
                "balance_eth": str(eth_balance)
            }

        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }